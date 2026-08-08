import fs from 'fs/promises';
import path from 'path';
import { redis, REDIS_STATUS_KEY } from "@/utility/serverUtil/RedisConfig";
import { isValidResume } from "@/utility/serverUtil/ResumeEngine";
import { hasConfiguredAIProvider } from "@/utility/serverUtil/AIEngine";
import { NextResponse } from "next/server";

const TASK_STORAGE_ROOT = path.join(process.cwd(), 'resume-tasks');

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('resume') || formData.get('file');
        const resumeText = String(formData.get('resumeText') || '').trim();

        const fileName = typeof file?.name === 'string' ? file.name.toLowerCase() : '';
        const validFile = Boolean(file && fileName && (
            fileName.endsWith('.pdf') ||
            fileName.endsWith('.docx') ||
            fileName.endsWith('.doc')
        ));

        if (!validFile && resumeText.length < 50) {
            return NextResponse.json({ error: "Provide a valid resume." }, { status: 400 });
        }

        const taskId = (
            Math.random().toString(36).substring(2, 8) +
            Math.random().toString(36).substring(2, 8)
        ).toUpperCase();

        const taskFolder = path.join(TASK_STORAGE_ROOT, taskId);
        await fs.mkdir(taskFolder, { recursive: true });

        let fileNameStored = null;
        if (validFile && file) {
            fileNameStored = file.name;
            const fileBuffer = Buffer.from(await file.arrayBuffer());
            const targetFile = path.join(taskFolder, fileNameStored);
            await fs.writeFile(targetFile, fileBuffer);
        } else {
            const targetFile = path.join(taskFolder, 'resume.txt');
            await fs.writeFile(targetFile, resumeText, 'utf-8');
        }

        await redis.set(`${REDIS_STATUS_KEY}:${taskId}`, "PARSING", 'EX', 2700);

        if (!hasConfiguredAIProvider()) {
            const error = "No Gemini API keys configured. Set GEMINI_API_KEYS in .env and restart the server.";
            console.error(`[AI Engine] Analysis failed for ${taskId}: ${error}`);
            await redis.set(`task:error:${taskId}`, error, 'EX', 2700);
            await redis.set(`${REDIS_STATUS_KEY}:${taskId}`, "FAILED", 'EX', 2700);
            return NextResponse.json({ taskId }, { status: 200 });
        }

        const streamFields = ['taskId', taskId, 'taskFolder', taskFolder];
        if (fileNameStored) {
            streamFields.push('fileName', fileNameStored);
        } else {
            streamFields.push('resumeText', resumeText);
        }

        await redis.xadd('resume_processing_stream', '*', ...streamFields);

        return NextResponse.json({ taskId }, { status: 200 });

    } catch (error) {
        console.error("Error reading resume:", error);
        return NextResponse.json({ error: "Error processing resume." }, { status: 500 });
    }
}
