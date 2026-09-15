import { RouteTypeBadge } from "@/components/shared/status-badges";

interface RouteTypeBadgeComponentProps {
  type: string;
  className?: string;
}

export function RouteTypeBadgeComponent({ type, className }: RouteTypeBadgeComponentProps) {
  return <RouteTypeBadge type={type} />;
}
