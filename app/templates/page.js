"use client";

import TempHeader from "@/components/Templates/TempHeader";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { arutiTemplates } from "@/lib/TemplateJson";
import ExampleResumeTemp from "@/lib/resume-templates/ExampleResumeTemp";
import { resumeData } from "@/lib/ResumeSchema";
import { useReactToPrint } from "react-to-print";

export default function Page() {
  const [showTemplate, setShowTemplate] = useState(false);
  const [loadedResumeData, setLoadedResumeData] = useState(null);
  const [error, setError] = useState("");
  const [jobId, setJobId] = useState(null);
  const [loading, setLoading] = useState(true);
  const contentRef = useRef(null);
  const handlePrint = useReactToPrint({ content: () => contentRef.current });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("jobId");
    setJobId(id);

    async function fetchResume() {
      if (!id) {
        setLoadedResumeData(resumeData);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/resumeData?jobId=${encodeURIComponent(id)}`);
        if (!response.ok) {
          throw new Error("No cached resume data found for this jobId.");
        }

        const data = await response.json();
        if (!data?.resumeData || Object.keys(data.resumeData).length === 0) {
          throw new Error("No cached resume data found for this jobId.");
        }

        setLoadedResumeData(data.resumeData);
      } catch (err) {
        setError(err.message || "Unable to load resume.");
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      } finally {
        setLoading(false);
      }
    }

    fetchResume();
  }, []);

  return (
    <div className="w-full min-h-screen ">
      <TempHeader showTemplate={setShowTemplate} onPrint={handlePrint} />
      <main className="mt-15 flex w-full h-full justify-between items-start gap-5">
        <aside className={` ${showTemplate ? 'block' : 'hidden'} sticky top-16 w-full max-w-sm max-h-[calc(100vh-62px)] bg-gray-200 shadow-xl overflow-y-auto scrollbar-no-arrows transition-all duration-300 ease-in-out`}>
          <div className="p-4 flex justify-between items-center ">
            <div></div>
            <h2 className="text-lg font-bold">Templates</h2>
            <motion.button initial={{ rotate: 0 }} whileHover={{ rotate: 90 }} transition={{ ease: "linear", duration: 0.3 }} onClick={() => setShowTemplate(false)} className="text-gray-900 hover:text-gray-800" >
              <X />
            </motion.button>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4 px-2 ">
            {arutiTemplates.map((template) => (
              <div key={template.id} className="relative group rounded-lg border border-gray-300 hover:border-green-500 shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer" >
                <img src={template.link} alt={template.name} className="w-full h-60 object-stretch rounded-lg" />
                <h3 className="absolute bottom-0 left-0 w-full group-hover:bg-green-700 group-hover:text-white py-1 px-2 bg-white text-md font-semibold">
                  {template.name.length > 20 ? template.name.slice(0, 19) + "..." : template.name}
                </h3>
              </div>
            ))}
          </div>
        </aside>
        <main className={`w-full h-full py-10 border border-gray-500/50 mx-auto px-5`}>
          <div ref={contentRef} className="mx-auto overflow-x-auto px-1 py-2">
            {error ? (
              <div className="rounded-3xl border border-rose-300 bg-rose-50 p-6 text-rose-800">
                <h2 className="text-lg font-bold">{error}</h2>
                <p className="mt-2 text-sm">Redirecting to home...</p>
              </div>
            ) : loading ? (
              <div className="rounded-3xl border border-slate-300 bg-white p-6 text-slate-700">
                <h2 className="text-lg font-bold">Loading resume preview…</h2>
                <p className="mt-2 text-sm">Please wait while we load your cached resume data.</p>
              </div>
            ) : (
              <ExampleResumeTemp resumeData={loadedResumeData} />
            )}
          </div>
        </main>
      </main>
    </div>
  );
}