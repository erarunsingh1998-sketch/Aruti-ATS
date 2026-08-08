
import { downloadResumePdf } from "@/lib/gneratePDF";
import { Download, Printer } from "lucide-react";

export default function TempHeader({ showTemplate, onPrint }) {
  return (
    <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 py-3 shadow-xl backdrop-blur-md ">
      <a href="/">
        <img src="/logo-light.png" alt="Logo" className="h-10 w-auto" />
      </a>

      <div className="flex items-center gap-3">
        <button
          onClick={() => showTemplate(true)}
          className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md font-medium"
        >
          Templates
        </button>

        <button onClick={onPrint}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white font-medium rounded-md shadow"
        >
          <Printer size={16} />
          Print Resume
        </button>
      </div>
    </header>
  );
}