
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, ArrowLeft, CheckCircle2, CircleX, Lightbulb, } from "lucide-react";
import { BriefcaseBusiness, BadgeCheck,  Sparkles, } from "lucide-react";
import { FileText, BarChart3, TriangleAlert, Search, SpellCheck, History, } from "lucide-react";

const STATUS_LABELS = {
  PENDING: {
    label: "Queued for parsing",
    description: "Your resume has been received and is waiting to enter the parsing queue.",
  },
  PARSING: {
    label: "Parsing Resume",
    description: "We are extracting your resume content before AI analysis.",
  },
  ANALYSING: {
    label: "Analysing Resume with AI",
    description: "Your resume is being evaluated by the AI-powered ATS engine.",
  },
  PROCESSING: {
    label: "Processing Resume",
    description: "Your resume is currently being processed.",
  },
  READY: {
    label: "Analysis Ready",
    description: "Your resume analysis is complete and ready to review.",
  },
};


export default function AnalysisPage({ taskId }) {
  const [status, setStatus] = useState("PROCESSING");
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    let timer;

    const poll = async () => {
      try {
        const response = await fetch(
          `/api/analyseResume/status?taskId=${encodeURIComponent(taskId)}`,
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!active) return;

        if (!response.ok) {
          throw new Error(
            data.error || "Unable to retrieve resume analysis."
          );
        }

        setStatus(data.taskStatus);

        if (data.taskStatus === "READY") {
          setAnalysis(data.result);
          return;
        }

        if (data.taskStatus === "FAILED") {
          setError(data.error || "Resume analysis failed.");
          return;
        }

        timer = setTimeout(poll, 2200);
      } catch (err) {
        if (active) {
          setError(err.message);
        }
      }
    };

    poll();

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [taskId]);

  if (error) {
    return <AnalysisError message={error} />;
  }

  if (!analysis || status !== "READY") {
    return <LoadingAnalysis status={status} taskId={taskId} />;
  }

  return (
    <main className="relative w-full min-h-screen overflow-hidden pb-16">
      <div className="absolute inset-0 -z-20 overflow-hidden">
        <motion.div className="absolute left-0 top-10 h-72 w-72 rounded-full bg-rose-400/40 blur-[120px]" animate={{ scale: [0.5, 1.2, 0.5] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="absolute right-0 bottom-0 h-80 w-80 rounded-full bg-sky-400/40 blur-[150px]" animate={{ scale: [1.2, 0.6, 1.2] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} />
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-12 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
          <aside className="space-y-5">
            <AnalysisSidebar analysis={analysis} />
            <div className="rounded-3xl border border-white/40 bg-white/70 p-6 shadow-xl backdrop-blur-xl">
              <h3 className="text-lg font-bold text-slate-900">Improve Your Resume</h3>
              <p className="mt-3 text-sm text-slate-600">
                Use Aruti AI to optimize your resume in a template with your latest data.
              </p>
              <button
                onClick={() => window.location.assign(`/templates?jobId=${encodeURIComponent(taskId)}`)}
                className="mt-5 w-full rounded-2xl bg-sky-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-600"
              >
                Improve Resume with Aruti AI
              </button>
            </div>
          </aside>

          <section>
            <AnalysisReport analysis={analysis} />
          </section>
        </div>
      </div>
    </main>
  );
}



const AnalysisError = ({ message }) => {

  return (
    <main className="flex min-h-[75vh] items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/40 bg-white/70 p-8 shadow-2xl backdrop-blur-xl"
      >
        {/* Glow */}
        <div className="absolute -left-10 -top-10 h-36 w-36 rounded-full bg-rose-400/25 blur-3xl" />
        <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-sky-400/25 blur-3xl" />

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-rose-100">
            <AlertTriangle className="h-10 w-10 text-rose-600" />
          </div>

          <h2 className="mt-6 text-3xl font-black text-slate-900">
            Analysis Failed
          </h2>

          <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
            {message ||
              "Something went wrong while generating your ATS analysis. Please try again in a moment."}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-3 font-semibold text-white transition hover:bg-sky-700"
            >
              <RefreshCw size={18} />
              Try Again
            </button>

            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <ArrowLeft size={18} />
              Back
            </button>
          </div>
        </div>
      </motion.div>
    </main>
  );
};


const Skeleton = ({ className = "" }) => (
  <div
    className={`relative overflow-hidden rounded-xl bg-slate-200/70 ${className}`}
  >
    <motion.div
      className="absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/80 to-transparent"
      animate={{ x: ["-120%", "320%"] }}
      transition={{
        repeat: Infinity,
        duration: 1.4,
        ease: "linear",
      }}
    />
  </div>
);

const LoadingAnalysis = ({ status, taskId }) => {
  const statusMeta = STATUS_LABELS[status] || STATUS_LABELS.PROCESSING;

  return (
    <main className="relative min-h-screen overflow-hidden pb-16">
      <div className="absolute inset-0 -z-20 overflow-hidden">
        <motion.div
          className="absolute left-0 top-10 h-72 w-72 rounded-full bg-rose-400/40 blur-[120px]"
          animate={{ scale: [0.5, 1.2, 0.5] }}
          transition={{ duration: 5, repeat: Infinity }}
        />

        <motion.div
          className="absolute right-0 bottom-0 h-80 w-80 rounded-full bg-sky-400/40 blur-[140px]"
          animate={{ scale: [1.2, 0.6, 1.2] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-12 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
          <aside className="space-y-5">
            <div className="rounded-3xl border border-white/40 bg-white/70 p-6 shadow-xl backdrop-blur-xl">
              <div className="flex justify-center">
                <Skeleton className="h-40 w-40 rounded-full" />
              </div>
              <Skeleton className="mx-auto mt-6 h-6 w-32" />
              <Skeleton className="mx-auto mt-3 h-4 w-40" />
              <Skeleton className="mx-auto mt-2 h-4 w-28" />
            </div>

            <div className="rounded-3xl border border-white/40 bg-white/70 p-6 shadow-xl backdrop-blur-xl space-y-4">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-10/12" />
            </div>

            <Skeleton className="h-12 w-full rounded-xl" />
          </aside>

          <section className="space-y-6">
            <div className="rounded-3xl border border-white/40 bg-white/80 p-8 shadow-xl backdrop-blur-xl">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-500">Resume analysis status</p>
                  <h2 className="mt-3 text-2xl font-bold text-slate-900">{statusMeta.label}</h2>
                </div>

                <div className="rounded-full bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-700">
                  {taskId ? `Task ${taskId}` : "Preparing task"}
                </div>
              </div>

              <p className="mt-5 text-slate-600">{statusMeta.description}</p>

              <div className="mt-8 rounded-3xl bg-slate-50 p-5 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-2.5 w-2.5 rounded-full bg-sky-500 animate-pulse" />
                  {status === "PARSING"
                    ? "Extracting text and parsing your resume content..."
                    : status === "ANALYSING"
                    ? "Sending parsed content to the AI engine for deep evaluation..."
                    : status === "PENDING"
                    ? "Your task is queued and will begin shortly."
                    : "Processing your resume submission..."}
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-3xl border border-white/40 bg-white/70 p-6 shadow-xl backdrop-blur-xl">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="mt-5 h-4 w-full" />
                <Skeleton className="mt-3 h-4 w-10/12" />
                <Skeleton className="mt-3 h-4 w-8/12" />
              </div>

              <div className="rounded-3xl border border-white/40 bg-white/70 p-6 shadow-xl backdrop-blur-xl">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="mt-5 h-4 w-full" />
                <Skeleton className="mt-3 h-4 w-11/12" />
                <Skeleton className="mt-3 h-4 w-9/12" />
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};



const ScoreCard = ({ analysis }) => {
  const score = analysis.score ?? 0;

  const scoreColor =
    score >= 85 ? "text-emerald-600" : score >= 70 ? "text-sky-600" : score >= 60 ? "text-amber-500" : "text-rose-600";

  const progress = score * 2.51;

  return (
    <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-3xl border border-white/40 bg-white/70 p-6 shadow-xl backdrop-blur-xl">
      <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-sky-400/20 blur-3xl" />

      <div className="relative flex flex-col items-center">
        <div className="relative h-44 w-44">
          <svg className="h-full w-full -rotate-90">
            <circle cx="88" cy="88" r="72" stroke="#e5e7eb" strokeWidth="12" fill="none"/>
            <motion.circle cx="88" cy="88" r="72" stroke="#0ea5e9" strokeWidth="12" fill="none" strokeLinecap="round" strokeDasharray="452" initial={{ strokeDashoffset: 452 }} animate={{   strokeDashoffset: 452 - (452 * progress) / 100, }} transition={{ duration: 1.2 }} />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span initial={{ scale: 0.8 }} animate={{ scale: 1 }} className={`text-5xl font-black ${scoreColor}`} >
              {score}
            </motion.span>

            <span className="text-sm text-slate-500">
              ATS Score
            </span>
          </div>
        </div>

        <span className="mt-5 rounded-full bg-sky-100 px-4 py-1 text-sm font-semibold text-sky-700">
          {analysis.experienceLevel}
        </span>

        <div className="mt-6 w-full space-y-4">
          <div className="flex items-center gap-3">
            <BriefcaseBusiness className="text-sky-600" size={18} />
            <div>
              <p className="text-xs text-slate-500">Target Role</p>
              <p className="font-semibold">{analysis.role}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <BadgeCheck className="text-emerald-600" size={18} />
            <div>
              <p className="text-xs text-slate-500">Verdict</p>
              <p className="text-sm text-slate-700">
                {analysis.verdict}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};



const QuickStatsCard = ({ analysis }) => {
  const stats = [
    {
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      label: "Keywords Matched",
      value: analysis.keywords.matched.length,
    },
    {
      icon: CircleX,
      color: "text-rose-600",
      bg: "bg-rose-50",
      label: "Missing Keywords",
      value: analysis.keywords.missing.length,
    },
    {
      icon: TriangleAlert,
      color: "text-amber-600",
      bg: "bg-amber-50",
      label: "Grammar Issues",
      value: analysis.grammarIssues.length,
    },
    {
      icon: Sparkles,
      color: "text-sky-600",
      bg: "bg-sky-50",
      label: "Strengths",
      value: analysis.strengths.length,
    },
  ];

  return (
    <div className="rounded-3xl border border-white/40 bg-white/70 p-6 shadow-xl backdrop-blur-xl">
      <h3 className="mb-5 text-lg font-bold text-slate-900">
        Quick Stats
      </h3>

      <div className="space-y-4">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className={`rounded-xl p-2 ${item.bg}`}>
                  <Icon className={item.color} size={18} />
                </div>

                <span className="text-sm text-slate-700">
                  {item.label}
                </span>
              </div>

              <span className="font-bold text-slate-900">
                {item.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};


const AnalysisSidebar = ({ analysis }) => {
  return (
    <div className="space-y-5">
      <ScoreCard analysis={analysis} />

      <QuickStatsCard analysis={analysis} />
    </div>
  );
};

const AnalysisReport = ({ analysis }) => {
  return (
    <div className="space-y-6">
      <SummaryCard analysis={analysis} />

      <PriorityActionsCard analysis={analysis} />

      <ScoreBreakdownCard analysis={analysis} />

      <StrengthsCard analysis={analysis} />

      <KeywordsCard analysis={analysis} />

      <GrammarCard analysis={analysis} />

      <TimelineCard analysis={analysis} />

      <AtsTipsCard analysis={analysis} />
    </div>
  );
};


const SummaryCard = ({ analysis }) => {
  return (
    <ReportCard title="Executive Summary" icon={FileText}>
      <p className="text-slate-700 leading-7">
        {analysis.summary}
      </p>

      <div className="grid md:grid-cols-3 gap-4 mt-8">
        <div className="rounded-2xl bg-slate-50 p-5">
          <BriefcaseBusiness className="text-sky-600 mb-2" size={20} />
          <p className="text-xs text-slate-500">Target Role</p>
          <p className="font-semibold">{analysis.role}</p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-5">
          <BadgeCheck className="text-emerald-600 mb-2" size={20} />
          <p className="text-xs text-slate-500">Experience</p>
          <p className="font-semibold">{analysis.experienceLevel}</p>
        </div>
      </div>
    </ReportCard>
  );
};


const PriorityActionsCard = ({ analysis }) => {
  return (
    <ReportCard title="Priority Actions" icon={TriangleAlert}>
      <div className="space-y-5">
        {analysis.priorityActions.map((item, index) => (
          <div
            key={index}
            className="rounded-2xl border border-slate-200 bg-white p-5"
          >
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                item.priority === "High"
                  ? "bg-rose-100 text-rose-700"
                  : item.priority === "Medium"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {item.priority}
            </span>

            <h3 className="mt-3 font-bold text-lg">
              {item.title}
            </h3>

            <p className="mt-2 text-slate-600">
              {item.detail}
            </p>
          </div>
        ))}
      </div>
    </ReportCard>
  );
};



const ScoreBreakdownCard = ({ analysis }) => {
  return (
    <ReportCard title="ATS Score Breakdown" icon={BarChart3}>
      <div className="space-y-7">
        {analysis.scoreBreakdown.map((item, index) => (
          <div key={index}>
            <div className="flex justify-between mb-2">
              <h4 className="font-semibold">{item.label}</h4>

              <span className="font-bold text-sky-600">
                {item.score}/{item.max}
              </span>
            </div>

            <div className="h-3 rounded-full bg-slate-200 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{
                  width: `${(item.score / item.max) * 100}%`,
                }}
                transition={{ duration: 0.8 }}
                className="h-full rounded-full bg-sky-500"
              />
            </div>

            <p className="mt-2 text-sm text-slate-600">
              {item.note}
            </p>
          </div>
        ))}
      </div>
    </ReportCard>
  );
};



const StrengthsCard = ({ analysis }) => {
  return (
    <ReportCard title="Strengths" icon={BadgeCheck}>
      <div className="space-y-4">
        {analysis.strengths.map((item, index) => (
          <div
            key={index}
            className="flex gap-4 rounded-2xl bg-emerald-50 p-5"
          >
            <BadgeCheck
              className="text-emerald-600 shrink-0"
              size={20}
            />

            <p>{item}</p>
          </div>
        ))}
      </div>
    </ReportCard>
  );
};

const KeywordsCard = ({ analysis }) => {
  return (
    <ReportCard title="Keyword Analysis" icon={Search}>
      <div className="grid lg:grid-cols-2 gap-8">

        <div>
          <h3 className="font-bold mb-4 text-emerald-600">
            Matched Keywords
          </h3>

          <div className="flex flex-wrap gap-2">
            {analysis.keywords.matched.map((item) => (
              <span
                key={item}
                className="rounded-full bg-emerald-100 px-4 py-2 text-sm"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-bold mb-4 text-amber-600">
            Missing Keywords
          </h3>

          <div className="flex flex-wrap gap-2">
            {analysis.keywords.missing.map((item) => (
              <span
                key={item}
                className="rounded-full bg-amber-100 px-4 py-2 text-sm"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

      </div>

      <div className="mt-8">
        <h3 className="font-bold mb-4">
          Frequently Used Words
        </h3>

        <div className="space-y-3">
          {analysis.keywords.duplicates.map((item) => (
            <div
              key={item.keyword}
              className="flex justify-between rounded-xl bg-slate-50 p-4"
            >
              <span>
                <b>{item.keyword}</b> ({item.count}x)
              </span>

              <span className="text-sky-600">
                {item.replacement}
              </span>
            </div>
          ))}
        </div>
      </div>
    </ReportCard>
  );
};

const GrammarCard = ({ analysis }) => {
  return (
    <ReportCard title="Grammar Suggestions" icon={SpellCheck}>
      <div className="space-y-6">
        {analysis.grammarIssues.map((item, index) => (
          <div
            key={index}
            className="rounded-2xl border bg-white p-5"
          >
            <p className="text-xs uppercase text-slate-500">
              Original
            </p>

            <p className="text-rose-600 mt-1">
              {item.original}
            </p>

            <p className="text-xs uppercase mt-5 text-slate-500">
              Suggested
            </p>

            <p className="text-emerald-600 mt-1">
              {item.suggestion}
            </p>

            <p className="mt-5 text-sm text-slate-600">
              {item.reason}
            </p>
          </div>
        ))}
      </div>
    </ReportCard>
  );
};


const TimelineCard = ({ analysis }) => {
  return (
    <ReportCard title="Career Timeline" icon={History}>
      <div className="border-l-2 border-sky-300 ml-3 space-y-8">
        {analysis.timeline.map((item, index) => (
          <div
            key={index}
            className="relative pl-8"
          >
            <div className="absolute left-[-10px] top-1 h-4 w-4 rounded-full bg-sky-500"></div>

            <h3 className="font-bold">
              {item.role}
            </h3>

            <p className="text-slate-500">
              {item.company}
            </p>

            <p className="text-sm text-slate-400 mt-1">
              {item.duration}
            </p>

            <p className="mt-3">
              {item.impact}
            </p>
          </div>
        ))}
      </div>
    </ReportCard>
  );
};



const AtsTipsCard = ({ analysis }) => {
  return (
    <ReportCard title="ATS Tips" icon={Lightbulb}>
      <div className="space-y-4">
        {analysis.atsTips.map((tip, index) => (
          <div
            key={index}
            className="flex gap-4 rounded-2xl bg-sky-50 p-5"
          >
            <Lightbulb
              className="text-sky-600 shrink-0"
              size={20}
            />

            <p>{tip}</p>
          </div>
        ))}
      </div>
    </ReportCard>
  );
};


const ReportCard = ({ title, icon: Icon, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 25 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: .4 }}
    className="rounded-3xl border border-white/40 bg-sky-100/30 backdrop-blur-xl shadow-xl p-7"
  >
    <div className="flex items-center gap-3 mb-6">
      <div className="rounded-xl bg-sky-100 p-2">
        <Icon size={20} className="text-sky-600"/>
      </div>

      <h2 className="text-xl font-bold text-slate-900">
        {title}
      </h2>
    </div>

    {children}
  </motion.div>
);

