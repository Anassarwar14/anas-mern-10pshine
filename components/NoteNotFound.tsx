"use client";

import Link from "next/link";
import { ArrowLeft, FileX2 } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-rose-50/50 dark:bg-stone-900/60  px-4">
      <div className="absolute top-6 left-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-md border border-rose-200/50 bg-white/50 dark:bg-stone-800/50 px-4 py-2 text-sm font-medium text-rose-600 hover:text-rose-700 hover:border-rose-300 transition-all backdrop-blur-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back</span>
        </Link>
      </div>

      <div className="relative z-10 max-w-md w-full text-center space-y-8">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-rose-100/70 dark:bg-rose-950/40 backdrop-blur-sm shadow-inner">
          <FileX2 className="h-12 w-12 text-rose-500 dark:text-rose-400" strokeWidth={1.5} />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-800 dark:text-gray-100">
            Note Not Found
          </h1>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
            This note may have been deleted or never existed.
          </p>
        </div>

        <p className="text-sm md:text-base text-gray-600/80 dark:text-gray-400/80 leading-relaxed">
          The note you seek has drifted quietly into the digital void, a memory, a whisper, or perhaps a thought never
          saved.
        </p>

        <p className="text-xs text-gray-400/70 pt-6">Error 404 • Note Void</p>
      </div>
    </div>
  );
}
