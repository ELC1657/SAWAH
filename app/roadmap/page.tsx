import type { Metadata } from "next";
import { Roadmap } from "@/components/roadmap/Roadmap";

export const metadata: Metadata = {
  title: "Roadmap",
  description:
    "What SAWAH covers today, what is being built next, and how much of the map is still black.",
};

export default function RoadmapPage() {
  return <Roadmap />;
}
