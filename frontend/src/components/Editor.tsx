import { Editor as MonacoEditor } from '@monaco-editor/react';

interface EditorProps {
  code: string;
  onChange: (value: string | undefined) => void;
}

export default function Editor({ code, onChange }: EditorProps) {
  return (
    <MonacoEditor
      height="400px"
      language="typescript"
      value={code}
      onChange={onChange}
      theme="vs-dark"
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: 'on',
        roundedSelection: false,
        scrollBeyondLastLine: false,
        automaticLayout: true,
      }}
    />
  );
} 