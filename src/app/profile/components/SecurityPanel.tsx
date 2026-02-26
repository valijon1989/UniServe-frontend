"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

interface SecurityFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface SecurityPanelProps {
  onChangePassword: (payload: { currentPassword: string; newPassword: string }) => Promise<void>;
  onSoftDelete: () => Promise<void>;
}

export function SecurityPanel({ onChangePassword, onSoftDelete }: SecurityPanelProps) {
  const [deleting, setDeleting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<SecurityFormValues>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
  });

  const newPassword = watch("newPassword");

  const onSubmit = handleSubmit(async (values) => {
    await onChangePassword({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword
    });
    reset();
  });

  const handleSoftDelete = async () => {
    setDeleting(true);
    try {
      await onSoftDelete();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section className="space-y-5 rounded-3xl border border-slate-800 bg-slate-950/70 p-5 shadow-xl shadow-black/20">
      <header>
        <h2 className="text-lg font-semibold text-slate-100">Security</h2>
        <p className="mt-1 text-sm text-slate-400">Password, sessions va account xavfsizligi sozlamalari.</p>
      </header>

      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-1">
            <span className="text-xs uppercase tracking-wide text-slate-400">Current password</span>
            <input
              type="password"
              {...register("currentPassword", { required: "Current password required" })}
              className="w-full rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500/60"
            />
            {errors.currentPassword && <span className="text-xs text-rose-300">{errors.currentPassword.message}</span>}
          </label>

          <label className="space-y-1">
            <span className="text-xs uppercase tracking-wide text-slate-400">New password</span>
            <input
              type="password"
              {...register("newPassword", {
                required: "New password required",
                minLength: { value: 8, message: "Minimum 8 characters" }
              })}
              className="w-full rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500/60"
            />
            {errors.newPassword && <span className="text-xs text-rose-300">{errors.newPassword.message}</span>}
          </label>

          <label className="space-y-1">
            <span className="text-xs uppercase tracking-wide text-slate-400">Confirm password</span>
            <input
              type="password"
              {...register("confirmPassword", {
                required: "Please confirm password",
                validate: (value) => value === newPassword || "Passwords do not match"
              })}
              className="w-full rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500/60"
            />
            {errors.confirmPassword && <span className="text-xs text-rose-300">{errors.confirmPassword.message}</span>}
          </label>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting && (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            )}
            Update password
          </button>
        </div>
      </form>

      <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
        <h3 className="text-sm font-semibold text-slate-100">Sessions</h3>
        <p className="mt-1 text-sm text-slate-400">Session management panel keyingi bosqichda ulanadi.</p>
      </section>

      <section className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4">
        <h3 className="text-sm font-semibold text-rose-200">Delete account</h3>
        <p className="mt-1 text-sm text-rose-200/80">Soft delete rejimi orqali account vaqtincha yopiladi.</p>
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={handleSoftDelete}
            disabled={deleting}
            className="inline-flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/15 px-4 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/25 disabled:opacity-60"
          >
            {deleting && <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-rose-200/40 border-t-rose-100" />}
            Soft delete request
          </button>
        </div>
      </section>
    </section>
  );
}
