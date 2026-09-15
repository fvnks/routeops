"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { SplashScreen } from "./splash-screen";
import { RouteLoader } from "./route-loader";

export function SplashWrapper({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);
  const [showRouteLoader, setShowRouteLoader] = useState(false);
  const [hasCheckedStorage, setHasCheckedStorage] = useState(false);
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);

  useEffect(() => {
    const splashShown = sessionStorage.getItem("routeops-splash-shown");
    if (splashShown) {
      setShowSplash(false);
    }
    setHasCheckedStorage(true);
  }, []);

  // Detect route changes and show loader
  useEffect(() => {
    if (pathname !== prevPathname && !showSplash) {
      setShowRouteLoader(true);
      const timer = setTimeout(() => {
        setShowRouteLoader(false);
      }, 500);
      setPrevPathname(pathname);
      return () => clearTimeout(timer);
    }
    setPrevPathname(pathname);
  }, [pathname, prevPathname, showSplash]);

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

  return (
    <>
      {showRouteLoader && <RouteLoader />}
      {children}
    </>
  );
}
