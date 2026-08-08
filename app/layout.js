import "./globals.css";

export const metadata = {
  title: "Aruti ATS — ATS Checker & Resume Enhancer",
  description: "Free ATS resume checker and AI-powered resume enhancer. Get your ATS score, fix missing keywords, and download your rebuilt resume in 5 professional styles.",
  icons :{
    icon : "/icon.png",
    shortcut : "/icon.png",
    apple : "/icon.png"
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  openGraph : {
    title : "Aruti ATS — ATS Checker & Resume Enhancer",
    description : "Check your resume against ATS, get AI-powered suggestions, and rebuild in 5 professional styles.",
    images: [
      {
        url: "/logo-dark.png",
        width: 800, // Adjust width/height if you know the exact dimensions
        height: 800,
        alt: "Aruti ATS Icon",
      },
    ],
  }

};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased" >
      <body className="flex flex-col relative">
        <div className="absolute inset-0 -z-50 bg-slate-100 " />
        <div className="absolute inset-0 -z-30 bg-gradient-to-r from-rose-300/40 bg-sky-300/30" />
        {children}
      </body>
    </html>
  );
}
