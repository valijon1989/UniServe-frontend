"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import useSWR from "swr";
import toast from "react-hot-toast";
import {
  becomeAgent,
  changeMyPassword,
  checkUsernameAvailability,
  extractApiErrorMessage,
  getAgentTypes,
  getMyAgentProfile,
  getMyProfile,
  requestSoftDelete,
  type AgentMeProfile,
  type AgentKind,
  type AgentTypesResponse,
  type MyProfile,
  type BecomeAgentInput,
  type UpdateAgentMeInput,
  type UpdateMyProfileInput,
  updateMyAgentType,
  updateMyAgentProfile,
  updateMyProfile,
  uploadAvatar
} from "@/api/profile";
import { useAuthStore } from "@/store/auth";
import { ProfileSidebar, type ProfileSectionKey } from "./components/ProfileSidebar";
import { ProfileForm } from "./components/ProfileForm";
import { SecurityPanel } from "./components/SecurityPanel";

const defaultStats = {
  followers: 0,
  following: 0,
  posts: 0,
  listings: 0
};

const LOCAL_PROFILE_OVERRIDES_KEY = "profile-local-overrides-v1";
const MAX_LOCAL_AVATAR_DATA_URL_LENGTH = 120_000;
const MAX_LOCAL_AVATAR_PREVIEW_EDGE = 256;

const sanitizeLocalOverrides = (value: Partial<MyProfile> | null | undefined): Partial<MyProfile> => {
  if (!value || typeof value !== "object") return {};
  const safe: Partial<MyProfile> = {};

  if (typeof value.name === "string") safe.name = value.name;
  if (typeof value.username === "string") safe.username = value.username;
  if (typeof value.bio === "string") safe.bio = value.bio;
  if (typeof value.about === "string") safe.about = value.about;
  if (typeof value.phone === "string") safe.phone = value.phone;
  if (typeof value.location === "string") safe.location = value.location;
  if (typeof value.language === "string") safe.language = value.language;
  if (typeof value.isPrivate === "boolean") safe.isPrivate = value.isPrivate;
  if (typeof value.avatarUrl === "string") {
    const avatar = value.avatarUrl.trim();
    if (!avatar) {
      safe.avatarUrl = "";
    } else if (!avatar.startsWith("data:") || avatar.length <= MAX_LOCAL_AVATAR_DATA_URL_LENGTH) {
      safe.avatarUrl = avatar;
    }
  }

  return safe;
};

const sanitizeLocalOverridesMap = (value: Record<string, unknown>): Record<string, Partial<MyProfile>> => {
  const next: Record<string, Partial<MyProfile>> = {};
  for (const [key, raw] of Object.entries(value)) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) continue;
    const safe = sanitizeLocalOverrides(raw as Partial<MyProfile>);
    if (Object.keys(safe).length > 0) next[key] = safe;
  }
  return next;
};

const readLocalProfileOverridesMap = (): Record<string, Partial<MyProfile>> => {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(LOCAL_PROFILE_OVERRIDES_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return sanitizeLocalOverridesMap(parsed as Record<string, unknown>);
  } catch {
    return {};
  }
};

const isStatusError = (error: unknown, statuses: number[]) => {
  return error instanceof AxiosError && Boolean(error.response?.status && statuses.includes(error.response.status));
};

const isAvatarUploadUnavailableError = (error: unknown) => {
  return error instanceof Error && error.message === "avatar-upload-unavailable";
};

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Avatar file read error"));
    reader.readAsDataURL(file);
  });

const shrinkAvatarDataUrl = (dataUrl: string) =>
  new Promise<string>((resolve) => {
    const image = new Image();

    image.onload = () => {
      const naturalWidth = image.naturalWidth;
      const naturalHeight = image.naturalHeight;
      if (!naturalWidth || !naturalHeight) {
        resolve(dataUrl);
        return;
      }

      const longestEdge = Math.max(naturalWidth, naturalHeight);
      const ratio = Math.min(1, MAX_LOCAL_AVATAR_PREVIEW_EDGE / longestEdge);
      const targetWidth = Math.max(1, Math.round(naturalWidth * ratio));
      const targetHeight = Math.max(1, Math.round(naturalHeight * ratio));

      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      ctx.drawImage(image, 0, 0, targetWidth, targetHeight);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };

    image.onerror = () => resolve(dataUrl);
    image.src = dataUrl;
  });

