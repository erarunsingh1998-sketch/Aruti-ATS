import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export default function HomeHeader() {
    const [scrolled, setScrolled] = useState(false)
    const [loggedIn, setLoggedIn] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50)
        }
        window.addEventListener("scroll", handleScroll)
        handleScroll()
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <motion.header className={`fixed inset-x-0 z-30`} animate={{ top: scrolled ? "1.25rem" : "0.5rem"}} transition={{ duration: 0.3 }}>
            <motion.div className={`mx-auto flex items-end justify-between gap-4 px-6 py-4 ${scrolled ? "w-[calc(100%-2rem)] max-w-6xl rounded-full" : "w-full"}`} animate={{ backgroundColor: scrolled ? "rgba(251, 113, 133, 0.1)" : "rgba(255, 255, 255, 0)", backdropFilter: scrolled ? "blur(16px)" : "blur(0px)", boxShadow: scrolled ? "0 20px 25px -5px rgba(15, 23, 42, 0.2)" : "0 0 0 0 rgba(15, 23, 42, 0)"}} transition={{ duration: 0.2 }}>
                <a href="/" className="flex items-center gap-3">
                    <img src="/logo-light.png" alt="Aruti AI logo" className="h-10 w-auto" />
                </a>

                <nav className="hidden items-center gap-8 text-lg font-ubuntu tracking-[1.1] font-semibold text-slate-900 md:flex pb-2">
                    <a href="#features" className="transition hover:text-sky-900">Features</a>
                    <a href="#solutions" className="transition hover:text-sky-900">Solutions</a>
                    <a href="#pricing" className="transition hover:text-sky-900">Pricing</a>
                    <a href="#explore" className="transition hover:text-sky-900">Get Started</a>
                </nav>

                <div className="flex items-center gap-3">
                    {loggedIn ? (
                        <>
                            <button className="rounded-full px-4 py-2 text-sm text-slate-900 transition hover:text-rose-900 font-semibold">
                                Dashboard
                            </button>
                            <button onClick={() => setLoggedIn(false)} className="rounded-full bg-slate-600 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-900">
                                Logout
                            </button>
                        </> ) : (
                        <>
                            <button className="rounded-full px-4 py-2 text-sm text-slate-900 transition hover:text-rose-900 font-semibold">
                                Login
                            </button>
                            <button onClick={() => setLoggedIn(true)} className="rounded-full bg-slate-600 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-900">
                                Signup
                            </button>
                        </>
                    )}
                </div>
            </motion.div>
        </motion.header>
    )
}