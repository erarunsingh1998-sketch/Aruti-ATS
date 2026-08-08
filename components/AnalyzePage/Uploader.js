import { useRouter } from "next/navigation";
import { Rocket } from "lucide-react";
import { ResumeScanner } from "../HomePage/Hero";
import { motion } from "framer-motion";
import { useState } from "react";

export default function Uploader({ updateTaskId }){
  const router = useRouter();

  return (
    <div className="w-full flex-1 pt-10 flex flex-col px-2 md:px-4 lg:px-8">
      <main className="w-full flex-1 flex gap-5 flex-col-reverse md:flex-row items-center justify-between">
        
        {/* LEFT Section */}
        <div className="w-full h-full space-y-1">
           {/* Badge */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .15 }}  className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-300/30 px-4 py-1 backdrop-blur">
              <Rocket size={18} className="text-sky-600" />
              <span className="text-sm font-semibold text-sky-800 font-mono"> AI-Powered ATS Engine</span>
            </motion.div>

              {/* Heading */}
            <motion.h1 initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .25 }} className=" text-2xl font-black leading-tight text-slate-900 md:text-3xl lg:text-5xl">
              Check your <span className=" bg-gradient-to-r from-rose-600 via-rose-800 to-rose-900 bg-clip-text text-transparent"> Resume Score </span>
            </motion.h1>

            <div className="mt-8 py-5 px-4 rounded-2xl border border-gray-500/50 shadow-xl bg-gradient-to-br from-sky-300/20 to-rose-300/20">
              <UploadForm updateTaskId={updateTaskId} />
            </div>
        </div>

        {/* RIGHT Section */}
        <motion.div initial={{opacity:0, x:-10}} animate={{opacity:2, x:0}} className="w-full h-full lg:max-w-md md:max-w-sm pt-5">
          <ResumeScanner />
        </motion.div>
      </main>
    </div>
  );

}




const UploadForm = ({ updateTaskId }) => {
  const [file, setFile] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [upload, setUpload] = useState(true);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const MAX_FILE_SIZE = 1024 * 1024; // 1 MB

  const handleFile = (selectedFile) => {
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("File size must be 1 MB or less.");
      setFile(null);
      return;
    }

    setError("");
    setFile(selectedFile);
    setResumeText("");
  };

  const handleInputChange = (e) => {
    const chosen = e.target.files?.[0];
    if (chosen) {
      handleFile(chosen);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer?.files?.length) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (upload) {
      if (!file) {
        setError("Please upload your resume file.");
        return;
      }
    } else {
      if (!resumeText.trim()) {
        setError("Please paste your resume text.");
        return;
      }
    }

    setLoading(true);

    try {
      const formData = new FormData();
      if (upload) {
        formData.append("resume", file);
      } else {
        formData.append("resumeText", resumeText.trim());
      }

      const response = await fetch("/api/analyseResume", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const text = await response.json();
        throw new Error(text || "Unable to submit resume.");
      }

      const data = await response.json();
      if (data?.taskId) {
        updateTaskId(data.taskId);
        router.replace(`/analyseResume?taskId=${encodeURIComponent(data.taskId)}`);
      } else {
        setError("Unable to process resume, please try again.");
      }
    } catch (err) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="font-semibold text-lg">
          {upload ? "Upload Your Resume" : "Paste Resume Text"}
          <span className="text-rose-500">*</span>
        </label>

        {upload ? (
          <div className={`mt-3 border-2 border-dashed rounded-2xl px-4 py-8 text-center transition ${dragActive ? "border-sky-500 bg-sky-100" : "border-slate-800 bg-white/40"} hover:border-sky-600 hover:bg-white/70 `} onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}>
            <input id="resume-upload" type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleInputChange}/>
            <label htmlFor="resume-upload" className="flex flex-col items-center justify-center gap-2 cursor-pointer">
              <span className="text-sm text-slate-500">Drag and drop your resume here, or click to browse.</span>
              <span className="text-sm font-medium text-slate-700">{file ? `Selected file: ${file.name}` : "No file selected yet."}</span>
            </label>
          </div>
        ) : (
          <textarea onChange={(e) => {setResumeText(e.target.value); setError("");}} value={resumeText} rows={4} placeholder="Paste your resume text here"
            className="mt-3 w-full rounded-2xl border border-slate-300 bg-white/70 px-4 py-4 text-sm text-slate-900 shadow-sm outline-none transition ring-2 ring-gray-400 focus:ring-sky-400"
          />
        )}
        <p className="text-center">
          <button onClick={()=>{setUpload(prev => !prev)}} className="text-sky-700 text-sm font-semibold pb-1">{upload ? "Or Paste your resume test instead!" : "Or Upload your resume instead!"}</button>
        </p>

        {error ? <p className="my-1 text-sm text-rose-600">{error}</p> : null}
      </div>

      <div>
        <button type="submit" disabled={loading} className="mt-2 cursor-pointer w-full rounded-2xl bg-sky-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60">
          {loading ? "Submitting..." : "Analyze Resume"}
        </button>
      </div>
    </form>
  );
}