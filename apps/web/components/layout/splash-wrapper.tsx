"use client";

import { useState, useEffect } from "react";
import { SplashScreen } from "./splash-screen";

export function SplashWrapper({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);
  const [hasCheckedStorage, setHasCheckedStorage] = useState(false);

  useEffect(() => {
    // Check if splash was already shown this session
    const splashShown = sessionStorage.getItem("routeops-splash-shown");
    if (splashShown) {
      setShowSplash(false);
    }
    setHasCheckedStorage(true);
  }, []);

  function handleSplashComplete() {
    sessionStorage.setItem("routeops-splash-shown", "true");
    setShowSplash(false);
  }

  if (!hasCheckedStorage) {
    return null;
  }

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return <>{children}</>;
}
