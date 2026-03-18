"use client";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-start justify-center gap-4 px-6 py-16">
      <p className="text-sm font-medium text-cyan-200">Application error</p>
      <h2 className="text-3xl font-semibold text-white">Something went wrong while loading UWPlanit.</h2>
      <p className="text-base text-slate-300">{error.message || "Unexpected application error."}</p>
      <button
        className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-medium text-slate-950"
        onClick={() => reset()}
        type="button"
      >
        Try again
      </button>
    </div>
  );
}
