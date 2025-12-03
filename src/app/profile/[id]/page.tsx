"use client";

import { useParams } from "next/navigation";

export default function PublicProfilePage() {
  const params = useParams();
  const id = params?.id as string;

  return (
    <div className="mx-auto max-w-4xl space-y-3 px-4 py-6">
      <h1 className="text-xl font-semibold text-slate-100">
        Public profile: {id}
      </h1>
      <p className="text-sm text-slate-400">
        Public profile view coming soon.
      </p>
    </div>
  );
}
