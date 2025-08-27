import { useTheme } from "../../Contexts/ThemeProvider";

const CompilerPanel = () => {
  const { theme } = useTheme();

  return (
    <div className={`h-full ${theme.surface} ${theme.text} p-4`}>
      <h3 className="text-sm font-medium mb-2">Compiler</h3>
      <div className={`text-xs ${theme.textMuted}`}>
        Compiler input and output will go here
      </div>
    </div>
  );
};

export default CompilerPanel;
