import { BusStatusBadge } from "@/components/shared/status-badges";

interface BusStatusBadgeComponentProps {
  status: string;
  className?: string;
}

export function BusStatusBadgeComponent({ status, className }: BusStatusBadgeComponentProps) {
  return <BusStatusBadge status={status} />;
}
