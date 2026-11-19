import type { Metadata } from "next";
import InterviewApp from "@/components/InterviewApp";

export const metadata: Metadata = {
  title: "模擬面試",
};

export default function InterviewPage() {
  return <InterviewApp />;
}
