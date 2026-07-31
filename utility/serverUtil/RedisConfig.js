import Redis from "ioredis";
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

                const taskId = data.taskId;
                const resumeData = data.resumeData;
                let resumeQuality = null;

                try {
                    resumeQuality = data.resumeQuality ? JSON.parse(data.resumeQuality) : null;
                } catch {
                    resumeQuality = data.resumeQuality;
                }

                // Update Status Cache to PROCESSING
                await redis.set(`${REDIS_STATUS_KEY}:${taskId}`, "PROCESSING", 'EX', 2700);

                await procsessATSByAI(taskId, resumeData, resumeQuality, redis);

                await subscriber.xack(STREAM_NAME, CONSUMER_GROUP, messageId);
            }
        } catch (error) {
            console.error("[Redis Stream] Listener error:", error);
            // Wait 2 seconds before retrying on failure to avoid tight loop execution
            await new Promise((res) => setTimeout(res, 2000));
        }
    }
}

// Ensure the listener starts only once (avoids duplication on hot reload)
// Replace lines 95-101 with:
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';
const isVercelServerless = process.env.VERCEL === '1';

if (!globalForRedis.isStreamListenerRunning && !isBuildPhase && !isVercelServerless) {
  globalForRedis.isStreamListenerRunning = true;
  startStreamListener().catch((err) => {
    console.error("[Redis Stream] Failed to start listener:", err);
  });
}
