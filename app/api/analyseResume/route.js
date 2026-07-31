import { calculateReadabilityAndQuality, cleanExtractedText, parseFileText } from "@/utility/serverUtil/ParserEngine";
import { redis, REDIS_STATUS_KEY } from "@/utility/serverUtil/RedisConfig";
import { isValidResume } from "@/utility/serverUtil/ResumeEngine";
import { hasConfiguredAIProvider } from "@/utility/serverUtil/AIEngine";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('resume') || formData.get('file');
        const resumeText = formData.get('resumeText') || '';

        const fileName = typeof file?.name === 'string' ? file.name.toLowerCase() : '';
        const validFile = Boolean(file && fileName && (
            fileName.endsWith('.pdf') ||
            fileName.endsWith('.docx') ||
            fileName.endsWith('.doc')
        ));

        if (!validFile && resumeText.trim().length < 50) {
            return NextResponse.json({ error: "Provide a valid resume." }, { status: 400 });
        }

        let resumeData = '';
        let resumeQuality = null;

        if (file) {
            const { text, quality } = await parseFileText(file);
            resumeData = text;
            resumeQuality = quality;
        } else {
            resumeData = await cleanExtractedText(resumeText);
            resumeQuality = await calculateReadabilityAndQuality(resumeText);
        }

        if(!isValidResume(resumeData)){
            return NextResponse.json({error:"Invalid resume document detected."},{status: 400});
        }

        // Generate unique 12-character uppercase task ID
        const taskId = (
            Math.random().toString(36).substring(2, 8) +
            Math.random().toString(36).substring(2, 8)
        ).toUpperCase();


        // Stores initial status in Redis Cache
        await redis.set(`${REDIS_STATUS_KEY}:${taskId}`, "PENDING", 'EX', 2700);

        // Do not enqueue work when the server cannot call an AI provider.
        // This guard also protects against a stale hot-reloaded stream listener.
        if (!hasConfiguredAIProvider()) {
            const error = "No Gemini API keys configured. Set GEMINI_API_KEYS in .env and restart the server.";
            console.error(`[AI Engine] Analysis failed for ${taskId}: ${error}`);
            await redis.set(`task:error:${taskId}`, error, 'EX', 2700);
            await redis.set(`${REDIS_STATUS_KEY}:${taskId}`, "FAILED", 'EX', 2700);
            return NextResponse.json({ taskId }, { status: 200 });
        }

        // 2. Publish event to Redis Stream for AI Engine consumer
        // Redis stream values must be key-value pairs (strings)
        await redis.xadd(
            'resume_processing_stream',
            '*',
            'taskId', 
            taskId,
            'resumeData', typeof resumeData === 'string' ? resumeData : JSON.stringify(resumeData),
            'resumeQuality', JSON.stringify(resumeQuality ?? {})
        );

        return NextResponse.json({ taskId}, { status: 200 });

    } catch (error) {
        console.error("Error reading resume:", error);
        return NextResponse.json({ error: "Error processing resume." }, { status: 500 });
    }
}
