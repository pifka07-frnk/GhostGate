"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import BiometricAccessOverlay, { SESSION_KEY } from "@/components/BiometricAccessOverlay";

export default function DashboardWithBiometric() {
  const [showOverlay, setShowOverlay] = useState<boolean | null>(null);

  useEffect(() => {
    const passed = typeof sessionStorage !== "undefined" && sessionStorage.getItem(SESSION_KEY) === "1";
    setShowOverlay(!passed);
  }, []);

  const handleBiometricComplete = () => {
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* ignore */
    }
    setShowOverlay(false);
  };

  if (showOverlay === null) {
    return <div className="min-h-screen bg-ghost-black" aria-hidden />;
  }

  return (
    <>
      <DashboardShell />
      {showOverlay && <BiometricAccessOverlay onComplete={handleBiometricComplete} />}
    </>
  );
}
