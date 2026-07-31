import { NextResponse } from "next/server";
import { redis, REDIS_STATUS_KEY } from "@/utility/serverUtil/RedisConfig";


export async function GET(request) {
    const url = new URL(request.url);
    const taskId = url.searchParams.get('taskId');

    if(!taskId){
        return NextResponse.json({error:"No taskId provided"},{status:400});
    }

    const taskStatus = await redis.get(`${REDIS_STATUS_KEY}:${taskId}`);
    if (!taskStatus) return NextResponse.json({ error: "Analysis task not found or expired." }, { status: 404 });

    if (taskStatus === "READY") {
        const rawResult = await redis.get(`task:result:${taskId}`);
        if (!rawResult) return NextResponse.json({ taskStatus: "PROCESSING" }, { status: 200 });
        return NextResponse.json({ taskStatus: "READY", result: JSON.parse(rawResult) }, { status: 200 });
    }

    if (taskStatus === "FAILED") {
        const error = await redis.get(`task:error:${taskId}`);
        return NextResponse.json({
            taskStatus: "FAILED",
            error: error || "AI analysis failed. Please try again later.",
        }, { status: 200 });
    }

    return NextResponse.json({ taskStatus: taskStatus.toUpperCase() }, { status: 200 });
}
