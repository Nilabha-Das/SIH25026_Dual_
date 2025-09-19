import React, { useState } from "react";
import CodeSnippet from "./CodeSnippet";

interface FhirBundleEditorProps {
  initialBundle?: string;
  onSave?: (json: string) => void;
}

export default function FhirBundleEditor({ initialBundle, onSave }: FhirBundleEditorProps) {
  const defaultBundle = initialBundle || `{
  "resourceType": "Bundle",
  "type": "transaction",
  "entry": [
    {
      "request": { "method": "POST", "url": "Condition" },
      "resource": {
        "resourceType": "Condition",
        "clinicalStatus": { "coding": [{ "system": "http://terminology.hl7.org/CodeSystem/condition-clinical", "code": "active" }]},
        "code": {
          "coding": [
            { "system": "urn:namaste", "code": "NAM123", "display": "Prameha (Diabetes - Ayurveda)" },
            { "system": "http://who.int/icd/release/11", "code": "5A11", "display": "Diabetes mellitus" }
          ],
          "text": "NAM -> ICD dual coding example"
        },
        "subject": { "reference": "Patient/123" }
      }
    }
  ]
}`;

  const [bundleText, setBundleText] = useState<string>(defaultBundle);
  const [isEditing, setIsEditing] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(bundleText);
    alert("FHIR Bundle copied to clipboard");
  };

  const handleDownload = () => {
    const blob = new Blob([bundleText], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fhir-bundle.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = () => {
    try {
      JSON.parse(bundleText); // validate
      onSave?.(bundleText);
      alert("Bundle saved (validated JSON).");
      setIsEditing(false);
    } catch (err) {
      alert("Invalid JSON. Please fix errors before saving.");
    }
  };

  return (
    <section className="rounded-2xl bg-gray-900/70 border border-gray-800 p-6 shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-cyan-300">FHIR Bundle Editor</h3>
          <p className="text-sm text-gray-400 mt-1">
            Edit the FHIR Bundle JSON here. Copy, download, or validate and save your bundle for upload.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing((s) => !s)}
            className="px-3 py-1 rounded-md bg-gray-800 border border-gray-700 text-sm text-gray-200 hover:bg-gray-700 transition"
          >
            {isEditing ? "Preview" : "Edit"}
          </button>
          <button
            onClick={handleCopy}
            className="px-3 py-1 rounded-md bg-cyan-600 text-white text-sm hover:bg-cyan-500 transition"
          >
            Copy Bundle
          </button>
          <button
            onClick={handleDownload}
            className="px-3 py-1 rounded-md bg-emerald-600 text-white text-sm hover:bg-emerald-500 transition"
          >
            Download JSON
          </button>
        </div>
      </div>

      <div className="mt-4">
        {isEditing ? (
          <textarea
            value={bundleText}
            onChange={(e) => setBundleText(e.target.value)}
            rows={16}
            className="w-full p-3 bg-gray-950 text-green-200 font-mono text-sm rounded-md border border-gray-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        ) : (
          <CodeSnippet code={bundleText} language="json" showLineNumbers />
        )}
      </div>

      {isEditing && (
        <div className="mt-4 flex gap-2">
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-md bg-cyan-600 text-white hover:bg-cyan-500 transition"
          >
            Validate & Save
          </button>
          <button
            onClick={() => { setBundleText(defaultBundle); alert("Reset to default bundle."); }}
            className="px-4 py-2 rounded-md bg-gray-800 text-gray-200 hover:bg-gray-700 transition"
          >
            Reset
          </button>
        </div>
      )}
    </section>
  );
}
