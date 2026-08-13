"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { supabaseClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ProfileForm({
  username,
  email,
}: {
  username: string;
  email: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(username);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setNotice(null);

    const trimmed = value.trim();
    if (!trimmed) {
      setError("Username cannot be empty.");
      return;
    }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(trimmed)) {
      setError(
        "Username must be 3–20 characters using letters, numbers or underscores."
      );
      return;
    }

    setSaving(true);
    try {
      const { data: user } = await supabaseClient().auth.getUser();
      if (!user.user) {
        throw new Error("You must be logged in.");
      }
      const { error: updateError } = await supabaseClient()
        .from("profiles")
        .update({ username: trimmed })
        .eq("id", user.user.id);

      if (updateError) {
        if (updateError.message.toLowerCase().includes("duplicate")) {
          throw new Error("That username is already taken.");
        }
        throw new Error(updateError.message);
      }
      setNotice("Profile updated successfully.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Input
        id="email"
        label="Email"
        value={email}
        disabled
        hint="Email cannot be changed."
      />
      <Input
        id="username"
        label="Username"
        placeholder="your_username"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        hint="3–20 characters. Letters, numbers and underscores only."
      />
      {error && (
        <p
          role="alert"
          className="rounded-btn border border-red-600 bg-red-50 px-3 py-2 text-sm text-red-600"
        >
          {error}
        </p>
      )}
      {notice && (
        <p
          role="status"
          className="rounded-btn border border-black bg-surface px-3 py-2 text-sm text-black"
        >
          {notice}
        </p>
      )}
      <Button type="submit" loading={saving}>
        Save Changes
      </Button>
    </form>
  );
}
