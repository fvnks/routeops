"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useDrivers(params?: Record<string, string>) {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  return useSWR(`/api/drivers${query}`, fetcher, { revalidateOnFocus: false });
}

export function useDriver(id: string | null) {
  return useSWR(id ? `/api/drivers/${id}` : null, fetcher);
}

export function useBuses(params?: Record<string, string>) {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  return useSWR(`/api/buses${query}`, fetcher, { revalidateOnFocus: false });
}

export function useBus(id: string | null) {
  return useSWR(id ? `/api/buses/${id}` : null, fetcher);
}

export function useRoutes(params?: Record<string, string>) {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  return useSWR(`/api/routes${query}`, fetcher, { revalidateOnFocus: false });
}

export function useRoute(id: string | null) {
  return useSWR(id ? `/api/routes/${id}` : null, fetcher);
}

export function useTrips(params?: Record<string, string>) {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  return useSWR(`/api/trips${query}`, fetcher, { revalidateOnFocus: false });
}

export function useTrip(id: string | null) {
  return useSWR(id ? `/api/trips/${id}` : null, fetcher);
}

export function usePlanning(from?: string) {
  const query = from ? `?from=${from}` : "";
  return useSWR(`/api/planning${query}`, fetcher, { revalidateOnFocus: false });
}

export function useAudit(params?: Record<string, string>) {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  return useSWR(`/api/audit${query}`, fetcher, { revalidateOnFocus: false });
}
