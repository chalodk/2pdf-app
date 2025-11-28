'use client';
import Editor from '@monaco-editor/react';

export default function DataEditor({ value, onChange }) {
  const handleEditorValidation = (markers) => {
    // JSON validation errors are handled by Monaco automatically
  };

  return (
    <Editor
      height="100%"
      language="json"
      theme="vs-dark"
      value={value}
      onChange={onChange}
      onValidate={handleEditorValidation}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        wordWrap: 'on',
        automaticLayout: true,
        formatOnPaste: true,
      }}
    />
  );
}

