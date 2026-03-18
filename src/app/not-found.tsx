import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-start justify-center gap-4 px-6 py-16">
      <p className="text-sm font-medium text-cyan-200">404</p>
      <h2 className="text-3xl font-semibold text-white">This page does not exist yet.</h2>
      <p className="text-base text-slate-300">
        The product foundation is in place, but this route has not been implemented.
      </p>
      <Link className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-medium text-slate-950" href="/">
        Return home
      </Link>
    </div>
  );
}
