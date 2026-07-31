import { arutiTemplates } from "@/lib/TemplateJson";
import { AnimatePresence, motion, time } from "framer-motion";
import { ArrowRight, Rocket } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ScoreCounter from "./Scorecounter";

export default function Hero (){

  return (<section className="w-full min-h-screen pt-24 pb-6 px-3 md:px-5 lg:px-7 relative flex ">
          {/* Background Glow */}
      <div className="absolute inset-0 -z-20">
        <motion.div className="absolute left-0 top-10 w-72 h-72 rounded-full bg-rose-400/60 blur-[120px]"
          animate={{ scale: [0.45, 1.2, 0.45] }} transition={{ duration: 3, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }} />
        <motion.div  className="absolute right-10 bottom-10 w-72 h-72 rounded-full bg-sky-400/60 blur-[140px]"
          animate={{ scale: [0.45, 1.2,  0.45] }} transition={{ duration: 4, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }} />
      </div>

      <div className="w-full flex justify-between items-center flex-wrap gap-5" >
        {/* LEFT Part */}
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .7 }} className="w-full max-w-3xl">

              {/* Badge */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .15 }}  className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-300/30 px-4 py-2 backdrop-blur">
              <Rocket size={18} className="text-sky-600" />
              <span className="text-sm font-semibold text-sky-800"> AI-Powered Resume Optimisation</span>
            </motion.div>

              {/* Heading */}
            <motion.h1 initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .25 }} className="mt-3 text-2xl font-black leading-tight text-slate-900 md:text-3xl lg:text-5xl">
              Land More Interviews with an
              <span className="block bg-gradient-to-r from-rose-600 to-slate-900 bg-clip-text text-transparent"> ATS-Friendly Resume</span>
            </motion.h1>

              {/* Description */}
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .35 }} className="mt-2 text-lg leading-7 text-slate-700 font-serif">
              Instantly analyse your resume, discover missing ATS keywords, improve formatting, explore premium resume templates, and maximise
              your chances of passing applicant tracking systems used by top companies.
            </motion.p>

              {/* CTA */}
            <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .45 }} className="mt-10 flex flex-wrap gap-4">
              <a href="/analyseResume" className="group flex items-center gap-2 rounded-full bg-slate-900 px-7 py-4 font-semibold text-white transition hover:scale-105 hover:bg-slate-800">
                Check Your Resume
                <ArrowRight size={18} className="transition group-hover:translate-x-1" />
              </a>
              <button className="rounded-full border border-slate-300 bg-rose-700/15 px-7 py-4 font-semibold text-slate-900 backdrop-blur transition hover:border-rose-700 hover:text-rose-900 hover:scale-103">
                Build Resume
              </button>
            </motion.div>

          </motion.div >
          {/* right Part  */}
          <motion.div initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .8 }} className="w-full max-w-md h-full flex items-center">
            <ResumeScanner />
          </motion.div>
      </div>

  </section>);
}

const resumeTemplates = arutiTemplates.slice(5);

