"use client";

import { Suspense, useState } from "react";
import AnalyzeComp from "@/components/AnalyzePage/AnalyzeComp";
import HomeHeader from "@/components/HomePage/Header";
import { useSearchParams } from "next/navigation";

export const dynamic = 'force-dynamic';

function AnalyzePageContent() {
  const param = useSearchParams();
  const [taskId, setTaskId] = useState(param.get('taskId'));

  return (
    <div className="min-h-screen w-full flex flex-col">
      <HomeHeader />
      <AnalyzeComp taskId={taskId} setTaskId={setTaskId} />
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense fallback={<div className="min-h-screen w-full flex items-center justify-center">Loading...</div>}>
      <AnalyzePageContent />
    </Suspense>
  );
}