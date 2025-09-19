// src/pages/ApiDocsPage.tsx
import React, { useEffect, useRef, useState } from "react";
import { Layout } from "@/components/Layout";
import CodeSnippet from "@/components/CodeSnippet";
import FhirBundleEditor from "@/components/FhirBundleEditor";
import { motion } from "framer-motion";
import { Copy, Key } from "lucide-react";

const apiBase = "http://localhost:3000";

const apiKeysMock = [
  { role: "admin", label: "Admin API Key", scopes: ["read:all", "write:all", "manage:users"], exampleKey: "sk_admin_XXXXXXXXXXXXXXXX" },
  { role: "doctor", label: "Doctor API Key", scopes: ["read:codes", "write:encounters", "translate"], exampleKey: "sk_doctor_YYYYYYYYYYYYYYYY" },
  { role: "curator", label: "Curator API Key", scopes: ["manage:terminology", "translate", "audit:read"], exampleKey: "sk_curator_ZZZZZZZZZZZZ" },
  { role: "patient", label: "Patient API Key", scopes: ["read:own_records"], exampleKey: "sk_patient_AAAAAA" },
];

const apis = [
  { name: "Namaste API", url: `${apiBase}/api/namaste`, desc: "NAMASTE codes endpoint." },
  { name: "ICD API", url: `${apiBase}/api/icd`, desc: "ICD codes endpoint." },
  { name: "Mapping API", url: `${apiBase}/api/mapping`, desc: "Mapping NAMASTE ↔ ICD endpoint." },
  { name: "FHIR Bundle API", url: `${apiBase}/api/fhir/bundle`, desc: "Upload FHIR Bundles (transaction)." },
  { name: "Register API", url: `${apiBase}/api/auth/register`, desc: "Register users." },
];

