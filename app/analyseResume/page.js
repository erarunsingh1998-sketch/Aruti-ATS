"use client";

import { Suspense } from "react";
import AnalyzeComp from "@/components/AnalyzePage/AnalyzeComp";
import HomeHeader from "@/components/HomePage/Header";

export const dynamic = 'force-dynamic';

export default function AnalyzePage(){

  return <div className="min-h-screen w-full flex flex-col">
    <HomeHeader />
    <Suspense fallback={<div className="mx-auto w-full px-4 py-16 text-center text-slate-700">Loading analysis...</div>}>
      <AnalyzeComp />
    </Suspense>
  </div>
}