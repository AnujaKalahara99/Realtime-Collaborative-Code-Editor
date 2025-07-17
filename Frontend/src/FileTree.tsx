import React, { useEffect, useState } from 'react';
import { readDir, isFileSync } from './memoryWrapper';

interface FileNodeProps {
  path: string;
  name: string;
  isFile: boolean;
  onFileClick: (path: string) => void;
}

function FileNode({ path, name, isFile, onFileClick }: FileNodeProps) {
  const [expanded, setExpanded] = useState(false);
  const [children, setChildren] = useState<string[]>([]);

  const handleExpand = async () => {
    if (!expanded) {
      const entries = await readDir(path);
      setChildren(entries);
    }
    setExpanded(!expanded);
  };

  return (
    <div style={{ marginLeft: '1rem' }}>
      {isFile ? (
        <div style={{ cursor: 'pointer' }} onClick={() => onFileClick(path)}>
          📄 {name}
        </div>
      ) : (
        <div>
          <div style={{ cursor: 'pointer' }} onClick={handleExpand}>
            📁 {name}
          </div>
          {expanded && (
            <div>
              {children.map(child => {
                const childPath = `${path}/${child}`;
                return (
                  <FileNode
                    key={childPath}
                    path={childPath}
                    name={child}
                    isFile={isFileSync(childPath)}
                    onFileClick={onFileClick}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface FileTreeProps {
  root?: string;
  onFileClick: (path: string) => void;
}

export default function FileTree({ root = '/', onFileClick }: FileTreeProps) {
  const [items, setItems] = useState<string[]>([]);

  useEffect(() => {
    const loadRoot = async () => {
      const files = await readDir(root);
      setItems(files);
    };
    loadRoot();
  }, [root]);

  return (
    <div>
      <h4 style={{ marginLeft: '1rem' }}>Project Management</h4>
      {items.map(item => {
        const fullPath = `${root}/${item}`;
        return (
          <FileNode
            key={fullPath}
            path={fullPath}
            name={item}
            isFile={isFileSync(fullPath)}
            onFileClick={onFileClick}
          />
        );
      })}
    </div>
  );
}
