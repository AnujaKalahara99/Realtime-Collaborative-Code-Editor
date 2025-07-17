import { useState, useEffect, useRef} from 'react';
import * as monaco from 'monaco-editor';
import Editor from '@monaco-editor/react';
import FileTree from './FileTree';
import {readFile, createFolder, createFile } from './memoryWrapper';
import { initRepo, writeAndCommit} from './gitWrapper';
import { bindEditorToFile } from '././yjsProvider';

export default function App() {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [code, setCode] = useState('');
  const [currentFile, setCurrentFile] = useState('');

  useEffect(() => {
    initRepo();
  }, []);

  const handleMount = (editor : monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
  };

  useEffect(() => {
    if (editorRef.current && currentFile) {
      bindEditorToFile(editorRef.current, currentFile);
    }
  }, [currentFile]);

  const onFileClick = async (path: string): Promise<void> => {
    const content = await readFile(path);
    setCode(content);
    setCurrentFile(path);
  };

  const handleCommit = async () => {
    if (!currentFile) return alert('No file selected');
    await writeAndCommit(currentFile, code, 'Edit from UI');
    alert('Committed!');
  };

  const handleNewFile = async () => {
    const filename = prompt('Enter file path (e.g. src/utils/math.js):');
    if (filename) {
      await createFolder(filename.split('/').slice(0, -1).join('/'));
      await createFile(filename, '');
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ width: '300px', borderRight: '1px solid #ccc', padding: '1rem', overflowY: 'auto' }}>
        <button onClick={handleNewFile}>➕ New File</button>
        <FileTree onFileClick={onFileClick} />
      </div>
      <div style={{ width: '1000px' }}>
        <Editor height="100%" language="javascript"
          onMount={handleMount}
          value={code}
          onChange={(value) => setCode(value ?? '')} />
        <button onClick={handleCommit}>💾 Commit</button>
      </div>
    </div>
  );
}
