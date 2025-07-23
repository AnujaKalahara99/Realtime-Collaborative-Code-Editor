import "./App.css";
import CodeEditorPage from "./CodeEditor/page";
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