export const ResumeScanner = () => {

  const [frontIndex, setFrontIndex] = useState(0);
  const [backIndex, setBackIndex] = useState(1);
  const [nextIndex, setNextIndex] = useState(2);
  const [showFront, setShowFront] = useState(true);
  const [rotation, setRotation] = useState(0);
  const [phase, setPhase] = useState("scan");

  const visibleTemplate = showFront ? resumeTemplates[frontIndex] : resumeTemplates[backIndex];
  
  const particles = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => ({
      left: `${5 + ((i * 19 + nextIndex * 17) % 90)}%`,
    }));
  }, [nextIndex]);

  useEffect(() => {
    let timer;

    switch (phase) {
      // Scanner is finished, show static score
      case "show":
        timer = setTimeout(() => {setPhase("flip"); setRotation((prev) => prev + 180)}, 1000);
        break;
      default:
        break;
    }

    return () => {if (timer) clearTimeout(timer)};
  }, [phase]);

  const handleFlipComplete = () => {
    
    if (phase !== "flip") return;

    const becameFront = !showFront;

    setShowFront(becameFront);
    if (becameFront) {setBackIndex(nextIndex)} 
    else {setFrontIndex(nextIndex)}

    setNextIndex((prev) => (prev + 1) % resumeTemplates.length);
    setPhase("scan");
  };

  const scoreColour = visibleTemplate.atsScore >= 90 ? "text-emerald-600" : visibleTemplate.atsScore >= 80 ? "text-green-500" : "text-orange-500";
    
  return (
    <div className="relative flex h-full w-full items-center justify-center perspective-[1600px]">
      {/* ============================================
          Floating Glow
      ============================================ */}
      <motion.div className="absolute h-80 w-80 rounded-full bg-sky-400/20 blur-[100px]" animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.25, 0.55, 0.25] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut"}} />

      {/* ============================================
          Resume Card
      ============================================ */}
      <motion.div animate={{ y: [0, -12, 0],}} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut",}} className="mx-auto w-[250] h-[360] sm:w-[280] sm:h-[390] md:w-[300] md:h-[420] lg:w-[330] lg:h-[490]">
        <motion.div className="relative h-full w-full" style={{ transformStyle: "preserve-3d",}}animate={{ rotateY: rotation,}}transition={{ duration: 0.9, ease: "easeInOut",}} onAnimationComplete={handleFlipComplete} >
          {/* ============================================
              FRONT FACE
          ============================================ */}
          <div className="absolute inset-0 overflow-hidden rounded-[30px] border border-white/60 bg-white shadow-2xl" style={{backfaceVisibility: "hidden"}}>
            {/* Resume */}
            <img src={resumeTemplates[frontIndex].link} alt={resumeTemplates[frontIndex].name} className="h-full w-full object-stretch"/>

            {/* ========================================
                Scanner Overlay
            ======================================== */}
            <AnimatePresence>
              {showFront && phase === "scan" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0" >
                  {/* Moving Laser */}
                  <motion.div  initial={{ top: "-5%" }} animate={{top:["-5%","105%","105%"]}} transition={{duration:2.2,times:[0,.95,1],ease:"linear"}} onAnimationComplete={() => setPhase("show")} className="absolute left-0 h-[3px] w-full bg-gradient-to-r from-sky-500/30 via-cyan-600 to-sky-500/30 shadow-[0_0_35px_8px_rgba(34,211,238,.9)]">
                    {particles.map((particle, i) => (
                      <motion.span key={i} className="absolute h-1.5 w-1.5 rounded-full bg-cyan-700" style={{ left: particle.left,}} animate={{ y: [0, 220], opacity: [0, 1, 0],}} transition={{ duration: 2.2, delay: i * 0.08,}} />
                    ))}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            {/* ========================================
                ATS Score
            ======================================== */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
              <AnimatePresence mode="wait">
                {/* Counting */}
                {showFront && phase === "scan" && (
                  <motion.div key="front-count" initial={{ opacity: 0, scale: .8,}} animate={{ opacity: 1, scale: 1,}} exit={{ opacity: 0, scale: .8,}} className="rounded-full bg-white/95 px-6 py-3 text-lg font-bold shadow-xl backdrop-blur" >
                    ATS Score&nbsp;
                    <span className={scoreColour}>
                      <ScoreCounter key={`front-${frontIndex}`} value={resumeTemplates[frontIndex].atsScore} duration={2200} />
                    </span>
                  </motion.div>
                )}

                {/* Static */}
                {showFront && phase === "show" && (
                  <motion.div key="front-static" initial={{ opacity: 0, y: 12,}} animate={{ opacity: 1, y: 0,}} exit={{ opacity: 0, y: -12,}} className="rounded-full bg-emerald-500 px-6 py-3 text-lg font-bold text-white shadow-xl" >
                    ATS Score&nbsp; {resumeTemplates[frontIndex].atsScore}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ============================================
                BACK FACE
            ============================================ */}
          <div className="absolute inset-0 overflow-hidden rounded-[30px] border border-white/60 bg-white shadow-2xl" style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden",}} >
            {/* Resume */}
            <img src={resumeTemplates[backIndex].link} alt={resumeTemplates[backIndex].name} className="h-full w-full object-stretch"/>

            {/* ========================================
                Scanner Overlay
            ======================================== */}
            <AnimatePresence>
              {!showFront && phase === "scan" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-cyan-400/5" >
                  {/* Moving Laser */}
                  <motion.div initial={{ top: "-5%" }} animate={{top:["-5%","105%","105%"]}} transition={{duration:2.2,times:[0,.95,1],ease:"linear"}} onAnimationComplete={() => setPhase("show")} className="absolute left-0 h-[3px] w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_35px_8px_rgba(34,211,238,.9)]" >
                    {particles.map((particle, i) => (
                      <motion.span key={i} className="absolute h-1 w-1 rounded-full bg-cyan-300" style={{ left: particle.left,}} animate={{ y: [0, 220], opacity: [0, 1, 0],}} transition={{ duration: 2.2, delay: i * 0.08,}} />
                    ))}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ========================================
                ATS SCORE
            ======================================== */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center">
              <AnimatePresence mode="wait">
                {/* Counting */}
                {!showFront && phase === "scan" && (
                  <motion.div key="back-count" initial={{ opacity: 0, scale: 0.8,}} animate={{ opacity: 1, scale: 1,}} exit={{ opacity: 0, scale: 0.8,}} className="rounded-full bg-white/95 px-6 py-3 text-lg font-bold shadow-xl backdrop-blur" >
                    ATS Score&nbsp; 
                    <span className={scoreColour}>
                      <ScoreCounter key={`back-${backIndex}`} value={resumeTemplates[backIndex].atsScore} duration={2200} />
                    </span>
                  </motion.div>
                )}
                {/* Static */}

                {!showFront && phase === "show" && (
                  <motion.div key="back-static" initial={{ opacity: 0, y: 12,}} animate={{ opacity: 1, y: 0,}} exit={{ opacity: 0, y: -12,}} className="rounded-full bg-emerald-500 px-6 py-3 text-lg font-bold text-white shadow-xl" >
                    ATS Score&nbsp; {resumeTemplates[backIndex].atsScore}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}