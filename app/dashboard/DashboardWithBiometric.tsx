"use client";

import { useCallback, useEffect, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import BiometricAccessOverlay, { SESSION_KEY } from "@/components/BiometricAccessOverlay";

export default function DashboardWithBiometric() {
  const [showOverlay, setShowOverlay] = useState<boolean | null>(null);
  const [protocolZeroLocked, setProtocolZeroLocked] = useState(false);

  useEffect(() => {
    const passed = typeof sessionStorage !== "undefined" && sessionStorage.getItem(SESSION_KEY) === "1";
    setShowOverlay(!passed);
  }, []);

  const handleBiometricComplete = useCallback(() => {
    if (protocolZeroLocked) return;
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* ignore */
    }
    setShowOverlay(false);
  }, [protocolZeroLocked]);

  const handleProtocolZeroComplete = useCallback(() => {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
    setProtocolZeroLocked(true);
    setShowOverlay(true);
  }, []);

  if (showOverlay === null) {
    return <div className="min-h-screen bg-ghost-black" aria-hidden />;
  }

  return (
    <>
      <DashboardShell onProtocolZeroComplete={handleProtocolZeroComplete} />
      {showOverlay && (
        <BiometricAccessOverlay
          onComplete={handleBiometricComplete}
          locked={protocolZeroLocked}
        />
      )}
    </>
  );
}
