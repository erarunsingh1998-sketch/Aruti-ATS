import { ArrowUpRight, Sparkles } from "lucide-react";

const footerLinks = {
  Product: [
    { label: "Resume Analysis", href: "/analyseResume" },
    { label: "Resume Builder", href: "/resumeBuilder" },
    { label: "Templates", href: "#pricing" },
  ],
  Company: [
    { label: "About Aruti AI", href: "#about" },
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
  ],
  Support: [
    { label: "Help Center", href: "#support" },
    { label: "Contact Us", href: "#contact" },
    { label: "Privacy Policy", href: "#privacy" },
  ],
};

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-slate-200/70 bg-slate-950 px-6 pb-8 pt-10 text-slate-300 lg:px-10">
      <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-[110px]" />
      <div className="absolute -bottom-24 left-10 h-64 w-64 rounded-full bg-rose-400/10 blur-[110px]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <a href="#" className="inline-flex items-center gap-2 text-xl font-black text-white">
              <img src="/logo-dark.png" className="h-16"/>
            </a>
            <p className="mt-2 max-w-sm leading-7 text-slate-400">
              Build a stronger resume, beat modern ATS systems, and move closer
              to your next opportunity.
            </p>
            <a
              href="/analyseResume"
              className="mt-1 inline-flex items-center gap-2 font-semibold text-cyan-300 transition hover:text-cyan-200"
            >
              Start optimising
              <ArrowUpRight size={17} />
            </a>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-bold text-white">{title}</h3>
              <ul className="mt-5 space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-slate-400 transition hover:text-cyan-300"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Aruti AI. All rights reserved.</p>
          <p className="text-center text-sm text-slate-500 sm:text-right">
            Designed by{" "}
            <a
              href="https://arunsinghdeveloper.vercel.app"
              target="_blank"
              rel="noreferrer"
              className="group ml-1 inline-flex items-center gap-1 font-bold tracking-wide text-cyan-300 transition hover:text-rose-300"
            >
              <span className="border-b border-cyan-300/40 pb-0.5 transition group-hover:border-rose-300">
                ARUN SINGH
              </span>
              <ArrowUpRight
                size={14}
                className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
