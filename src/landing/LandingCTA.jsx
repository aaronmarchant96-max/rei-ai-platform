import React from "react";
import { Button } from "@/components/ui/button";

export function LandingCTA({ onTryDemo }) {
  return (
    <section className="px-6 py-24 bg-zinc-950 text-white text-center relative overflow-hidden">
      {/* Visual glow accent */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6">
          Try REI.ai free — no account required
        </h2>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto leading-relaxed mb-10">
          Unlock deep reasoning budgets. Experience mathematical safety-testing, evidence classification, and cost-weighted routing traces in a unified terminal workspace.
        </p>
        <Button size="lg" className="font-semibold bg-amber-600 hover:bg-amber-700 text-white" onClick={onTryDemo}>
          Launch Workspace
        </Button>
      </div>
    </section>
  );
}
