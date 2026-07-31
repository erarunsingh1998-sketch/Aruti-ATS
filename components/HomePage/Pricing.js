"use client";

import { motion } from "framer-motion";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Crown,
  ArrowUpCircle,
  FilePlus2,
  Sparkles,
  Zap,
} from "lucide-react";
import { useState } from "react";

const plans = [
  {
    name: "Free",
    eyebrow: "Get started",
    description: "Explore the essentials and understand your resume score.",
    price: "₹0",
    billing: "Forever",
    icon: Sparkles,
    card: "border-slate-200 bg-white/75",
    iconStyle: "bg-slate-100 text-slate-700",
    features: [
      "2 ATS score checks per month",
      "2 resume enhancements for lifetime",
      "Limited template access",
      "Resume building unavailable",
      "Downloads unavailable",
    ],
    button: "Start for free",
  },
  {
    name: "Pay as you go",
    eyebrow: "Flexible access",
    description: "Pay only when you need a polished, downloadable resume.",
    price: "₹0",
    billing: "Free to start",
    icon: Zap,
    card: "border-cyan-200 bg-gradient-to-br from-cyan-50 via-white/80 to-sky-100/80",
    iconStyle: "bg-cyan-100 text-cyan-700",
    features: [
      "2 free ATS score checks per month",
      "2 free resume enhancements for lifetime",
      "Limited free template access",
      "₹400 per normal resume after free usage",
      "₹600 per high ATS-friendly resume",
      "Resume downloads included",
    ],
    button: "Choose flexible access",
  },
  {
    name: "Plus",
    eyebrow: "For active job seekers",
    description: "More checks, enhancements, and building power every month.",
    price: "₹1,500",
    billing: "Billed monthly",
    icon: Sparkles,
    card: "border-rose-200 bg-gradient-to-br from-rose-50 via-white/80 to-pink-100/80",
    iconStyle: "bg-rose-100 text-rose-700",
    features: [
      "15 ATS score checks per month",
      "10 resume enhancements with download",
      "Access to 2 ATS-friendly templates per month",
      "2 resume builds per month",
    ],
    button: "Choose Plus",
  },
  {
    name: "Pro",
    eyebrow: "For serious applications",
    description: "Consistent resume support for a focused job search.",
    price: "₹3,000",
    billing: "Billed quarterly",
    icon: Crown,
    card: "border-violet-200 bg-gradient-to-br from-violet-50 via-white/80 to-indigo-100/80",
    iconStyle: "bg-violet-100 text-violet-700",
    popular: true,
    features: [
      "20 ATS score checks per month",
      "15 resume enhancements with download per month",
      "Access to 8 ATS-friendly templates per quarter",
      "5 resume builds per month",
    ],
    button: "Choose Pro",
  },
  {
    name: "Ultimate",
    eyebrow: "Maximum advantage",
    description: "Unlimited scoring and the complete Aruti AI toolkit.",
    price: "₹7,500",
    billing: "Billed annually",
    icon: Crown,
    card: "border-amber-200 bg-gradient-to-br from-amber-50 via-white/80 to-orange-100/80",
    iconStyle: "bg-amber-100 text-amber-700",
    features: [
      "Unlimited ATS score checks",
      "15 resume builds per month",
      "30 resume enhancements with download per month",
      "10 ATS-compliant resume downloads per month",
      "Most efficient models for resume building",
      "GPT-5.6 Luna and Gemini 3.6 Flash access",
    ],
    button: "Choose Ultimate",
  },
];

