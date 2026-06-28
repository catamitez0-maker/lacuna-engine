import Link from "next/link";
import { EnginePanel } from "@lacuna-engine/ui-kit";

export default function Home() {
  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto grid max-w-5xl gap-6">
        <EnginePanel eyebrow="Lacuna Engine" title="No active world loaded">
          <p className="max-w-2xl text-sm leading-7 text-slate-600">
            A neutral framework for asynchronous narrative worlds. This
            repository contains engine contracts and an empty content template,
            not a concrete fiction project.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              className="rounded bg-ink px-4 py-2 text-sm font-semibold text-white"
              href="/demo"
            >
              Open framework demo
            </Link>
          </div>
        </EnginePanel>
      </div>
    </main>
  );
}
