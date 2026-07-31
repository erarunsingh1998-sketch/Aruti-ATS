"use server";

import { NextResponse } from "next/server";

const OCR_ENDPOINT = 'https://api.ocr.space/parse/image';
const MIN_TEXT_LENGTH = 20;
const OCR_API_KEY = process.env.OCR_SPACE_API_KEY;

export async function extractScannedPdfText(file, fileName) {
    if (!OCR_API_KEY || OCR_API_KEY.trim().length === 0) {
        throw new Error('OCR API key not configured.');
    }

    try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const formData = new FormData();
        const blob = new Blob([buffer], { type: file.type || 'application/pdf' });
        
        formData.append('file', blob, fileName || 'document.pdf');
        formData.append('apikey', OCR_API_KEY);
        formData.append('language', 'eng');
        formData.append('isOverlayRequired', 'false');
        formData.append('filetype', 'PDF');
        formData.append('detectOrientation', 'true');
        formData.append('isCreateSearchablePdf', 'false');
        formData.append('isTable', 'true');

        const response = await fetch(OCR_ENDPOINT, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`OCR.space API HTTP error: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.IsErroredOnProcessing) {
            const errorMessage = Array.isArray(data.ErrorMessage) 
                ? data.ErrorMessage.join(', ') 
                : data.ErrorMessage;
            throw new Error(`OCR Processing Error: ${errorMessage}`);
        }

        let rawOcrText = "";
        if (data.ParsedResults && Array.isArray(data.ParsedResults)) {
            rawOcrText = data.ParsedResults
                .map(result => result.ParsedText || '')
                .join('\n');
        }

        return rawOcrText;

    } catch (error) {
        console.error('Error during OCR processing:', error);
        return NextResponse.json({error:"error performing OCR"},{status:500});
    }
}