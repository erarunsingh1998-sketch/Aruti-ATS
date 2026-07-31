"use server";
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { extractScannedPdfText } from './OCREngine';

if (typeof window === "undefined") {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `pdfjs-dist/legacy/build/pdf.worker.mjs`;
}

export async function parseFileText(file) {
    if (file.name.endsWith('.pdf')) {
        return parsePdfText(file);
    }
    return parseDocText(file);
}

async function parsePdfText(pdfFile) {
    const arrayBuffer = await pdfFile.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);
    const pdf = await pdfjsLib.getDocument({ data }).promise;

    let rawText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();

        // Preserve line breaks using items layout position (hasEOL flag or space padding)
        let pageLines = [];
        let currentLine = "";

        for (const item of content.items) {
            currentLine += item.str + " ";
            // item.hasEOL signals end of line in PDF streams
            if (item.hasEOL) {
                pageLines.push(currentLine.trim());
                currentLine = "";
            }
        }
        
        if (currentLine.trim().length > 0) {
            pageLines.push(currentLine.trim());
        }

        // Join items into well-defined line breaks
        rawText += pageLines.join('\n') + '\n';
    }

    // Sanitize the PDF output
    rawText = await cleanExtractedText(rawText);

    // Run OCR fallback if extracted text is empty or too short
    if (rawText.length < 50) {
        console.info('Native PDF extraction yielded minimal text. Running OCR fallback...');
        const ocrText = await extractScannedPdfText(pdfFile, pdfFile.name);
        rawText = await cleanExtractedText(ocrText);
    }

    const qualityMetrics = await calculateReadabilityAndQuality(rawText);

    return { text: rawText, quality: qualityMetrics };
}

async function parseDocText(docFile) {
    const docBuffer = await docFile.arrayBuffer();
    const buffer = Buffer.from(docBuffer);

    const result = await mammoth.extractRawText({ buffer });

    if (result.messages && result.messages.length > 0) {
        console.warn("Mammoth extraction warnings:", result.messages);
    }

    // Clean Word document text output
    let rawText = await cleanExtractedText(result.value || "");

    if (rawText.length < 50) {
        return { 
            text: "", 
            quality: { parseScore: 0, readabilityScore: 0, combinedScore: 0 } 
        };
    }

    const qualityMetrics = await calculateReadabilityAndQuality(rawText);

    return { text: rawText, quality: qualityMetrics };
}

/**
 * Universal Text Sanitizer
 * Strips \r, \t, zero-width characters, and normalizes spacing & newlines.
 */
export async function cleanExtractedText(text) {
    if (!text) return "";

    return text
        // 1. Replace tab characters and carriage returns with clean single spaces
        .replace(/[\r\t\f\v]/g, ' ')
        // 2. Remove non-printable / zero-width characters
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        // 3. Compress multiple consecutive horizontal spaces into a single space
        .replace(/[^\S\n]+/g, ' ')
        // 4. Compress 3 or more consecutive newlines into double newlines (clean paragraphs)
        .replace(/\n{3,}/g, '\n\n')
        // 5. Trim whitespace from start and end of each line
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0) // Remove empty lines
        .join('\n');
}

/**
 * Calculates extraction quality and ATS format friendliness.
 */
export async function calculateReadabilityAndQuality(text) {
    const cleanText = text.trim();
    if (!cleanText) return { parseScore: 0, readabilityScore: 0, combinedScore: 0 };

    const validCharCount = (cleanText.match(/[a-zA-Z0-9\s.,!?'"\-():;@\/|•]/g) || []).length;
    const totalCharCount = cleanText.length;
    const parseScore = Math.min(Math.round((validCharCount / totalCharCount) * 100), 100);

    const sentences = cleanText
        .split(/[\n.!?•|\–\—]+/)
        .map(s => s.trim())
        .filter(s => s.length > 3);

    const words = cleanText.match(/\b[a-zA-Z0-9'-]+\b/g) || [];

    let readabilityScore = 0;
    if (words.length > 0 && sentences.length > 0) {
        const avgWordsPerSentence = words.length / sentences.length;

        if (avgWordsPerSentence >= 6 && avgWordsPerSentence <= 18) {
            readabilityScore = 95; 
        } else if (avgWordsPerSentence < 6) {
            readabilityScore = 75;
        } else {
            readabilityScore = Math.max(30, Math.round(100 - (avgWordsPerSentence - 18) * 3));
        }
    }

    const combinedScore = Math.round((parseScore * 0.7) + (readabilityScore * 0.3));

    return {
        parseScore,
        readabilityScore,
        combinedScore,
        wordCount: words.length,
        sentenceCount: sentences.length
    };
}