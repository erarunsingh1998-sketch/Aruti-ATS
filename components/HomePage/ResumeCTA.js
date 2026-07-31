"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

export default function ResumeCTA() {
  return (
    <section className="relative px-6 py-20 lg:px-10">
      <div className="absolute inset-0 bg-gradient-to-r from-sky-300/30 to-rose-300/30 blur-[10px]"/>
      <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300/20 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="relative mx-auto max-w-6xl overflow-hidden rounded-[36px] border border-white/70 bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-950 px-6 py-14 text-center shadow-[0_30px_90px_rgba(15,23,42,.25)] sm:px-10 md:py-20"
      >
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-rose-400/20 blur-3xl" />

        <div className="relative">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-5 py-2 text-sm font-semibold text-cyan-200">
            <Sparkles size={16} />
            Your next opportunity starts here
          </div>

          <h2 className="mx-auto mt-6 max-w-3xl text-3xl font-black leading-tight text-white sm:text-4xl md:text-5xl">
            Ready to make your resume{" "}
            <span className="bg-gradient-to-r from-cyan-300 to-rose-300 bg-clip-text text-transparent">
              stand out?
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            Analyse your resume, improve your score, and apply with confidence.
          </p>

          <a
            href="/analyseResume"
            className="group mt-9 inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 font-semibold text-slate-900 shadow-xl transition hover:scale-105 hover:bg-cyan-50"
          >
            Check Your Resume
            <ArrowRight size={18} className="transition group-hover:translate-x-1" />
          </a>
        </div>
      </motion.div>
    </section>
  );
}
