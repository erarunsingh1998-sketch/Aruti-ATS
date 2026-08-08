import fs from "fs/promises";
import path from "path";
import Redis from "ioredis";
import { calculateReadabilityAndQuality, cleanExtractedText, parseFileText } from "@/utility/serverUtil/ParserEngine";
import { isValidResume } from "@/utility/serverUtil/ResumeEngine";
import { procsessATSByAI } from "./AIEngine";

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
export const REDIS_STATUS_KEY="task:status";

const createRedisInstance = () => {
    return new Redis(REDIS_URL, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false
    });
};

// Singleton pattern for Next.js hot-reloading
const globalForRedis = globalThis;

export const redis = globalForRedis.redis || createRedisInstance();
if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;

export const createDedicatedRedis = () => createRedisInstance();

// ==========================================
// REDIS STREAM LISTENER (Consumer Service)
// ==========================================

const STREAM_NAME = 'resume_processing_stream';
const CONSUMER_GROUP = 'ai_processing_group';
const CONSUMER_NAME = `consumer_${process.env.NODE_ENV || 'dev'}_${Math.random().toString(36).substring(2, 6)}`;

/**
 * Initializes consumer group and starts listening to the stream
 */
async function startStreamListener() {
    const subscriber = createDedicatedRedis();

    // 1. Ensure Consumer Group exists
    try {
        await subscriber.xgroup('CREATE', STREAM_NAME, CONSUMER_GROUP, '0', 'MKSTREAM');
        console.log(`[Redis Stream] Created Consumer Group: ${CONSUMER_GROUP}`);
    } catch (err) {
        // BUSYGROUP error means group already exists, which is expected
        if (!err.message.includes('BUSYGROUP')) {
            console.error('[Redis Stream] Error setting up consumer group:', err);
        }
    }

    console.log(`[Redis Stream] Listening for messages as ${CONSUMER_NAME}...`);

    // 2. Infinite poll loop using blocking XREADGROUP
    while (true) {
        try {
            // Block for up to 5000ms waiting for new messages ('>' gets unread messages)
            const response = await subscriber.xreadgroup(
                'GROUP', CONSUMER_GROUP, CONSUMER_NAME,
                'BLOCK', 5000,
                'COUNT', 1,
                'STREAMS', STREAM_NAME, '>'
            );

            if (!response) continue;

            const [stream, messages] = response[0];

            for (const [messageId, fields] of messages) {
                // Parse key-value pairs array into a JS object
                const data = {};
                for (let i = 0; i < fields.length; i += 2) {
                    data[fields[i]] = fields[i + 1];
                }

                const taskId = typeof data.taskId === 'string' ? data.taskId : '';
                const taskFolder = typeof data.taskFolder === 'string' ? data.taskFolder : '';
                const fileName = typeof data.fileName === 'string' ? data.fileName : '';
                let resumeData = null;
                let resumeQuality = null;

                try {
                    if (!taskId || !taskFolder) {
                        throw new Error('Missing task metadata in stream event.');
                    }

                    await redis.set(`${REDIS_STATUS_KEY}:${taskId}`, "PARSING", 'EX', 2700);

                    if (fileName) {
                        const filePath = path.join(taskFolder, fileName);
                        const fileBuffer = await fs.readFile(filePath);
                        const fileObject = {
                            name: fileName,
                            arrayBuffer: async () => fileBuffer.buffer.slice(fileBuffer.byteOffset, fileBuffer.byteOffset + fileBuffer.byteLength),
                        };

                        const parsed = await parseFileText(fileObject);
                        resumeData = parsed?.text ?? '';
                        resumeQuality = parsed?.quality ?? null;

                        await fs.rm(taskFolder, { recursive: true, force: true });
                    } else if (typeof data.resumeText === 'string' && data.resumeText.trim()) {
                        resumeData = await cleanExtractedText(data.resumeText);
                        resumeQuality = await calculateReadabilityAndQuality(resumeData);
                    } else {
                        const files = await fs.readdir(taskFolder);
                        const candidate = files.find((name) => /\.(pdf|docx|doc|txt)$/i.test(name));
                        if (candidate) {
                            const filePath = path.join(taskFolder, candidate);
                            if (/\.txt$/i.test(candidate)) {
                                const rawText = await fs.readFile(filePath, 'utf-8');
                                resumeData = await cleanExtractedText(rawText);
                                resumeQuality = await calculateReadabilityAndQuality(resumeData);
                            } else {
                                const fileBuffer = await fs.readFile(filePath);
                                const fileObject = {
                                    name: candidate,
                                    arrayBuffer: async () => fileBuffer.buffer.slice(fileBuffer.byteOffset, fileBuffer.byteOffset + fileBuffer.byteLength),
                                };

                                const parsed = await parseFileText(fileObject);
                                resumeData = parsed?.text ?? '';
                                resumeQuality = parsed?.quality ?? null;
                            }
                            await fs.rm(taskFolder, { recursive: true, force: true });
                        }
                    }

                    if (!resumeData || !isValidResume(resumeData)) {
                        throw new Error('Invalid or missing resume document.');
                    }

                    await redis.set(`${REDIS_STATUS_KEY}:${taskId}`, "ANALYSING", 'EX', 2700);
                    await procsessATSByAI(taskId, resumeData, resumeQuality, redis);
                } catch (error) {
                    console.error(`[Redis Stream] Failed task ${taskId}:`, error);
                    if (taskId) {
                        await redis.set(`task:error:${taskId}`, error.message || 'AI analysis failed.', 'EX', 2700);
                        await redis.set(`${REDIS_STATUS_KEY}:${taskId}`, "FAILED", 'EX', 2700);
                    }
                    await fs.rm(taskFolder, { recursive: true, force: true });
                } finally {
                    await subscriber.xack(STREAM_NAME, CONSUMER_GROUP, messageId);
                }
            }
        } catch (error) {
            console.error("[Redis Stream] Listener error:", error);
            // Wait 2 seconds before retrying on failure to avoid tight loop execution
            await new Promise((res) => setTimeout(res, 2000));
        }
    }
}

// Ensure the listener starts only once (avoids duplication on hot reload)
if (!globalForRedis.isStreamListenerRunning) {
    globalForRedis.isStreamListenerRunning = true;
    startStreamListener().catch((err) => {
        console.error("[Redis Stream] Failed to start listener:", err);
    });
}
