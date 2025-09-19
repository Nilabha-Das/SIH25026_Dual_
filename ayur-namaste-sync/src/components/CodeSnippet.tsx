import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface CodeSnippetProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  compact?: boolean;
}

export default function CodeSnippet({
  code,
  language = "bash",
  showLineNumbers = false,
  compact = false,
}: CodeSnippetProps) {
  const [copied, setCopied] = useState(false);
  const lines = code.split("\n");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  };

  return (
    <div
      className={`relative rounded-lg overflow-hidden border border-gray-800 ${
        compact ? "text-sm" : ""
      } bg-gradient-to-br from-gray-900 to-gray-950 shadow-md`}
    >
      <div className="flex items-center justify-between px-3 py-2 bg-gray-900/70 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <span className="text-xs text-cyan-400 uppercase tracking-wider">{language}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white text-xs transition"
            title="Copy code"
          >
            {copied ? "Copied ✓" : "Copy"}
          </button>
        </div>
      </div>

      <pre className="p-4 overflow-auto text-sm text-green-200 font-mono leading-5">
        <code>
          {showLineNumbers ? (
            <div className="flex">
              <div className="pr-4 text-gray-600 select-none border-r border-gray-800 mr-4">
                {lines.map((_, i) => (
                  <div key={i} className="leading-5">
                    {i + 1}
                  </div>
                ))}
              </div>
              <div>
                {lines.map((line, i) => (
                  <div key={i} className="whitespace-pre leading-5">
                    {line || "\u00A0"}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            code
          )}
        </code>
      </pre>

      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute right-3 bottom-3 text-xs text-cyan-300"
          >
            Copied to clipboard
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
