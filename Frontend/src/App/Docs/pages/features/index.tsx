import CodeEditorFeature from "./CodeEditorFeature";
import VersionControl from "./VersionControl";
import RealTimeCollaboration from "./RealTimeCollaboration";
import ProjectManagement from "./ProjectManagement";
import AIAssistant from "./AIAssistant";
import LiveChat from "./LiveChat";

const Features = () => {
  return (
    <div>
      <h1>Features</h1>
      <RealTimeCollaboration />
      <CodeEditorFeature />
      <VersionControl />
      <ProjectManagement />
      <AIAssistant />
      <LiveChat />
    </div>
  );
};

export default Features;