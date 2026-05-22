"use client";

import dynamic from "next/dynamic";
import type { PageKey } from "../../src/data";

const LearningApp = dynamic(() => import("../../src/App"), {
  ssr: false,
  loading: () => (
    <main className="route-loading" aria-live="polite">
      <img className="route-loading-logo" src="/ltnc-cat.png" alt="" />
      <span>BTL Viva Helper</span>
      <strong>Đang mở Learning OS...</strong>
    </main>
  ),
});

export default function LearningRoute({ page }: { page: PageKey }) {
  return <LearningApp page={page} />;
}
