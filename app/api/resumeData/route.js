import { NextResponse } from "next/server";
import { redis } from "@/utility/serverUtil/RedisConfig";

export async function GET(request) {
  const url = new URL(request.url);
  const jobId = url.searchParams.get("jobId");
  if (!jobId) {
    return NextResponse.json({ error: "No jobId provided" }, { status: 400 });
  }

  const rawResumeData = await redis.get(`task:resumeData:${jobId}`);
  if (!rawResumeData) {
    return NextResponse.json({ error: "No cached resume data found for this jobId." }, { status: 404 });
  }

  try {
    const resumeData = JSON.parse(rawResumeData);
    console.log("Successfully retrieved resume data:", resumeData);
    return NextResponse.json({ resumeData }, { status: 200 });
  } catch (error) {
    console.error("Error parsing resume data for jobId:", jobId, error);
    return NextResponse.json({ error: "Unable to parse cached resume data." }, { status: 500 });
  }
}
