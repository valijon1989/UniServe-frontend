"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import type {
  AgentMeProfile,
  MyProfile,
  UpdateAgentMeInput,
  UpdateMyProfileInput
} from "@/api/profile";
import { Avatar } from "@/components/ui/Avatar";

type UsernameStatus = "idle" | "checking" | "available" | "taken" | "unknown";

type ProfileFormValues = {
  name: string;
  username: string;
  bio: string;
  phone: string;
  location: string;
  language: string;
  avatarUrl: string;
  isPrivate: boolean;
  categories: string;
  pricing: string;
  availability: string;
  portfolio: string;
};

interface ProfileFormProps {
  profile: MyProfile;
  agentProfile: AgentMeProfile | null;
  isAgent: boolean;
  saving: boolean;
  onSaveProfile: (payload: UpdateMyProfileInput) => Promise<void>;
  onSaveAgent: (payload: UpdateAgentMeInput) => Promise<void>;
  onUploadAvatar: (file: File) => Promise<string>;
  onCheckUsername: (username: string) => Promise<boolean | null>;
}

const splitCsv = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const splitLines = (value: string) =>
  value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

export function ProfileForm({
  profile,
  agentProfile,
  isAgent,
  saving,
  onSaveProfile,
  onSaveAgent,
  onUploadAvatar,
  onCheckUsername
}: ProfileFormProps) {
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");

  const defaults = useMemo<ProfileFormValues>(
    () => ({
      name: profile.name || "",
      username: profile.username || "",
      bio: profile.bio || profile.about || "",
      phone: profile.phone || "",
      location: profile.location || "",
      language: profile.language || "",
      avatarUrl: profile.avatarUrl || "",
      isPrivate: Boolean(profile.isPrivate),
      categories: agentProfile?.categories?.join(", ") || "",
      pricing: agentProfile?.pricing || "",
      availability: agentProfile?.availability || "",
      portfolio: agentProfile?.portfolio?.join("\n") || ""
    }),
    [agentProfile, profile]
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm<ProfileFormValues>({
    defaultValues: defaults
  });

  useEffect(() => {
    reset(defaults);
    setUsernameStatus("idle");
  }, [defaults, reset]);

  const username = watch("username");
  const avatarUrl = watch("avatarUrl");
  const normalizedUsername = username.trim();
  const baseUsername = (profile.username || "").trim();

  useEffect(() => {
    let canceled = false;

    if (!normalizedUsername || normalizedUsername.length < 3 || normalizedUsername === baseUsername) {
      setUsernameStatus("idle");
      return () => {
        canceled = true;
      };
    }

    setUsernameStatus("checking");

    const timer = window.setTimeout(async () => {
      try {
        const available = await onCheckUsername(normalizedUsername);
        if (canceled) return;
        if (available === true) setUsernameStatus("available");
        else if (available === false) setUsernameStatus("taken");
        else setUsernameStatus("unknown");
      } catch {
        if (!canceled) setUsernameStatus("unknown");
      }
    }, 450);

    return () => {
      canceled = true;
      window.clearTimeout(timer);
    };
  }, [baseUsername, normalizedUsername, onCheckUsername]);

  const handleAvatarFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;

    setAvatarUploading(true);
    try {
      const url = await onUploadAvatar(file);
      setValue("avatarUrl", url, { shouldDirty: true });
    } catch {
      // Error toast is handled by parent; prevent unhandled promise rejection here.
    } finally {
      setAvatarUploading(false);
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    try {
      await onSaveProfile({
        name: values.name.trim(),
        username: values.username.trim(),
        bio: values.bio.trim(),
        phone: values.phone.trim(),
        location: values.location.trim(),
        language: values.language.trim(),
        avatarUrl: values.avatarUrl.trim(),
        isPrivate: Boolean(values.isPrivate)
      });

      if (isAgent) {
        await onSaveAgent({
          categories: splitCsv(values.categories),
          pricing: values.pricing.trim(),
          availability: values.availability.trim(),
          portfolio: splitLines(values.portfolio)
        });
      }
    } catch {
      // Parent handles user-facing error toasts; keep submit flow from throwing globally.
    }
  });

  const usernameStatusText: Record<UsernameStatus, string> = {
    idle: "",
    checking: "Checking...",
    available: "Username available",
    taken: "Username taken",
    unknown: "Username check unavailable"
  };

  const usernameStatusTone: Record<UsernameStatus, string> = {
    idle: "text-slate-500",
    checking: "text-slate-400",
    available: "text-emerald-300",
    taken: "text-rose-300",
    unknown: "text-amber-300"
  };

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5 shadow-xl shadow-black/20">
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <Avatar
          src={avatarUrl}
          alt={profile.name || "User"}
          fallbackText={profile.name || profile.username || "User"}
          size={64}
          className="border border-slate-700 bg-slate-900"
        />

        <div className="flex items-center gap-2">
          <label className="cursor-pointer rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-200 hover:border-slate-500">
            Avatar upload
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarFile} />
          </label>
          {avatarUploading && <span className="text-xs text-slate-400">Uploading...</span>}
        </div>
      </div>

      <form className="space-y-5" onSubmit={onSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-xs uppercase tracking-wide text-slate-400">Name</span>
            <input
              {...register("name", { required: "Name is required", minLength: { value: 2, message: "Min 2 chars" } })}
              className="w-full rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500/60"
              placeholder="Your name"
            />
            {errors.name && <span className="text-xs text-rose-300">{errors.name.message}</span>}
          </label>

          <label className="space-y-1">
            <span className="text-xs uppercase tracking-wide text-slate-400">Username</span>
            <input
              {...register("username", {
                required: "Username is required",
                minLength: { value: 3, message: "Min 3 chars" },
                pattern: { value: /^[a-zA-Z0-9._-]+$/, message: "Only letters, numbers, ., _, -" }
              })}
              className="w-full rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500/60"
              placeholder="username"
              autoComplete="off"
            />
            {errors.username ? (
              <span className="text-xs text-rose-300">{errors.username.message}</span>
            ) : (
              usernameStatus !== "idle" && (
                <span className={`text-xs ${usernameStatusTone[usernameStatus]}`}>{usernameStatusText[usernameStatus]}</span>
              )
            )}
          </label>
        </div>

        <label className="space-y-1">
          <span className="text-xs uppercase tracking-wide text-slate-400">Bio / About</span>
          <textarea
            {...register("bio")}
            className="h-24 w-full rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500/60"
            placeholder="Short bio"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-1">
            <span className="text-xs uppercase tracking-wide text-slate-400">Phone</span>
            <input
              {...register("phone")}
              className="w-full rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500/60"
              placeholder="+998..."
            />
          </label>

          <label className="space-y-1">
            <span className="text-xs uppercase tracking-wide text-slate-400">Location</span>
            <input
              {...register("location")}
              className="w-full rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500/60"
              placeholder="Tashkent"
            />
          </label>

          <label className="space-y-1">
            <span className="text-xs uppercase tracking-wide text-slate-400">Language</span>
            <input
              {...register("language")}
              className="w-full rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500/60"
              placeholder="uz, ru, en"
            />
          </label>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
          <label className="flex items-center justify-between gap-3 text-sm text-slate-200">
            <span>Private profile</span>
            <input type="checkbox" {...register("isPrivate")} className="h-4 w-4 accent-sky-500" />
          </label>
          <p className="mt-1 text-xs text-slate-400">Turn on to hide your profile from public users.</p>
        </div>

        {isAgent && (
          <div className="space-y-4 rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4">
            <p className="text-sm font-semibold text-emerald-200">Agent settings</p>

            <label className="space-y-1">
              <span className="text-xs uppercase tracking-wide text-emerald-300">Service categories</span>
              <input
                {...register("categories")}
                className="w-full rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500/60"
                placeholder="legal, consulting, translation"
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-xs uppercase tracking-wide text-emerald-300">Pricing</span>
                <input
                  {...register("pricing")}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500/60"
                  placeholder="$50 / hour"
                />
              </label>

              <label className="space-y-1">
                <span className="text-xs uppercase tracking-wide text-emerald-300">Availability</span>
                <input
                  {...register("availability")}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500/60"
                  placeholder="Mon-Fri 10:00-18:00"
                />
              </label>
            </div>

            <label className="space-y-1">
              <span className="text-xs uppercase tracking-wide text-emerald-300">Portfolio (1 URL per line)</span>
              <textarea
                {...register("portfolio")}
                className="h-24 w-full rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500/60"
                placeholder="https://..."
              />
            </label>
          </div>
        )}

        <input type="hidden" {...register("avatarUrl")} />

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving || avatarUploading}
            className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {(saving || avatarUploading) && (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            )}
            Save changes
          </button>
        </div>
      </form>
    </section>
  );
}
