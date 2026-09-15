import Link from "next/link";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: { label: string; href?: string; onClick?: () => void; icon?: string };
  actions?: { label: string; href?: string; onClick?: () => void; icon?: string }[];
}

export function PageHeader({ title, subtitle, action, actions }: PageHeaderProps) {
  const buttons = actions || (action ? [action] : []);

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-gray-500">{subtitle}</p>}
      </div>
      {buttons.length > 0 && (
        <div className="flex gap-2">
          {buttons.map((btn, i) => {
            if (btn.onClick) {
              return (
                <button
                  key={i}
                  onClick={btn.onClick}
                  className="bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800 transition-colors text-sm font-medium inline-flex items-center gap-2"
                >
                  {btn.icon && <span>{btn.icon}</span>}
                  {btn.label}
                </button>
              );
            }
            return (
              <Link
                key={btn.href}
                href={btn.href!}
                className="bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800 transition-colors text-sm font-medium inline-flex items-center gap-2"
              >
                {btn.icon && <span>{btn.icon}</span>}
                {btn.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
