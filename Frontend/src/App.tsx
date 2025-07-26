import "./App.css";
import CodeEditorPage from "./CodeEditor/Page";
import { ThemeProvider } from "./ThemeProvider";

function App() {
  return (
    <div>
      <ThemeProvider>
        <CodeEditorPage />
      </ThemeProvider>
    </div>
  );
}

export default App;
