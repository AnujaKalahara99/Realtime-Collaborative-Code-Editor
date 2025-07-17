import * as Y from 'yjs';
import {editor as monoeditor} from 'monaco-editor';
import { MonacoBinding } from 'y-monaco';
import { WebrtcProvider } from 'y-webrtc';

const roomName = 'sakdjqwdjbadhVOIWI';

const ydoc = new Y.Doc();
const filesMap = ydoc.getMap('files');

const provider = new WebrtcProvider(roomName, ydoc, {signaling: ['ws://localhost:4444']});

console.log('awareness:', provider.awareness.getStates());

//Get or create a Y.Text object for a file path.
export function getYTextForFile(path: string): Y.Text {
    if (!filesMap.has(path)) {
        filesMap.set(path, new Y.Text());
    }
    return filesMap.get(path) as Y.Text;
}

const editorBindings = new Map(); // key = path, value = MonacoBinding

//Bind a Monaco editor to a file path in the shared Yjs document.
export function bindEditorToFile(editor: monoeditor.IStandaloneCodeEditor, path: string): void {
    const model = editor.getModel();
    if (!model) {
        console.error('Editor model is null. Cannot bind editor to file.');
        return;
    }
    const yText: Y.Text = getYTextForFile(path);

    // If already bound, return
    if (editorBindings.has(path)) return;

    const binding: MonacoBinding = new MonacoBinding(yText, model, new Set([editor]), provider.awareness);
    editorBindings.set(path, binding);
}

export function unbindEditorFromFile(path: string): void {
    const binding: MonacoBinding | undefined = editorBindings.get(path);
    if (binding) {
        binding.destroy();
        editorBindings.delete(path);
    }
}

// export function bindEditorToYjs(editor, filePath) {
//     console.log("Editor mounted, binding to Yjs for file:", filePath);
    
//   const yText = ydoc.getText(filePath);
//   new MonacoBinding(yText, editor.getModel(), new Set([editor]), provider.awareness);
  
// }




provider.on('status', event => {
  console.log('Provider connected:', event.connected);
});

provider.awareness.on('change', () => {
  console.log('Awareness changed:', provider.awareness.getStates());
});

provider.on('synced', () => {
  console.log('Provider synced');
});

