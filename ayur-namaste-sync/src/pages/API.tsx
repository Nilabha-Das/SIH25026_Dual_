import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Globe } from "lucide-react";

const apiList = [
  {
    name: "Namaste API",
    url: "http://localhost:3000/api/namaste",
    description: "Provides standardized NAMASTE codes for Ayurveda, Siddha, and Unani disorders."
  },
  {
    name: "ICD API",
    url: "http://localhost:3000/api/icd",
    description: "Fetches ICD codes for modern healthcare interoperability."
  },
  {
    name: "Mapping API",
    url: "http://localhost:3000/api/mapping",
    description: "Maps NAMASTE codes with ICD codes for smooth integration."
  },
  {
    name: "FHIR Bundle API",
    url: "http://localhost:3000/api/mapping",
    description: "Generates FHIR bundles for standardized health data exchange."
  },
  {
    name: "Register API",
    url: "http://localhost:3000/api/auth/register",
    description: "Handles user registration and authentication securely."
  },
];

export default function ApiDocs() {
  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    alert("Copied: " + url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-10">
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-4xl font-extrabold text-gray-900 text-center mb-10"
      >
        Find your API?
      </motion.h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {apiList.map((api, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
          >
            <Card className="rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 bg-white">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <Globe size={20} className="text-blue-500" /> {api.name}
                </h2>
                <p className="text-gray-600 mb-4">{api.description}</p>
                <div className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-lg">
                  <code className="text-sm text-gray-700 truncate">{api.url}</code>
                  <button
                    onClick={() => copyToClipboard(api.url)}
                    className="p-2 rounded-lg hover:bg-blue-500 hover:text-white transition"
                  >
                    <Copy size={18} />
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
