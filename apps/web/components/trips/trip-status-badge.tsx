import { TripStatusBadge } from "@/components/shared/status-badges";
import type { TripStatus } from "@/types";

interface TripStatusBadgeComponentProps {
  status: TripStatus;
  className?: string;
}

export function TripStatusBadgeComponent({ status, className }: TripStatusBadgeComponentProps) {
  return <TripStatusBadge status={status} />;
}
