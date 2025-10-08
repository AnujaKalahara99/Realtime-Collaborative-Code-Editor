import { useTheme } from "../../../Contexts/ThemeProvider";
import { Info, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface InfoBoxProps {
  type?: "info" | "warning" | "success" | "error";
  title?: string;
  children: React.ReactNode;
}

export default function InfoBox({
  type = "info",
  title,
  children,
}: InfoBoxProps) {
  const { theme } = useTheme();

  const styles = {
    info: {
      icon: <Info className="w-5 h-5" />,
      borderColor: "border-l-4 border-blue-500",
      iconColor: "text-blue-500",
    },
    warning: {
      icon: <AlertTriangle className="w-5 h-5" />,
      borderColor: "border-l-4 border-yellow-500",
      iconColor: "text-yellow-500",
    },
    success: {
      icon: <CheckCircle className="w-5 h-5" />,
      borderColor: "border-l-4 border-green-500",
      iconColor: "text-green-500",
    },
    error: {
      icon: <XCircle className="w-5 h-5" />,
      borderColor: "border-l-4 border-red-500",
      iconColor: "text-red-500",
    },
  };

  const style = styles[type];

  return (
    <div
      className={`${theme.surfaceSecondary} ${theme.border} border ${style.borderColor} rounded-lg p-4 my-4`}
    >
      <div className="flex gap-3">
        <div className={`${style.iconColor} flex-shrink-0`}>{style.icon}</div>
        <div className="flex-1">
          {title && (
            <h4 className={`font-semibold ${theme.text} mb-2`}>{title}</h4>
          )}
          <div className={theme.textSecondary}>{children}</div>
        </div>
      </div>
    </div>
  );
}
