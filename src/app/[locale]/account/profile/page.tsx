"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, type ProfileFormData } from "@/lib/validators/profile";
import { useAuth } from "@/providers/AuthProvider";
import { toast } from "sonner";

const INPUT =
  "w-full rounded-lg border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] px-3 py-2.5 text-sm text-[color:var(--color-text)] placeholder:text-[color:var(--color-text-tertiary)] focus:border-[color:var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]/20";

export default function ProfilePage() {
  const t = useTranslations("account");
  const common = useTranslations("common");
  const { user, refresh } = useAuth();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (user) {
      fetch("/api/auth/me")
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            reset({ name: data.user.name || "", phone: data.user.phone || "" });
          }
        });
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    setLoading(true);
    try {
      await fetch("/api/auth/sync-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user?.id, email: user?.email, name: data.name }),
      });
      await refresh();
      toast.success(t("editProfile"));
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg">
      <h1 className="mb-6 font-serif text-2xl font-medium tracking-tight text-[color:var(--color-text)] sm:text-3xl">{t("editProfile")}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-[color:var(--color-text-secondary)]">Email</label>
          <input
            value={user?.email || ""}
            readOnly
            className={`${INPUT} opacity-60`}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[color:var(--color-text-secondary)]">Name</label>
          <input
            {...register("name")}
            className={`${INPUT} ${errors.name ? "!border-[color:var(--color-danger)]" : ""}`}
          />
          {errors.name && <p className="mt-1 text-xs text-[color:var(--color-danger)]">{errors.name.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[color:var(--color-text-secondary)]">Phone</label>
          <input {...register("phone")} className={INPUT} />
        </div>
        <Button type="submit" color="primary" isLoading={loading}>{common("save")}</Button>
      </form>

      <ChangePasswordForm />
    </div>
  );
}

function ChangePasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (next.length < 6) return setError("New password must be at least 6 characters");
    if (next !== confirm) return setError("Passwords do not match");
    setSaving(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not change password");
        return;
      }
      setCurrent("");
      setNext("");
      setConfirm("");
      toast.success("Password changed. We have emailed you a confirmation.");
    } catch {
      setError("Could not change password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="mt-10 flex flex-col gap-4 border-t border-[color:var(--color-line)] pt-8">
      <h2 className="font-serif text-xl font-medium tracking-tight text-[color:var(--color-text)]">Change password</h2>
      <div>
        <label htmlFor="current-password" className="mb-1 block text-sm font-medium text-[color:var(--color-text-secondary)]">Current password</label>
        <input id="current-password" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} className={INPUT} />
      </div>
      <div>
        <label htmlFor="new-password" className="mb-1 block text-sm font-medium text-[color:var(--color-text-secondary)]">New password</label>
        <input id="new-password" type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} className={INPUT} />
      </div>
      <div>
        <label htmlFor="confirm-password" className="mb-1 block text-sm font-medium text-[color:var(--color-text-secondary)]">Confirm new password</label>
        <input id="confirm-password" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={INPUT} />
      </div>
      {error && <p role="alert" className="text-xs text-[color:var(--color-danger)]">{error}</p>}
      <Button type="submit" color="primary" isLoading={saving}>Update password</Button>
    </form>
  );
}
