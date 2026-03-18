const foundationItems = [
  "Next.js App Router shell",
  "Tailwind-powered design baseline",
  "Shared environment helpers",
  "React Query providers",
  "tRPC server entry point",
  "Vitest and Playwright scripts",
];

export function HomeHero() {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-20">
      <div className="max-w-3xl space-y-6">
        <span className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-sm font-medium text-cyan-200">
          Foundation milestone in place
        </span>
        <div className="space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-6xl">
            Bootstrap the UWPlanit product shell before feature work begins.
          </h1>
          <p className="text-lg leading-8 text-slate-300">
            This scaffold establishes the App Router, shared config, package tooling,
            and server boundaries expected by the broader rollout plan.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {foundationItems.map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-200 shadow-sm backdrop-blur"
          >
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}