export default function Pricing() {
  const [slideIndex, setSlideIndex] = useState(0);
  const maxSlideIndex = plans.length - 3;

  const moveCarousel = (direction) => {
    setSlideIndex((current) =>
      Math.min(Math.max(current + direction, 0), maxSlideIndex),
    );
  };

  return (
    <section id="pricing" className="relative px-6 py-8 lg:px-10">
      <div className="absolute inset-0 blur-[14px] bg-gradient-to-r from-sky-400/30 to-rose-400/30 "/>
      <div className="absolute left-[-160px] bottom-10 h-96 w-96 rounded-full bg-rose-400/30 blur-[130px]" />
      <div className="absolute right-10 bottom-5 h-96 w-96 rounded-full bg-cyan-400/40 blur-[160px]" />

      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300 bg-cyan-300/30 px-5 py-2 text-sm font-semibold text-cyan-700">
            Simple, Flexible Plans
          </div>
          <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            Choose the right plan for your{" "}
            <span className="bg-gradient-to-r from-cyan-500 to-rose-600 bg-clip-text text-transparent">
              next opportunity
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Start free, pay only when you need more, or unlock the complete
            resume optimisation experience.
          </p>
        </motion.div>

        <div className="relative mt-16 px-0 sm:px-14">
          <button
            type="button"
            aria-label="Show previous pricing plan"
            onClick={() => moveCarousel(-1)}
            disabled={slideIndex === 0}
            className="absolute left-0 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-700 shadow-lg transition hover:scale-105 hover:bg-slate-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 disabled:hover:bg-white disabled:hover:text-slate-700 sm:flex"
          >
            <ChevronLeft size={22} />
          </button>

          <div className="overflow-hidden rounded-[32px] py-4">
            <div
              className="flex"
              style={{
                width: (plans.length / 3) * 100 + "%",
                transform:
                  "translateX(-" +
                  slideIndex * (100 / plans.length) +
                  "%)",
                transition: "transform 500ms ease-in-out",
              }}
            >
          {plans.map((plan) => {
            const Icon = plan.icon;

            return (
              <motion.article
                key={plan.name}
                className="shrink-0 px-2.5"
                style={{ flex: "0 0 " + 100 / plans.length + "%" }}
              >
                <div
                  className={
                    "relative flex h-full flex-col rounded-[28px] border p-6 shadow-[0_20px_60px_rgba(15,23,42,.08)] backdrop-blur-xl " +
                    plan.card
                  }
                >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-slate-900 px-4 py-1 text-xs font-bold text-white">
                    Most popular
                  </div>
                )}

                <div className={"flex h-12 w-12 items-center justify-center rounded-2xl " + plan.iconStyle}>
                  <Icon size={23} />
                </div>

                <p className="mt-6 text-sm font-semibold text-slate-500">
                  {plan.eyebrow}
                </p>
                <h3 className="mt-1 text-2xl font-black text-slate-900">
                  {plan.name}
                </h3>
                <p className="mt-3 min-h-20 text-sm leading-6 text-slate-600">
                  {plan.description}
                </p>

                <div className="mt-5">
                  <span className="text-3xl font-black text-slate-900">
                    {plan.price}
                  </span>
                  <span className="ml-1 text-sm text-slate-500">
                    {plan.billing}
                  </span>
                </div>

                <div className="my-6 h-px bg-slate-200/80" />

                <ul className="flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm leading-5 text-slate-700">
                      <Check size={16} className="mt-0.5 shrink-0 text-emerald-600" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href="/analyseResume"
                  className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  {plan.button}
                  {plan.name !== "Free" && <ArrowUpCircle size={16} />}
                </a>
                </div>
              </motion.article>
            );
          })}
            </div>
          </div>

          <button
            type="button"
            aria-label="Show next pricing plan"
            onClick={() => moveCarousel(1)}
            disabled={slideIndex === maxSlideIndex}
            className="absolute right-0 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-700 shadow-lg transition hover:scale-105 hover:bg-slate-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 disabled:hover:bg-white disabled:hover:text-slate-700 sm:flex"
          >
            <ChevronRight size={22} />
          </button>

          <div className="mt-5 flex justify-center gap-2 sm:hidden">
            <button
              type="button"
              aria-label="Show previous pricing plan"
              onClick={() => moveCarousel(-1)}
              disabled={slideIndex === 0}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-md disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              aria-label="Show next pricing plan"
              onClick={() => moveCarousel(1)}
              disabled={slideIndex === maxSlideIndex}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-md disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <p className="mt-8 flex items-center justify-center gap-2 text-center text-sm text-slate-500">
          <FilePlus2 size={16} />
          Plans can be adjusted as Aruti AI adds more resume tools and models.
        </p>
      </div>
    </section>
  );
}
