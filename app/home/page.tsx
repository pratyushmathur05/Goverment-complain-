import type { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "Home",
};

// SSR: re-rendered on every request (could fetch user session here)
export const dynamic = "force-dynamic";

// Simulated server-side data fetch
async function getWelcomeData() {
  // TODO: Replace with real session/db call (e.g. getServerSession, prisma, etc.)
  return {
    userName: "Arjun",
    loginMethod: "Email & Password",
    lastLogin: new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    }),
  };
}

export default async function HomePage() {
  const data = await getWelcomeData();
  return <HomeClient {...data} />;
}