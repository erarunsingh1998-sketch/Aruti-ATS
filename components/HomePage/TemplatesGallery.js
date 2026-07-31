"use client";

import { motion } from "framer-motion";
import { Lock, Sparkles } from "lucide-react";
import { arutiTemplates } from "@/lib/TemplateJson";

export default function TemplatesGallery() {
  const templates = arutiTemplates.map((template) => ({
    ...template,
    isLocked: template.atsScore > 92,
  }));

  return (
    <section id="templates" className="relative px-6 py-8 lg:px-10">
      <div className="absolute left-[-120px] top-10 h-72 w-72 rounded-full bg-cyan-400/10 blur-[120px]" />
      <div className="absolute bottom-0 right-[-120px] h-72 w-72 rounded-full bg-rose-400/10 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-300/30 px-5 py-2 text-sm font-semibold text-emerald-700">
            <Sparkles size={16} />
            ATS-friendly templates
          </div>
          <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            Explore templates designed for
            <span className="ml-2 bg-gradient-to-r from-cyan-500 to-rose-600 bg-clip-text text-transparent">
              stronger outcomes
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Browse our curated resume layouts and preview the ones that are currently unlocked for your next application.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {templates.map((template, index) => (
            <motion.article
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.05 }}
              className={`group relative overflow-hidden rounded-[28px] border bg-white/80 p-3 shadow-[0_20px_60px_rgba(15,23,42,.08)] backdrop-blur-xl ${
                template.isLocked ? "border-slate-200" : "border-cyan-200"
              }`}
            >
              <div className="relative overflow-hidden rounded-[22px]">
                <img
                  src={template.link}
                  alt={template.name}
                  className={`h-[28rem] w-full object-cover transition duration-500 ${
                    template.isLocked ? "grayscale" : "group-hover:scale-105"
                  }`}
                />

                {template.isLocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70">
                    <div className="rounded-full border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                      <Lock size={24} className="text-white" />
                    </div>
                  </div>
                )}
              </div>

              <div className="px-2 pb-2 pt-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">{template.name}</h3>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      template.isLocked
                        ? "bg-slate-100 text-slate-600"
                        : "bg-cyan-100 text-cyan-700"
                    }`}
                  >
                    {template.isLocked ? "Locked" : "Unlocked"}
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
