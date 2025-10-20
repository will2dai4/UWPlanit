"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function CompleteProfilePage() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  const [name, setName] = useState(user?.name ?? "");
  const [program, setProgram] = useState("");
  const [term, setTerm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (isLoading) return null;
  if (!user) {
    router.replace("/");
    return null;
  }

  const handleSave = async () => {
    if (!program || !term || !name) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, program, term }),
      });
      if (res.ok) {
        // rely on silent session refresh at next navigation; just go home
        router.replace("/");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto flex min-h-screen flex-col items-center justify-center gap-8 p-6">
      <h1 className="text-3xl font-bold">Complete your profile</h1>
      <p className="text-slate-600 max-w-md text-center">
        We need a few details to personalize your course planner.
      </p>
      <div className="flex w-full max-w-md flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-700">Full name</label>
          <Input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-700">Email</label>
          <Input disabled value={user.email ?? ""} />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-700">Program</label>
          <Select value={program} onValueChange={setProgram}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select your program" />
            </SelectTrigger>
            <SelectContent>
              {[
                "Computer Science",
                "Software Engineering",
                "Accounting & Financial Management",
                "Mechanical Engineering",
                "Electrical Engineering",
              ].map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-700">Current/Upcoming Term</label>
          <Select value={term} onValueChange={setTerm}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select starting term" />
            </SelectTrigger>
            <SelectContent>
              {["1A", "1B", "2A", "2B", "3A", "3B", "4A", "4B"].map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button disabled={!name || !program || !term || submitting} onClick={handleSave}>
          {submitting ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}
