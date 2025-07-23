import { useTheme } from "../ThemeProvider";

const ProjectManagementPanel = () => {
  const { theme } = useTheme();

  return (
    <div className={`h-full ${theme.surface} ${theme.text} p-4`}>
      <h3 className="text-sm font-medium mb-2">Project Management</h3>
      <div className={`text-xs ${theme.textMuted}`}>
        Project files and structure will go here
      </div>
    </div>
  );
};

export default ProjectManagementPanel;
