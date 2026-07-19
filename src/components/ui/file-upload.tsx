"use client";

import * as React from "react";
import { Paperclip, Loader2, X, FileText, Camera } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export interface UploadedFile {
  id: string;
  url: string;
  fileName: string;
  contentType?: string;
  encrypted?: boolean;
  encryptionMode?: string | null;
}

/**
 * Reusable encrypted upload control (A.9 + I.56 Storage Vault).
 *
 * IMPORTANT: this no longer does direct browser-to-storage presigned uploads.
 * It posts the file to NEYO first, so the server can encrypt the bytes with the
 * tenant key before any external provider receives the object.
 */
async function calculateFileSha256(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function downsampleImageToWebP(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || typeof document === "undefined") return file;
  if (file.size <= 200_000) return file;

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 1600;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) { resolve(file); return; }
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size >= file.size) { resolve(file); return; }
            const newName = file.name.replace(/\.[^.]+$/, "") + ".webp";
            const newFile = new File([blob], newName, { type: "image/webp", lastModified: Date.now() });
            resolve(newFile);
          },
          "image/webp",
          0.82
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

export function FileUpload({
  category = "attachment",
  accept = "image/*,application/pdf",
  onUploaded,
  label = "Attach",
  capture,
}: {
  category?: string;
  accept?: string;
  onUploaded: (file: UploadedFile) => void;
  label?: string;
  /** Set false to suppress mobile camera capture for image upload surfaces. */
  capture?: "user" | "environment" | false;
}) {
  const { toast } = useToast();
  const [uploading, setUploading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const canCapturePhoto = accept.split(",").some((part) => part.trim().startsWith("image/"));
  const captureValue = capture === false || !canCapturePhoto ? undefined : (capture ?? "environment");
  const buttonLabel = canCapturePhoto ? `${label} / take photo` : label;

  async function handleFile(rawFile: File) {
    setUploading(true);
    try {
      // 1. In-Browser WebWorker/Canvas Downsampling for large images
      const file = await downsampleImageToWebP(rawFile);
      const originalSizeBytes = rawFile.size;

      // 2. Pre-Upload SHA-256 CAS Deduplication Check
      try {
        const sha256 = await calculateFileSha256(file);
        const casRes = await fetch("/api/storage/check-hash", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sha256 }),
        });
        const casJson = await casRes.json().catch(() => ({}));
        if (casJson.ok && (casJson.data?.exists || casJson.exists)) {
          const matchedUrl = casJson.data?.url || casJson.url;
          toast({
            title: "⚡ CAS Deduplication Hit!",
            description: `Instant 0-byte upload for '${file.name}' — saved ${Math.round(file.size / 1024)} KB cloud storage.`,
            tone: "success",
          });
          onUploaded({
            id: matchedUrl,
            url: matchedUrl,
            fileName: file.name,
            contentType: file.type,
            encrypted: true,
          });
          return;
        }
      } catch {
        // Fall back gracefully to full upload if CAS check fails
      }

      // 3. Proceed with standard encrypted upload
      const form = new FormData();
      form.append("file", file);
      form.append("category", category);
      form.append("originalSizeBytes", String(originalSizeBytes));

      const res = await fetch("/api/files/encrypted", {
        method: "POST",
        body: form,
      });
      const json = await res.json();
      if (!json.ok) {
        toast({ title: json.error?.message || "Encrypted upload failed.", tone: "error" });
        return;
      }
      onUploaded(json.data);
    } catch {
      toast({ title: "Network problem during encrypted upload.", tone: "error" });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        capture={captureValue}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        aria-label={buttonLabel}
        title={buttonLabel}
        className="flex h-11 w-11 items-center justify-center rounded-full text-navy-500 transition-colors hover:bg-navy-100 disabled:opacity-50 dark:text-navy-300 dark:hover:bg-navy-800"
      >
        {uploading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : canCapturePhoto ? (
          <Camera className="h-5 w-5" />
        ) : (
          <Paperclip className="h-5 w-5" />
        )}
      </button>
    </>
  );
}

/** Small chip showing a staged attachment with a remove button. */
export function AttachmentChip({
  file,
  onRemove,
}: {
  file: UploadedFile;
  onRemove: () => void;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-navy-200 bg-navy-50 px-3 py-1 text-xs text-navy-700 dark:border-navy-700 dark:bg-navy-800 dark:text-navy-200">
      <FileText className="h-3.5 w-3.5" />
      <span className="max-w-[12rem] truncate">{file.fileName}</span>
      {file.encrypted ? <span className="rounded-full bg-green-500/10 px-1.5 py-0.5 text-[10px] font-bold text-green-700">encrypted</span> : null}
      <button onClick={onRemove} aria-label="Remove" className="text-navy-400 hover:text-red-500">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
