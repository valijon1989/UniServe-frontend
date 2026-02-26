"use client";

import { useMemo, useRef, useState } from "react";
import type { CreateFeedInput } from "@/api/feed";

const MAX_FILES = 4;
const MAX_FILE_SIZE_MB = 20;

interface UploadPreview {
  id: string;
  file: File;
  url: string;
}

interface PostComposerProps {
  onSubmit: (payload: CreateFeedInput) => Promise<void>;
  pending?: boolean;
}

const readApiErrorMessage = (error: any) => {
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data.trim();
  if (data && typeof data.message === "string" && data.message.trim()) return data.message.trim();
  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    const first = data.errors.find((item: unknown) => typeof item === "string" && item.trim());
    if (typeof first === "string") return first.trim();
  }
  if (typeof error?.message === "string" && error.message.trim()) return error.message.trim();
  return "Post joylashda xatolik yuz berdi.";
};

const filePreviewKind = (file: File) => {
  if (file.type.startsWith("video/")) return "video";
  return "image";
};

export function PostComposer({ onSubmit, pending = false }: PostComposerProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [text, setText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [files, setFiles] = useState<UploadPreview[]>([]);
  const [error, setError] = useState<string | null>(null);

  const usedSlots = files.length;
  const remainingSlots = Math.max(0, MAX_FILES - usedSlots);

  const canPublish = useMemo(() => {
    return Boolean(text.trim() || linkUrl.trim() || files.length > 0) && !pending;
  }, [files.length, linkUrl, pending, text]);

  const clearComposer = () => {
    setText("");
    setLinkUrl("");
    files.forEach((item) => URL.revokeObjectURL(item.url));
    setFiles([]);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAddFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const incoming = Array.from(fileList);
    const oversized = incoming.find((item) => item.size > MAX_FILE_SIZE_MB * 1024 * 1024);
    if (oversized) {
      setError(`Har bir fayl ${MAX_FILE_SIZE_MB}MB dan kichik bo'lishi kerak.`);
      return;
    }

    setError(null);
    setFiles((prev) => {
      const room = Math.max(0, MAX_FILES - prev.length);
      if (room <= 0) return prev;
      const accepted = incoming.slice(0, room).map((file) => ({
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        file,
        url: URL.createObjectURL(file)
      }));
      return [...prev, ...accepted];
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) {
        URL.revokeObjectURL(target.url);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const handleSubmit = async () => {
    const cleanText = text.trim();
    const cleanLink = linkUrl.trim();

    if (!cleanText && !cleanLink && files.length === 0) {
      setError("Kamida matn, link yoki media qo'shing.");
      return;
    }

    setError(null);
    try {
      await onSubmit({
        text: cleanText,
        linkUrl: cleanLink || undefined,
        files: files.map((item) => item.file)
      });
      clearComposer();
    } catch (submitError) {
      setError(readApiErrorMessage(submitError));
    }
  };

  return (
    <section className="space-y-3 rounded-3xl border border-slate-800 bg-slate-950/75 p-4 shadow-lg shadow-black/25">
      <div>
        <p className="text-sm font-semibold text-slate-100">Yangi post</p>
        <p className="text-xs text-slate-400">Matn, havola, rasm yoki video joylashingiz mumkin.</p>
      </div>

      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Nima yangilik?"
        className="h-28 w-full rounded-2xl border border-slate-800 bg-slate-900/70 p-3 text-sm text-slate-100 outline-none ring-1 ring-transparent transition focus:border-sky-500/70 focus:ring-sky-500/30"
      />

      <div className="grid gap-2 md:grid-cols-[1fr_auto]">
        <input
          value={linkUrl}
          onChange={(event) => setLinkUrl(event.target.value)}
          placeholder="https://example.com"
          className="w-full rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none ring-1 ring-transparent transition focus:border-sky-500/70 focus:ring-sky-500/30"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={remainingSlots === 0 || pending}
          className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-sky-500/60 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Media yuklash
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={(event) => handleAddFiles(event.target.files)}
        />
      </div>

      <p className="text-xs text-slate-400">
        {usedSlots}/{MAX_FILES} media. Har bir fayl {MAX_FILE_SIZE_MB}MB gacha.
      </p>

      {files.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {files.map((item) => (
            <div key={item.id} className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/70">
              {filePreviewKind(item.file) === "video" ? (
                <video src={item.url} className="h-32 w-full object-cover" />
              ) : (
                <img src={item.url} alt={item.file.name} className="h-32 w-full object-cover" />
              )}
              <button
                type="button"
                onClick={() => handleRemoveFile(item.id)}
                className="absolute right-1 top-1 rounded-full bg-black/70 px-2 py-0.5 text-[11px] text-white"
                aria-label="Remove media"
              >
                ✕
              </button>
              <p className="truncate px-2 py-1 text-[11px] text-slate-300">{item.file.name}</p>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-xs text-rose-300">{error}</p>}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canPublish}
          className="rounded-xl bg-sky-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Joylanmoqda..." : "Post joylash"}
        </button>
      </div>
    </section>
  );
}
