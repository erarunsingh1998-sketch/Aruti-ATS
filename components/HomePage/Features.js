"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  FileCheck2,
  FileText,
  LayoutTemplate,
  SearchCheck,
  Sparkles,
  WandSparkles,
} from "lucide-react";

const features = [
  {
    icon: SearchCheck,
    title: "Instant ATS Analysis",
    description:
      "See how your resume performs against applicant tracking systems in seconds.",
    card:
      "border-cyan-200/80 bg-gradient-to-br from-cyan-100 via-white/70 to-sky-200/80 shadow-cyan-200/40",
    colour: "bg-cyan-200/80 text-cyan-700",
  },
  {
    icon: Sparkles,
    title: "AI Keyword Matching",
    description:
      "Find the important keywords missing from your resume and match them to your target role.",
    card:
      "border-rose-200/80 bg-gradient-to-br from-rose-100 via-white/70 to-pink-200/80 shadow-rose-200/40",
    colour: "bg-rose-200/80 text-rose-700",
  },
  {
    icon: WandSparkles,
    title: "Smart Suggestions",
    description:
      "Get clear, practical recommendations to improve your content, wording, and impact.",
    card:
      "border-sky-200/80 bg-gradient-to-br from-sky-100 via-white/70 to-indigo-200/80 shadow-sky-200/40",
    colour: "bg-sky-200/80 text-sky-700",
  },
  {
    icon: LayoutTemplate,
    title: "Premium Templates",
    description:
      "Choose from polished, recruiter-friendly designs built to keep your resume readable.",
    card:
      "border-violet-200/80 bg-gradient-to-br from-violet-100 via-white/70 to-fuchsia-200/80 shadow-violet-200/40",
    colour: "bg-violet-200/80 text-violet-700",
  },
  {
    icon: FileText,
    title: "Easy Resume Builder",
    description:
      "Create and update a professional resume without starting from a blank page.",
    card:
      "border-amber-200/80 bg-gradient-to-br from-amber-100 via-white/70 to-orange-200/80 shadow-amber-200/40",
    colour: "bg-amber-200/80 text-amber-700",
  },
  {
    icon: FileCheck2,
    title: "Recruiter Ready",
    description:
      "Present your experience with a clean structure that helps recruiters find what matters.",
    card:
      "border-emerald-200/80 bg-gradient-to-br from-emerald-100 via-white/70 to-teal-200/80 shadow-emerald-200/40",
    colour: "bg-emerald-200/80 text-emerald-700",
  },
];

export default function Features() {
  return (
    <section className="relative pt-12 pb-10">
      <div className="absolute inset-0 blur-[14px] bg-gradient-to-r from-sky-300/30 to-rose-300/30 "/>
      <div className="absolute left-[-140px] top-4 h-80 w-80 rounded-full bg-rose-400/30 blur-[120px]" />
      <div className="absolute right-[-140px] bottom-10 h-96 w-96 rounded-full bg-sky-400/30 blur-[120px]" />
      <div className="relative mx-auto w-full max-w-7xl px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-rose-300 bg-rose-300/30 px-5 py-2 text-sm font-semibold text-rose-700">
            Everything You Need
          </div>

          <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            One Simple Way to Build a{" "}
            <span className="bg-gradient-to-r from-rose-600 to-cyan-600 bg-clip-text text-transparent">
              Better Resume
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            From your first draft to your final application, Aruti AI gives you
            the tools and guidance to stand out with confidence.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, delay: index * 0.02 }}
                whileHover={{ y: -6 }}
                className={
                  "group rounded-[28px] border p-7 shadow-[0_20px_60px_rgba(15,23,42,.08)] backdrop-blur-xl transition-shadow hover:shadow-[0_25px_70px_rgba(15,23,42,.14)] " +
                  feature.card
                }
              >
                <div className={"flex h-14 w-14 items-center justify-center rounded-2xl " + feature.colour}>
                  <Icon size={27} />
                </div>

                <h3 className="mt-6 text-xl font-bold text-slate-900">
                  {feature.title}
                </h3>
                <p className="mt-3 leading-7 text-slate-600">
                  {feature.description}
                </p>

                <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-slate-800">
                  Explore feature
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
