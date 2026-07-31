"use client";

import { Suspense, useState } from "react";
import AnalyzeComp from "@/components/AnalyzePage/AnalyzeComp";
import HomeHeader from "@/components/HomePage/Header";
import { useSearchParams } from "next/navigation";

export const dynamic = 'force-dynamic';

export default function AnalyzePage(){

  const param = useSearchParams();
  const [taskId,setTaskId] = useState(param.get('taskId'));

  return <div className="min-h-screen w-full flex flex-col">
    <HomeHeader />      
    <AnalyzeComp taskId={taskId} setTaskId={setTaskId}/>

  </div>
}