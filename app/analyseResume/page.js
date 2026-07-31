"use client";

import AnalyzeComp from "@/components/AnalyzePage/AnalyzeComp";
import HomeHeader from "@/components/HomePage/Header";

export default function AnalyzePage(){

  return <div className="min-h-screen w-full flex flex-col">
    <HomeHeader />
    <AnalyzeComp />
  </div>
}