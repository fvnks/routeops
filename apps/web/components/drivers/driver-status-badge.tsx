import { DriverStatusBadge } from "@/components/shared/status-badges";

interface DriverStatusBadgeProps {
  status: string;
  className?: string;
}

export function DriverStatusBadgeComponent({ status, className }: DriverStatusBadgeProps) {
  return <DriverStatusBadge status={status} />;
}