export default function ApiDocsPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [activeId, setActiveId] = useState<string>("api-keys");

  // Refs for the sections
  const sectionIds = [
    { id: "api-keys", label: "API Keys" },
    { id: "endpoints", label: "Endpoints" },
    { id: "try-it", label: "Try It" },
    { id: "fhir-bundle", label: "FHIR Bundle" },
    { id: "rate-limits", label: "Rate Limits" },
    { id: "security", label: "Security" },
  ];
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  // initialize refs (React will set these later)
  useEffect(() => {
    sectionIds.forEach((s) => {
      sectionRefs.current[s.id] = document.getElementById(s.id);
    });
  }, []);

  // IntersectionObserver to update active nav on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visibleEntries.length > 0) {
          setActiveId(visibleEntries[0].target.id);
        }
      },
      {
        root: null,
        rootMargin: "-30% 0px -40% 0px", // tweak to change when highlight changes
        threshold: [0, 0.1, 0.3, 0.6, 1],
      }
    );

    sectionIds.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    // small toast could be used; alert for simplicity
    alert("Copied to clipboard");
  };

  const sampleFetchWithKey = (url: string) =>
    `// Example (fetch) — use your API key in header\nfetch("${url}", {\n  method: "GET",\n  headers: { "Content-Type": "application/json", "x-api-key": "REPLACE_WITH_API_KEY" }\n})\n  .then(r => r.json())\n  .then(console.log)\n  .catch(console.error);`;

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-gray-200 py-12 px-6">
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold text-cyan-300 text-center mb-8"
        >
          SwasthaLink — API Docs & FHIR Editor
        </motion.h1>

        <div className="max-w-7xl mx-auto grid grid-cols-12 gap-8">
          {/* Sidebar */}
          <aside className="col-span-12 lg:col-span-3 sticky top-24 self-start">
            <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4 shadow">
              <div className="text-sm text-gray-400 mb-3">Navigate</div>
              <nav className="flex flex-col gap-2">
                {sectionIds.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => scrollTo(s.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors duration-200 flex items-center justify-between ${
                      activeId === s.id
                        ? "bg-cyan-700/20 border border-cyan-400 text-cyan-300"
                        : "hover:bg-gray-800/40 text-gray-300"
                    }`}
                  >
                    <span className="font-medium">{s.label}</span>
                    <span className="text-xs text-gray-400">{/* optional: step number */}</span>
                  </button>
                ))}
              </nav>
              <div className="mt-6 text-xs text-gray-400">
                <div className="font-semibold text-gray-200 mb-1">API Base</div>
                <div className="flex items-center gap-2">
                  <code className="truncate text-cyan-300">{apiBase}</code>
                  <button onClick={() => copy(apiBase)} className="text-xs px-2 py-1 bg-cyan-600 rounded text-white hover:bg-cyan-500 transition">
                    <Copy className="inline-block w-3 h-3 mr-1" /> Copy
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="col-span-12 lg:col-span-9 space-y-8">
            {/* API Keys Section */}
            <section id="api-keys" className="rounded-2xl bg-gray-900/60 border border-gray-800 p-6 shadow">
              <motion.h2 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-2xl font-semibold text-cyan-300 mb-3">
                API Keys — Stepwise Access
              </motion.h2>
              <p className="text-sm text-gray-400 mb-4">
                Each role receives a scoped API key. Follow steps below to obtain, secure, and use keys.
              </p>

              <div className="space-y-3">
                {apiKeysMock.map((k, idx) => (
                  <motion.div key={k.role} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.04 }}>
                    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-800/40 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center text-white font-semibold">
                            {k.label.split(" ").map(s => s[0]).slice(0, 2).join("")}
                          </div>
                          <div className="text-left">
                            <div className="font-medium text-gray-100">{k.label}</div>
                            <div className="text-xs text-gray-400">{k.scopes.join(" • ")}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="text-xs text-gray-400">•••</div>
                        </div>
                      </button>

                      {openIndex === idx && (
                        <div className="p-4 border-t border-gray-800 bg-gray-950/60">
                          <ol className="list-decimal ml-6 mb-3 text-gray-300">
                            <li>Request/generate key from Admin console.</li>
                            <li>Receive key via secure channel; it is masked by default.</li>
                            <li>Store key securely; do not commit to source control.</li>
                            <li>Include header <code className="px-1 text-xs text-cyan-300">x-api-key: &lt;YOUR_KEY&gt;</code> in requests.</li>
                            <li>Verify scopes server-side for protected operations.</li>
                          </ol>

                          <div className="flex items-center gap-2">
                            <div className="flex-1 text-sm text-gray-300 truncate bg-gray-900/30 px-3 py-2 rounded">
                              {revealed[idx] ? k.exampleKey : k.exampleKey.replace(/.(?=.{4})/g, "•")}
                            </div>
                            <button onClick={() => setRevealed({ ...revealed, [idx]: !revealed[idx] })} className="px-3 py-1 rounded-md bg-gray-800 text-gray-200 hover:bg-gray-700 transition">
                              {revealed[idx] ? "Hide" : "Reveal"}
                            </button>
                            <button onClick={() => copy(k.exampleKey)} className="px-3 py-1 rounded-md bg-cyan-600 text-white hover:bg-cyan-500 transition">
                              <Key className="w-4 h-4 inline-block mr-1" /> Copy
                            </button>
                          </div>

                          <div className="mt-3">
                            <CodeSnippet code={sampleFetchWithKey(`${apiBase}/api/mapping`)} language="bash" />
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Endpoints Section */}
            <section id="endpoints" className="rounded-2xl bg-gray-900/60 border border-gray-800 p-6 shadow">
              <motion.h2 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-2xl font-semibold text-cyan-300 mb-3">
                API Endpoints
              </motion.h2>

              <div className="grid gap-4">
                {apis.map((a, i) => (
                  <motion.div key={i} whileHover={{ scale: 1.01 }} className="flex items-start justify-between bg-gray-900 border border-gray-800 p-4 rounded-lg">
                    <div>
                      <div className="font-semibold text-gray-100">{a.name}</div>
                      <div className="text-sm text-gray-400 mt-1">{a.desc}</div>
                      <div className="mt-2 flex items-center gap-2">
                        <code className="text-xs text-cyan-300">{a.url}</code>
                        <button onClick={() => copy(a.url)} className="text-xs px-2 py-1 bg-gray-800 rounded text-gray-200 hover:bg-cyan-600 transition">
                          <Copy className="inline-block w-3 h-3 mr-1" /> Copy
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400" />
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Try It */}
            <section id="try-it" className="rounded-2xl bg-gray-900/60 border border-gray-800 p-6 shadow">
              <motion.h2 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-2xl font-semibold text-cyan-300 mb-3">
                Try it — Examples
              </motion.h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Search NAMASTE codes</p>
                  <CodeSnippet code={`GET ${apiBase}/api/namaste?q=diabetes`} language="http" />
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-2">Translate a code</p>
                  <CodeSnippet code={`GET ${apiBase}/api/mapping?source=namaste&code=NAM123`} language="http" />
                </div>
              </div>
            </section>

            {/* FHIR Bundle */}
            <section id="fhir-bundle" className="rounded-2xl bg-gray-900/60 border border-gray-800 p-6 shadow">
              <motion.h2 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-2xl font-semibold text-cyan-300 mb-3">
                FHIR Bundle — Editor & Examples
              </motion.h2>

              <p className="text-sm text-gray-400 mb-4">
                Create or paste a FHIR transaction Bundle (ProblemList/Condition). Validate locally, copy or download JSON, then POST to <code className="text-cyan-300">{apiBase}/api/fhir/bundle</code>.
              </p>

              <FhirBundleEditor
                initialBundle={undefined}
                onSave={(json) => {
                  // optionally keep saved bundle in state or upload
                  console.log("Saved FHIR bundle length:", json.length);
                  alert("FHIR bundle saved locally (validated).");
                }}
              />

              <div className="mt-4 text-sm text-gray-400">
                <p>Example upload (curl):</p>
                <CodeSnippet
                  code={`curl -X POST ${apiBase}/api/fhir/bundle \\
  -H "Content-Type: application/fhir+json" \\
  -H "x-api-key: REPLACE_WITH_KEY" \\
  --data-binary @fhir-bundle.json`}
                  language="bash"
                />
              </div>
            </section>

            {/* Rate limits */}
            <section id="rate-limits" className="rounded-2xl bg-gray-900/60 border border-gray-800 p-6 shadow">
              <motion.h2 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-2xl font-semibold text-cyan-300 mb-3">
                Rate Limits & Error Codes
              </motion.h2>

              <ul className="list-disc ml-6 text-gray-400 space-y-1">
                <li><strong className="text-cyan-300">60 req/min</strong> — default</li>
                <li>Burst allowed for trusted partners</li>
                <li>429 responses include <code className="text-cyan-300">Retry-After</code> header</li>
                <li>Standard errors: 400, 401, 403, 429, 500</li>
              </ul>
            </section>

            {/* Security */}
            <section id="security" className="rounded-2xl bg-gray-900/60 border border-gray-800 p-6 shadow mb-12">
              <motion.h2 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-2xl font-semibold text-cyan-300 mb-3">
                Security Best Practices
              </motion.h2>

              <ul className="list-disc ml-6 text-gray-400 space-y-2">
                <li>Use HttpOnly cookies for user sessions where possible.</li>
                <li>Rotate API keys and store them in secret managers.</li>
                <li>Validate and sanitize FHIR bundles server-side before ingest.</li>
                <li>Limit scopes for each API key and perform server-side scope checks.</li>
              </ul>
            </section>
          </main>
        </div>

        <div className="max-w-7xl mx-auto mt-6 text-xs text-gray-500">Replace <code className="text-cyan-300">http://localhost:3000</code> with production API base during deployment.</div>
      </div>
    </Layout>
  );
}
