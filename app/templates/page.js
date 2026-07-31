"use client";

import { useState } from "react";
export default function TemplatePage() {
  const [data, setData] = useState(null);
  const [input, setInput] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("0");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      const parsedData = JSON.parse(input);
      setData(parsedData);
      setError("");
    } catch (err) {
      setError("Invalid JSON schema format. Please verify your input.");
    }
  };

  const handleReset = () => {
    setData(null);
    setError("");
  };

    return (
      <div className="max-w-2xl mx-auto my-10 p-6 bg-white rounded-lg shadow-md border border-gray-200">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Resume Template Inspector</h1>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Template</label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            >
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Paste Resume JSON Data</label>
            <textarea
              rows={14}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste schema JSON here..."
              className="w-full p-3 border border-gray-300 rounded-md font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
          >
            Render Template
          </button>
        </form>
      </div>
    );
}