"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";

interface Props {
  initialName: string;
  initialProgram?: string;
  initialTerm?: string;
  email: string;
}

const PROGRAMS = [
  "Computer Science",
  "Software Engineering",
  "Accounting & Financial Management",
  "Mechanical Engineering",
  "Electrical Engineering",
];

const TERMS = ["1A", "1B", "2A", "2B", "3A", "3B", "4A", "4B"];

export default function AccountProfileForm({
  initialName,
  initialProgram = "",
  initialTerm = "",
  email,
}: Props) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [program, setProgram] = useState(initialProgram);
  const [term, setTerm] = useState(initialTerm);
  const [submitting, setSubmitting] = useState(false);

  // Add ESC key handler to cancel
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) {
        router.push("/");
      }
    };
    
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [router, submitting]);

  const handleCancel = () => {
    router.push("/");
  };

  const handleSave = async () => {
    if (!name || !program || !term) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, program, term }),
      });
      if (!res.ok) {
        toast({
          variant: "destructive",
          title: "Failed to update profile",
        });
        return;
      }
      toast({ title: "Profile updated" });
      // refresh server props
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-700">Full name</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-700">Email</label>
        <Input disabled value={email} />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-700">Program</label>
        <Select value={program} onValueChange={setProgram}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select your program" />
          </SelectTrigger>
          <SelectContent>
            {PROGRAMS.map((p) => (
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
            {TERMS.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={handleCancel}
          disabled={submitting}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          disabled={!name || !program || !term || submitting}
          onClick={handleSave}
          className="flex-1"
        >
          {submitting ? "Saving…" : "Save Changes"}
        </Button>
      </div>
      
      <p className="text-xs text-slate-500 text-center mt-2">
        Press <kbd className="px-2 py-1 text-xs font-semibold text-slate-800 bg-slate-100 border border-slate-200 rounded">ESC</kbd> to cancel
      </p>
    </div>
  );
}
