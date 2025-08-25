"use client";

import { Language, detectLanguage, translations } from "@/lib/translations";
import {
  AlertCircle,
  Check,
  Code2,
  Download,
  Edit3,
  FileText,
  Globe,
  Heart,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";

interface PDFField {
  name: string;
  type: string;
  original_name: string;
  new_name?: string;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [fields, setFields] = useState<PDFField[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempName, setTempName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>("en");

  // Use environment variable for API URL, fallback to local API
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

  // Detect and set language on mount
  useEffect(() => {
    setLanguage(detectLanguage());
  }, []);

  const t = translations[language];

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file || file.type !== "application/pdf") {
        setError(t.upload.error);
        return;
      }

      setFile(file);
      setError(null);
      setSuccessMessage(null);
      setLoading(true);

      try {
        // Convert file to base64
        const reader = new FileReader();
        reader.onload = async (e) => {
          const base64 = e.target?.result?.toString().split(",")[1];

          const response = await fetch(`${API_URL}/api/analyze`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pdf: base64 }),
          });

          const data = await response.json();

          if (data.error) {
            throw new Error(data.error);
          }

          setFields(
            data.fields.map((field: PDFField) => ({
              ...field,
              new_name: field.name,
            }))
          );
          setLoading(false);
        };
        reader.readAsDataURL(file);
      } catch (error) {
        setError(t.messages.failedAnalyze);
        setLoading(false);
      }
    },
    [API_URL, t]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
  });

  const handleEditField = (fieldName: string, currentName: string) => {
    setEditingField(fieldName);
    setTempName(currentName);
  };

  const handleSaveField = (originalName: string) => {
    setFields(
      fields.map((field) =>
        field.original_name === originalName
          ? { ...field, new_name: tempName }
          : field
      )
    );
    setEditingField(null);
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setTempName("");
  };

  const handleDownloadRenamedPDF = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      // Create mappings of changed fields only
      const mappings: Record<string, string> = {};
      fields.forEach((field) => {
        if (field.name !== field.new_name) {
          mappings[field.name] = field.new_name || field.name;
        }
      });

      if (Object.keys(mappings).length === 0) {
        setError(t.fields.noFieldsRenamed);
        setLoading(false);
        return;
      }

      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result?.toString().split(",")[1];

        const response = await fetch(`${API_URL}/api/rename`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pdf: base64, mappings }),
        });

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        if (!data.success) {
          setError(data.message || t.messages.failedRename);
          setLoading(false);
          return;
        }

        // Download the renamed PDF
        const pdfData = base64ToArrayBuffer(data.pdf);
        const blob = new Blob([pdfData], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `renamed_${file.name}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        const fieldText =
          data.renamed_count === 1 ? t.messages.field : t.messages.fields;
        setSuccessMessage(
          `${t.messages.successRenamed} ${data.renamed_count} ${fieldText}`
        );
        setLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setError(t.messages.failedRename);
      setLoading(false);
    }
  };

  const base64ToArrayBuffer = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const hasChanges = fields.some((field) => field.name !== field.new_name);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-4 mb-4">
            <h1 className="text-4xl font-bold text-gray-800">{t.title}</h1>
            <button
              onClick={() => setLanguage(language === "en" ? "fr" : "en")}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors"
              title={language === "en" ? "Français" : "English"}
            >
              <Globe className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-600">
                {language === "en" ? "FR" : "EN"}
              </span>
            </button>
          </div>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>

        {/* Upload Area */}
        {!file && (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
              ${
                isDragActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg text-gray-600">
              {isDragActive ? t.upload.dropHere : t.upload.dragDrop}
            </p>
            <p className="text-sm text-gray-500 mt-2">{t.upload.onlyPdf}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Loader2 className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">{t.processing}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 flex items-center">
            <Check className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-green-700">{successMessage}</span>
          </div>
        )}

        {/* File Info & Fields */}
        {file && !loading && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* File Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="font-medium text-gray-700">{file.name}</span>
                  <span className="ml-4 text-sm text-gray-500">
                    {fields.length}{" "}
                    {fields.length === 1
                      ? t.fields.found
                      : t.fields.foundPlural}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setFile(null);
                    setFields([]);
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  {t.buttons.remove}
                </button>
              </div>
            </div>

            {/* Fields List */}
            <div className="divide-y divide-gray-200">
              {fields.map((field) => (
                <div
                  key={field.original_name}
                  className="px-6 py-4 hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                          {field.type}
                        </span>
                        {editingField === field.original_name ? (
                          <div className="flex items-center space-x-2 flex-1">
                            <input
                              type="text"
                              value={tempName}
                              onChange={(e) => setTempName(e.target.value)}
                              className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
                              autoFocus
                            />
                            <button
                              onClick={() =>
                                handleSaveField(field.original_name)
                              }
                              className="p-1 text-green-600 hover:text-green-700"
                            >
                              <Check className="h-5 w-5" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="p-1 text-red-600 hover:text-red-700"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 flex-1">
                            <span className="font-mono text-gray-800">
                              {field.new_name}
                            </span>
                            {field.name !== field.new_name && (
                              <span className="text-sm text-gray-500">
                                ({t.fields.was}: {field.name})
                              </span>
                            )}
                            <button
                              onClick={() =>
                                handleEditField(
                                  field.original_name,
                                  field.new_name || field.name
                                )
                              }
                              className="p-1 text-gray-600 hover:text-gray-700"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() =>
                    setFields(fields.map((f) => ({ ...f, new_name: f.name })))
                  }
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={!hasChanges}
                >
                  {t.buttons.resetAll}
                </button>
                <button
                  onClick={handleDownloadRenamedPDF}
                  disabled={!hasChanges || loading}
                  className={`px-4 py-2 rounded-md flex items-center space-x-2
                    ${
                      hasChanges
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                >
                  <Download className="h-4 w-4" />
                  <span>{t.buttons.download}</span>
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-200 bg-white/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 text-gray-600">
            <Code2 className="h-4 w-4" />
            <span className="text-sm">{t.footer.madeWith}</span>
            <Heart className="h-4 w-4 text-red-500" />
          </div>
          <a
            href="https://mbendev.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-gray-900 to-gray-700 text-white hover:from-gray-800 hover:to-gray-600 transition-all transform hover:scale-105"
          >
            <span className="font-semibold">{t.footer.poweredBy}</span>
            <span className="font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              MBEN DEV
            </span>
            <svg
              className="h-4 w-4 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </a>
          <p className="text-xs text-gray-500 mt-2">
            © 2025 PDF Form Field Editor. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
