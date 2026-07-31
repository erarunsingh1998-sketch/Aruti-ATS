"use client";

import { motion } from "framer-motion";
import {  } from "lucide-react";
import { CheckCircle2, FileCheck, ScanSearch, Sparkles, ArrowRight} from "lucide-react";
import ScoreCounter from "./Scorecounter";

export default function WhyAruti() {
  return (
    <section className="relative pt-24 pb-8">
      {/* Background Blur */}

      <div className="absolute left-[-180px] top-20 h-80 w-80 rounded-full bg-cyan-400/10 blur-[120px]" />

      <div className="absolute right-[-160px] bottom-0 h-96 w-96 rounded-full bg-pink-400/10 blur-[120px]" />

      <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-20 px-6 lg:flex-row lg:px-10">
        {/* ===========================
            LEFT CONTENT
        =========================== */}
        <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: .8 }} className="relative hidden md:flex flex-1 items-center justify-center">
          <ATSDashboard />
        </motion.div>

        {/* ===========================
            RIGHT SIDE
        =========================== */}
                <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: .8 }}
          className="flex-1"
        >
          {/* Badge */}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: .1 }}
            className="mb-2 inline-flex items-center rounded-full border border-cyan-300 bg-cyan-300/30 px-5 py-2 text-sm font-semibold text-cyan-700"
          >
            Why Aruti AI
          </motion.div>

          {/* Heading */}

          <motion.h2
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: .2 }}
            className="max-w-xl text-2xl sm:text-3xl md:text-4xl font-black leading-tight tracking-tight text-slate-900"
          >
            Built to Beat&nbsp;
            <span className="bg-gradient-to-r from-cyan-500 to-sky-600 bg-clip-text text-transparent">
               Modern ATS
            </span>
          </motion.h2>

          {/* Paragraph */}

          <motion.p
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: .3 }}
            className="mt-6 max-w-xl text-lg leading-8 text-slate-600"
          >
            Most resumes never reach recruiters because they fail Applicant
            Tracking System screening before a human ever reads them.

            <br />
            <br />

            Aruti AI analyses your resume using advanced AI, detects missing
            keywords, improves formatting, and recommends ATS-friendly resume
            templates that maximise your interview opportunities.
          </motion.p>

          {/* CTA */}

          <motion.button
            whileHover={{
              scale: 1.04,
            }}
            whileTap={{
              scale: .98,
            }}
            className="mt-10 flex items-center gap-3 rounded-full bg-slate-900 px-7 py-4 text-white shadow-xl transition-all hover:bg-slate-800"
          >
            Start Optimising

            <ArrowRight size={18} />
          </motion.button>

          {/* Small Features */}

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: .45 }}
            viewport={{ once: true }}
            className="mt-12 grid grid-cols-2 gap-4 text-sm font-medium text-slate-700 sm:grid-cols-3"
          >
            <div>✓ ATS Resume Analysis</div>
            <div>✓ AI Keyword Matching</div>
            <div>✓ Smart Resume Builder</div>
            <div>✓ Premium Templates</div>
            <div>✓ Formatting Optimisation</div>
            <div>✓ Recruiter Friendly</div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}




 const ATSDashboard = () => {
  const score = 94;

  const bars = [
    { label: "Formatting", value: 100,},
    { label: "Keywords", value: 92,},
    { label: "Readability", value: 95,},
    { label: "Structure", value: 98,},
    { label: "Grammar", value: 100,},
  ];

  return (
    <motion.div  initial={{ opacity: 0, y: 50, scale: .95, }}  whileInView={{ opacity: 1, y: 0, scale: 1, }}  viewport={{ once: true, }}  transition={{ duration: .8, }}  className="relative w-full max-w-md" >
      {/* Glow */}
      <div className="absolute inset-0 rounded-[36px] bg-cyan-400/30 blur-3xl" />
      {/* Card */}
      <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white/10 p-8 shadow-[0_30px_80px_rgba(15,23,42,.15)] backdrop-blur-xl">
        {/* Decorative Gradient */}
        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-300/20 blur-3xl" />

        {/* Header */}
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-cyan-600">
              Resume Analysis
            </p>

            <h3 className="mt-1 text-2xl font-bold text-slate-900">
              ATS Report
            </h3>
          </div>

          <motion.div
            animate={{
              rotate: [0, 8, -8, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 4,
            }}
          >
            <ScanSearch
              className="text-cyan-500"
              size={32}
            />
          </motion.div>
        </div>

        {/* Score */}

        <div className="mt-8 flex flex-col items-center">

          <div className="text-sm font-medium text-slate-500">
            ATS SCORE
          </div>

          <motion.div
            initial={{
              scale: .8,
              opacity: 0,
            }}
            whileInView={{
              scale: 1,
              opacity: 1,
            }}
            transition={{
              delay: .2,
            }}
            className="mt-2 bg-gradient-to-r from-cyan-500 to-sky-600 bg-clip-text text-6xl font-black text-transparent"
          >
            <ScoreCounter
              value={score}
              duration={1800}
            />
          </motion.div>

          <div className="mt-2 flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
            <CheckCircle2 size={16} />
            Recruiter Ready
          </div>

        </div>

        {/* Divider */}

        <div className="my-8 h-px bg-slate-200" />

        {/* Progress */}

        <div className="space-y-5">

          {bars.map((bar, index) => (
            <ProgressBar
              key={bar.label}
              label={bar.label}
              value={bar.value}
              delay={index * .15}
            />
          ))}

        </div>

        {/* Divider */}

        <div className="my-8 h-px bg-slate-200" />

        {/* Bottom Features */}

        <div className="grid grid-cols-2 gap-4 text-sm">

          <motion.div
            whileHover={{
              x: 4,
            }}
            className="flex items-center gap-2 text-slate-700"
          >
            <Sparkles
              size={18}
              className="text-cyan-500"
            />
            AI Suggestions
          </motion.div>

          <motion.div
            whileHover={{
              x: 4,
            }}
            className="flex items-center gap-2 text-slate-700"
          >
            <FileCheck
              size={18}
              className="text-cyan-500"
            />
            ATS Friendly
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
}

const ProgressBar = ({label, value, delay = 0,}) => {

  return (
    <div>
      <div className="mb-2 flex justify-between text-sm font-medium text-slate-700">
        <span>{label}</span>
        <span>{value}%</span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-200">

        <motion.div
          initial={{
            width: 0,
          }}
          whileInView={{
            width: `${value}%`,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 1,
            delay,
          }}
          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-sky-500"
        />

      </div>

    </div>
  );
}