const fileToDataUrl = async (file: File) => {
  const rawDataUrl = await readFileAsDataUrl(file);
  if (rawDataUrl.length <= MAX_LOCAL_AVATAR_DATA_URL_LENGTH) {
    return rawDataUrl;
  }
  return shrinkAvatarDataUrl(rawDataUrl);
};

const formatUsername = (profile: MyProfile | undefined, fallbackEmail?: string | null) => {
  const fromProfile = profile?.username?.trim();
  if (fromProfile) return fromProfile;
  const local = fallbackEmail?.split("@")[0]?.trim();
  return local || "user";
};

const splitCsv = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

function ProfileSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
      <div className="h-[520px] animate-pulse rounded-3xl border border-slate-800 bg-slate-900/50" />
      <div className="space-y-4">
        <div className="h-40 animate-pulse rounded-3xl border border-slate-800 bg-slate-900/50" />
        <div className="h-96 animate-pulse rounded-3xl border border-slate-800 bg-slate-900/50" />
      </div>
    </div>
  );
}

function RatingRow({ label, value }: { label: string; value: number }) {
  const width = Math.min(100, Math.max(0, value));
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-slate-300">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-800">
        <div className="h-full rounded-full bg-emerald-400" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const {
    isHydrated,
    isAuthenticated,
    userId,
    role,
    profile: sessionProfile,
    hydrateFromStorage,
    setRole,
    logout,
    updateProfile
  } = useAuthStore();

  const [activeSection, setActiveSection] = useState<ProfileSectionKey>("overview");
  const [savingProfile, setSavingProfile] = useState(false);
  const [localProfileOverrides, setLocalProfileOverrides] = useState<Partial<MyProfile>>({});
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    marketing: false
  });
  const [upgradingAgent, setUpgradingAgent] = useState(false);
  const [agentSelectionInitialized, setAgentSelectionInitialized] = useState(false);
  const [agentKind, setAgentKind] = useState<AgentKind>("SERVICE");
  const [agentCategory, setAgentCategory] = useState("consulting");
  const [agentServicesRaw, setAgentServicesRaw] = useState("");
  const [agentOfficeAddress, setAgentOfficeAddress] = useState("");
  const [agentQualification, setAgentQualification] = useState("");

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem("profile-notification-settings");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        setNotifications({
          email: Boolean((parsed as Record<string, unknown>).email),
          push: Boolean((parsed as Record<string, unknown>).push),
          marketing: Boolean((parsed as Record<string, unknown>).marketing)
        });
      }
    } catch {
      // ignore
    }
  }, []);

  const shouldFetchProfile = isHydrated && isAuthenticated;

  const {
    data: myProfile,
    error: profileError,
    isLoading: profileLoading,
    mutate: mutateProfile
  } = useSWR<MyProfile>(shouldFetchProfile ? "profile-me" : null, getMyProfile, {
    revalidateOnFocus: false
  });

  const profileRole = myProfile?.role ? String(myProfile.role).toUpperCase() : "";
  const sessionRole = role ? String(role).toUpperCase() : "";
  const activeRole = profileRole || sessionRole || "USER";
  const isAgent = activeRole === "AGENT";
  const shouldFetchAgentProfile = shouldFetchProfile && profileRole === "AGENT";

  const { data: myAgent, mutate: mutateAgent } = useSWR<AgentMeProfile | null>(
    shouldFetchAgentProfile ? "profile-agent-me" : null,
    getMyAgentProfile,
    {
      revalidateOnFocus: false
    }
  );

  const { data: agentTypes } = useSWR<AgentTypesResponse>(
    shouldFetchProfile ? "profile-agent-types" : null,
    getAgentTypes,
    {
      revalidateOnFocus: false
    }
  );

  useEffect(() => {
    if (!agentTypes || agentSelectionInitialized) return;
    const nextKind = agentTypes.defaults?.kind || agentTypes.kinds?.[0]?.value || "SERVICE";
    const nextCategory = agentTypes.categories?.[0] || "consulting";
    setAgentKind(nextKind);
    setAgentCategory(nextCategory);
    setAgentSelectionInitialized(true);
  }, [agentSelectionInitialized, agentTypes]);

  useEffect(() => {
    if (!isAgent && activeSection === "reviews") {
      setActiveSection("overview");
    }
  }, [activeSection, isAgent]);

  const profileOverrideKeys = useMemo(() => {
    const rawKeys = [
      myProfile?.id,
      myProfile?._id,
      userId,
      myProfile?.username,
      sessionProfile?.username,
      "me"
    ];
    return Array.from(new Set(rawKeys.map((value) => String(value || "").trim()).filter(Boolean)));
  }, [myProfile?._id, myProfile?.id, myProfile?.username, sessionProfile?.username, userId]);

  useEffect(() => {
    if (!isHydrated || !isAuthenticated || typeof window === "undefined") return;
    const map = readLocalProfileOverridesMap();
    for (const key of profileOverrideKeys) {
      const scoped = map[key];
      if (scoped && typeof scoped === "object") {
        setLocalProfileOverrides(sanitizeLocalOverrides(scoped));
        return;
      }
    }
    setLocalProfileOverrides({});
  }, [isAuthenticated, isHydrated, profileOverrideKeys]);

  const persistLocalProfileOverrides = (patch: Partial<MyProfile>) => {
    const safePatch = sanitizeLocalOverrides(patch);
    if (Object.keys(safePatch).length === 0) return;
    setLocalProfileOverrides((prev) => ({ ...prev, ...safePatch }));
  };

  useEffect(() => {
    if (!isHydrated || !isAuthenticated || typeof window === "undefined") return;

    const map = readLocalProfileOverridesMap();
    const scoped = sanitizeLocalOverrides(localProfileOverrides);
    if (Object.keys(scoped).length > 0) {
      for (const key of profileOverrideKeys) {
        map[key] = scoped;
      }
    } else {
      for (const key of profileOverrideKeys) {
        delete map[key];
      }
    }

    try {
      window.localStorage.setItem(LOCAL_PROFILE_OVERRIDES_KEY, JSON.stringify(map));
    } catch (error) {
      if (error instanceof DOMException && error.name === "QuotaExceededError") {
        const fallbackMap = readLocalProfileOverridesMap();
        for (const key of profileOverrideKeys) {
          delete fallbackMap[key];
        }
        try {
          window.localStorage.setItem(LOCAL_PROFILE_OVERRIDES_KEY, JSON.stringify(fallbackMap));
        } catch {
          // no-op
        }
      }
    }
  }, [isAuthenticated, isHydrated, localProfileOverrides, profileOverrideKeys]);

  const displayProfile = useMemo<MyProfile>(() => {
    const localUsername = localProfileOverrides.username?.trim();
    const remoteUsername = myProfile?.username?.trim();
    return {
      ...myProfile,
      ...localProfileOverrides,
      name: localProfileOverrides.name || myProfile?.name || sessionProfile?.name || "User",
      username: localUsername || remoteUsername || formatUsername(myProfile, myProfile?.email || null),
      bio: localProfileOverrides.bio ?? myProfile?.bio ?? myProfile?.about,
      about: localProfileOverrides.bio ?? localProfileOverrides.about ?? myProfile?.about ?? myProfile?.bio,
      avatarUrl: localProfileOverrides.avatarUrl || myProfile?.avatarUrl || sessionProfile?.avatarUrl,
      phone: myProfile?.phone ?? localProfileOverrides.phone,
      location: myProfile?.location ?? localProfileOverrides.location,
      language: myProfile?.language ?? localProfileOverrides.language,
      isPrivate: localProfileOverrides.isPrivate ?? myProfile?.isPrivate ?? false,
      role: myProfile?.role || role || "USER",
      stats: myProfile?.stats || defaultStats
    };
  }, [localProfileOverrides, myProfile, role, sessionProfile?.avatarUrl, sessionProfile?.name]);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const handleSaveProfile = async (payload: UpdateMyProfileInput) => {
    setSavingProfile(true);
    try {
      const updated = await updateMyProfile(payload);
      const localPatch: Partial<MyProfile> = {};

      if (typeof payload.name === "string") localPatch.name = payload.name;
      if (typeof payload.username === "string") localPatch.username = payload.username;
      if (typeof payload.bio === "string") {
        localPatch.bio = payload.bio;
        localPatch.about = payload.bio;
      }
      if (typeof payload.isPrivate === "boolean") localPatch.isPrivate = payload.isPrivate;
      if (typeof payload.phone === "string") localPatch.phone = payload.phone;
      if (typeof payload.location === "string") localPatch.location = payload.location;
      if (typeof payload.language === "string") localPatch.language = payload.language;
      const serverAvatar = typeof updated.avatarUrl === "string" ? updated.avatarUrl.trim() : "";
      const requestedAvatar = typeof payload.avatarUrl === "string" ? payload.avatarUrl.trim() : "";
      const resolvedAvatar = serverAvatar || requestedAvatar;
      if (resolvedAvatar) {
        localPatch.avatarUrl = resolvedAvatar;
      }

      persistLocalProfileOverrides(localPatch);
      updateProfile({
        name: (updated.name || localPatch.name || sessionProfile?.name || "").trim() || undefined,
        username: (updated.username || localPatch.username || sessionProfile?.username || "").trim() || undefined,
        avatarUrl: (resolvedAvatar || sessionProfile?.avatarUrl || "").trim() || undefined
      });

      await mutateProfile(
        (prev) => ({
          ...(prev || {}),
          ...updated,
          ...localPatch,
          stats: updated.stats || prev?.stats || defaultStats
        }),
        { revalidate: false }
      );
      toast.success("Profile saved");
    } catch (error) {
      toast.error(extractApiErrorMessage(error, "Profilni saqlab bo'lmadi"));
      throw error;
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveAgent = async (payload: UpdateAgentMeInput) => {
    if (!isAgent) return;
    try {
      const updated = await updateMyAgentProfile(payload);
      await mutateAgent(updated, { revalidate: false });
    } catch (error) {
      if (isStatusError(error, [404, 405])) {
        toast.error("Agent profile endpoint topilmadi");
        return;
      }
      toast.error(extractApiErrorMessage(error, "Agent sozlamalarini saqlab bo'lmadi"));
      throw error;
    }
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      const url = await uploadAvatar(file);
      const cleanUrl = String(url || "").trim();
      if (cleanUrl) {
        persistLocalProfileOverrides({ avatarUrl: cleanUrl });
        updateProfile({
          avatarUrl: cleanUrl,
          name: (displayProfile.name || sessionProfile?.name || "").trim() || undefined,
          username: (displayProfile.username || sessionProfile?.username || "").trim() || undefined
        });
        await mutateProfile(
          (prev) => ({
            ...(prev || {}),
            avatarUrl: cleanUrl
          }),
          { revalidate: false }
        );
      }
      toast.success("Avatar uploaded");
      return url;
    } catch (error) {
      if (isStatusError(error, [404, 405]) || isAvatarUploadUnavailableError(error)) {
        const localDataUrl = await fileToDataUrl(file);
        toast("Avatar upload endpoint topilmadi, local preview qo'llandi.");
        return localDataUrl;
      }
      toast.error(extractApiErrorMessage(error, "Avatar yuklashda xatolik"));
      throw error;
    }
  };

  const handleCheckUsername = async (username: string) => {
    try {
      return await checkUsernameAvailability(username);
    } catch {
      return null;
    }
  };

  const handlePasswordChange = async (payload: { currentPassword: string; newPassword: string }) => {
    try {
      await changeMyPassword(payload);
      toast.success("Password updated");
    } catch (error) {
      if (isStatusError(error, [404, 405])) {
        toast.error("Password endpoint hali backendda yoq");
        return;
      }
      toast.error(extractApiErrorMessage(error, "Password yangilanmadi"));
      throw error;
    }
  };

  const handleSoftDelete = async () => {
    try {
      await requestSoftDelete();
      toast.success("Account soft delete request yuborildi");
      handleLogout();
    } catch (error) {
      if (isStatusError(error, [404, 405])) {
        toast.error("Soft delete endpoint hali backendda yoq");
        return;
      }
      toast.error(extractApiErrorMessage(error, "Accountni yopib bo'lmadi"));
      throw error;
    }
  };

  const handleBecomeOrUpdateAgent = async () => {
    const normalizedCategory = agentCategory.trim().toLowerCase();
    if (!normalizedCategory) {
      toast.error("Agent category tanlang");
      return;
    }

    const normalizedServices = splitCsv(agentServicesRaw);
    const payload: BecomeAgentInput = {
      kind: agentKind,
      serviceCategory: normalizedCategory,
      serviceOfficeAddress: agentOfficeAddress.trim() || undefined,
      serviceQualification: agentQualification.trim() || undefined,
      ...(agentKind === "SELLER"
        ? { materialServices: normalizedServices }
        : { socialServices: normalizedServices })
    };

    setUpgradingAgent(true);
    try {
      if (isAgent) {
        await updateMyAgentType(payload);
        toast.success("Agent type updated");
      } else {
        await becomeAgent(payload);
        toast.success("Agent maqomi yoqildi");
      }

      setRole("AGENT");
      await mutateProfile((prev) => ({ ...(prev || {}), role: "AGENT" }), { revalidate: false });
      await mutateProfile();
      await mutateAgent();
    } catch (error) {
      toast.error(extractApiErrorMessage(error, "Agent maqomini yangilab bo'lmadi"));
    } finally {
      setUpgradingAgent(false);
    }
  };

  const saveNotificationSettings = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("profile-notification-settings", JSON.stringify(notifications));
    }
    toast.success("Notification settings saved");
  };

  if (!isHydrated || (shouldFetchProfile && (profileLoading || !myProfile))) {
    return <ProfileSkeleton />;
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-2xl rounded-3xl border border-slate-800 bg-slate-950/70 p-8 text-center shadow-xl shadow-black/20">
        <h1 className="text-xl font-semibold text-slate-100">Login required</h1>
        <p className="mt-2 text-sm text-slate-400">Profile sahifasini ko'rish uchun avval tizimga kiring.</p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500"
          >
            Go to login
          </button>
          <Link href="/" className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-slate-500">
            Back home
          </Link>
        </div>
      </div>
    );
  }

  if (profileError) {
    const message = extractApiErrorMessage(profileError, "Profil ma'lumotlari yuklanmadi");
    return (
      <div className="mx-auto max-w-2xl rounded-3xl border border-rose-500/30 bg-rose-500/10 p-8 text-center">
        <h1 className="text-lg font-semibold text-rose-100">Profile load failed</h1>
        <p className="mt-2 text-sm text-rose-100/90">{message}</p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => mutateProfile()}
            className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-400"
          >
            Retry
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl border border-rose-300/40 px-4 py-2 text-sm text-rose-50 hover:bg-rose-500/20"
          >
            Login again
          </button>
        </div>
      </div>
    );
  }

  const stats = displayProfile.stats || defaultStats;
  const rating = myAgent?.ratingAvg || 0;
  const ratingCount = myAgent?.ratingCount || 0;

  const renderSection = () => {
    const availableKinds = agentTypes?.kinds?.length
      ? agentTypes.kinds
      : [
          { value: "SERVICE" as AgentKind, label: "Service Agent" },
          { value: "SELLER" as AgentKind, label: "Seller Agent" }
        ];
    const availableCategories = agentTypes?.categories?.length
      ? agentTypes.categories
      : ["consulting", "translation", "legal", "delivery", "taxi", "education", "construction", "products"];

    if (activeSection === "security") {
      return <SecurityPanel onChangePassword={handlePasswordChange} onSoftDelete={handleSoftDelete} />;
    }

    if (activeSection === "listings") {
      return (
        <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/70 p-5 shadow-xl shadow-black/20">
          <h2 className="text-lg font-semibold text-slate-100">My Listings</h2>
          <p className="text-sm text-slate-400">Products va services listinglaringiz shu yerda boshqariladi.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/products" className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 hover:border-sky-500/50">
              <p className="text-xs uppercase tracking-wide text-slate-500">Products</p>
              <p className="mt-2 text-2xl font-bold text-slate-100">{stats.listings}</p>
              <p className="mt-1 text-sm text-slate-400">Mahsulotlar ro'yxati</p>
            </Link>
            <Link href="/services" className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 hover:border-sky-500/50">
              <p className="text-xs uppercase tracking-wide text-slate-500">Services</p>
              <p className="mt-2 text-2xl font-bold text-slate-100">{isAgent ? stats.listings : 0}</p>
              <p className="mt-1 text-sm text-slate-400">Xizmatlar ro'yxati</p>
            </Link>
          </div>
        </section>
      );
    }

    if (activeSection === "reviews") {
      if (!isAgent) {
        return (
          <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5 text-sm text-slate-400 shadow-xl shadow-black/20">
            Reviews panel faqat agentlar uchun ochiq.
          </section>
        );
      }

      const breakdown = myAgent?.ratingBreakdown || {
        five: 0,
        four: 0,
        three: 0,
        two: 0,
        one: 0
      };

      return (
        <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/70 p-5 shadow-xl shadow-black/20">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-100">Reviews / Ratings</h2>
            <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-200">
              {rating.toFixed(1)} / 5 ({ratingCount})
            </span>
          </div>

          <div className="space-y-3">
            <RatingRow label="5 stars" value={breakdown.five} />
            <RatingRow label="4 stars" value={breakdown.four} />
            <RatingRow label="3 stars" value={breakdown.three} />
            <RatingRow label="2 stars" value={breakdown.two} />
            <RatingRow label="1 star" value={breakdown.one} />
          </div>
        </section>
      );
    }

    if (activeSection === "wallet") {
      return (
        <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5 shadow-xl shadow-black/20">
          <h2 className="text-lg font-semibold text-slate-100">Wallet / Payments</h2>
          <p className="mt-2 text-sm text-slate-400">To'lovlar bo'limi keyingi iteratsiyada ulanadi.</p>
        </section>
      );
    }

    if (activeSection === "notifications") {
      return (
        <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/70 p-5 shadow-xl shadow-black/20">
          <h2 className="text-lg font-semibold text-slate-100">Notifications</h2>
          <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
            <label className="flex items-center justify-between text-sm text-slate-200">
              <span>Email notifications</span>
              <input
                type="checkbox"
                checked={notifications.email}
                onChange={(e) => setNotifications((prev) => ({ ...prev, email: e.target.checked }))}
                className="h-4 w-4 accent-sky-500"
              />
            </label>
            <label className="flex items-center justify-between text-sm text-slate-200">
              <span>Push notifications</span>
              <input
                type="checkbox"
                checked={notifications.push}
                onChange={(e) => setNotifications((prev) => ({ ...prev, push: e.target.checked }))}
                className="h-4 w-4 accent-sky-500"
              />
            </label>
            <label className="flex items-center justify-between text-sm text-slate-200">
              <span>Marketing messages</span>
              <input
                type="checkbox"
                checked={notifications.marketing}
                onChange={(e) => setNotifications((prev) => ({ ...prev, marketing: e.target.checked }))}
                className="h-4 w-4 accent-sky-500"
              />
            </label>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={saveNotificationSettings}
              className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500"
            >
              Save notifications
            </button>
          </div>
        </section>
      );
    }

    return (
      <div className="space-y-4">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 shadow-lg shadow-black/15">
            <p className="text-xs uppercase tracking-wide text-slate-500">Followers</p>
            <p className="mt-2 text-2xl font-bold text-slate-100">{stats.followers}</p>
          </article>
          <article className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 shadow-lg shadow-black/15">
            <p className="text-xs uppercase tracking-wide text-slate-500">Following</p>
            <p className="mt-2 text-2xl font-bold text-slate-100">{stats.following}</p>
          </article>
          <article className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 shadow-lg shadow-black/15">
            <p className="text-xs uppercase tracking-wide text-slate-500">Posts</p>
            <p className="mt-2 text-2xl font-bold text-slate-100">{stats.posts}</p>
          </article>
          <article className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 shadow-lg shadow-black/15">
            <p className="text-xs uppercase tracking-wide text-slate-500">Listings</p>
            <p className="mt-2 text-2xl font-bold text-slate-100">{stats.listings}</p>
          </article>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 shadow-lg shadow-black/15">
            <h3 className="text-sm font-semibold text-slate-100">About</h3>
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-300">
              {displayProfile.bio || "Bio hali to'ldirilmagan."}
            </p>
          </article>
          <article className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 shadow-lg shadow-black/15">
            <h3 className="text-sm font-semibold text-slate-100">Contact</h3>
            <dl className="mt-2 space-y-2 text-sm text-slate-300">
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Email</dt>
                <dd className="truncate">{displayProfile.email || "-"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Phone</dt>
                <dd>{displayProfile.phone || "-"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Location</dt>
                <dd>{displayProfile.location || "-"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Language</dt>
                <dd>{displayProfile.language || "-"}</dd>
              </div>
            </dl>
          </article>
        </section>

        <section className="rounded-2xl border border-sky-500/25 bg-sky-500/5 p-4 shadow-lg shadow-black/15">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-sky-200">
                {isAgent ? "Agent type settings" : "Account type upgrade"}
              </h3>
              <p className="mt-1 text-sm text-slate-300">
                {isAgent
                  ? "Agent turini shu yerdan yangilang."
                  : "Oddiy user maqomidan agent maqomiga shu yerda o'tishingiz mumkin."}
              </p>
            </div>
            <span className="rounded-full border border-sky-500/40 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-200">
              {isAgent ? "AGENT" : "USER"}
            </span>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-xs uppercase tracking-wide text-slate-400">Agent kind</span>
              <select
                value={agentKind}
                onChange={(event) => setAgentKind(event.target.value as AgentKind)}
                className="w-full rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500/60"
              >
                {availableKinds.map((kind) => (
                  <option key={kind.value} value={kind.value}>
                    {kind.label || kind.value}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-xs uppercase tracking-wide text-slate-400">Service category</span>
              <select
                value={agentCategory}
                onChange={(event) => setAgentCategory(event.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500/60"
              >
                {availableCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 md:col-span-2">
              <span className="text-xs uppercase tracking-wide text-slate-400">
                {agentKind === "SELLER" ? "Material services" : "Social services"} (comma separated)
              </span>
              <input
                value={agentServicesRaw}
                onChange={(event) => setAgentServicesRaw(event.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500/60"
                placeholder={agentKind === "SELLER" ? "delivery, logistics, products" : "consulting, legal, translation"}
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs uppercase tracking-wide text-slate-400">Office address (optional)</span>
              <input
                value={agentOfficeAddress}
                onChange={(event) => setAgentOfficeAddress(event.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500/60"
                placeholder="Office location"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs uppercase tracking-wide text-slate-400">Qualification (optional)</span>
              <input
                value={agentQualification}
                onChange={(event) => setAgentQualification(event.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500/60"
                placeholder="Certificates / skills"
              />
            </label>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleBecomeOrUpdateAgent}
              disabled={upgradingAgent}
              className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {upgradingAgent && (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              )}
              {isAgent ? "Update agent type" : "Become agent"}
            </button>
          </div>
        </section>

        {isAgent && (
          <section className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-4 shadow-lg shadow-black/15">
            <h3 className="text-sm font-semibold text-emerald-200">Agent panel</h3>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-emerald-300">Categories</p>
                <p className="mt-1 text-sm text-slate-200">
                  {myAgent?.categories?.length ? myAgent.categories.join(", ") : "No categories"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-emerald-300">Pricing / Availability</p>
                <p className="mt-1 text-sm text-slate-200">{myAgent?.pricing || "-"}</p>
                <p className="text-sm text-slate-300">{myAgent?.availability || "-"}</p>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-xs uppercase tracking-wide text-emerald-300">Portfolio</p>
              {myAgent?.portfolio?.length ? (
                <ul className="mt-1 space-y-1">
                  {myAgent.portfolio.slice(0, 4).map((url) => (
                    <li key={url}>
                      <a href={url} target="_blank" rel="noreferrer" className="text-sm text-sky-300 hover:text-sky-200">
                        {url}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1 text-sm text-slate-300">Portfolio media qo'shilmagan.</p>
              )}
            </div>
          </section>
        )}

        <ProfileForm
          profile={displayProfile}
          agentProfile={myAgent || null}
          isAgent={isAgent}
          saving={savingProfile}
          onSaveProfile={handleSaveProfile}
          onSaveAgent={handleSaveAgent}
          onUploadAvatar={handleAvatarUpload}
          onCheckUsername={handleCheckUsername}
        />
      </div>
    );
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
      <ProfileSidebar
        user={{
          name: displayProfile.name || "User",
          username: formatUsername(displayProfile, displayProfile.email),
          role: activeRole,
          avatarUrl: displayProfile.avatarUrl,
          verified: Boolean(displayProfile.isVerified || activeRole === "ADMIN" || activeRole === "AGENT")
        }}
        activeSection={activeSection}
        isAgent={isAgent}
        onSectionChange={setActiveSection}
        onEditProfile={() => setActiveSection("overview")}
        onLogout={handleLogout}
      />

      <div className="space-y-4">{renderSection()}</div>
    </div>
  );
}
