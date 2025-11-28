'use client';
import Editor from '@monaco-editor/react';

export default function HtmlEditor({ value, onChange }) {
  return (
    <Editor
      height="100%"
      language="html"
      theme="vs-dark"
      value={value}
      onChange={onChange}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        wordWrap: 'on',
        automaticLayout: true,
      }}
    />
  );
}

