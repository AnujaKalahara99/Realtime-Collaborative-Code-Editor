import { useTheme } from "../../../Contexts/ThemeProvider";
import { Link } from "react-router";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  const { theme } = useTheme();

  return (
    <nav className="flex items-center gap-2 mb-6">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {index > 0 && (
            <ChevronRight className={`w-4 h-4 ${theme.textMuted}`} />
          )}
          {item.path ? (
            <Link
              to={item.path}
              className={`text-sm ${theme.textSecondary} ${theme.hover} rounded px-2 py-1`}
            >
              {item.label}
            </Link>
          ) : (
            <span className={`text-sm ${theme.text} px-2 py-1`}>
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
