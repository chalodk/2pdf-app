'use client';
import { useState } from 'react';
import Tabs from './Tabs';
import HtmlEditor from './Editors/HtmlEditor';
import CssEditor from './Editors/CssEditor';
import DataEditor from './Editors/DataEditor';
import PreviewPane from './PreviewPane';
import AIChatSidebar from './AIChatSidebar';
import { useEditorStore } from '../store/editorStore';

export default function EditorContainer() {
  const [activeTab, setActiveTab] = useState('HTML');
  const [showAISidebar, setShowAISidebar] = useState(true);
  
  // Get state from Zustand store
  const html = useEditorStore((state) => state.html);
  const css = useEditorStore((state) => state.css);
  const data = useEditorStore((state) => state.data);
  const setHtml = useEditorStore((state) => state.setHtml);
  const setCss = useEditorStore((state) => state.setCss);
  const setData = useEditorStore((state) => state.setData);

  const renderEditor = () => {
    switch (activeTab) {
      case 'HTML':
        return <HtmlEditor value={html} onChange={setHtml} />;
      case 'CSS':
        return <CssEditor value={css} onChange={setCss} />;
      case 'Data':
        return <DataEditor value={data} onChange={setData} />;
      default:
        return null;
    }
  };

  return (
    <div className={`editor-layout ${showAISidebar ? 'with-sidebar' : 'no-sidebar'}`}>
      {showAISidebar && <AIChatSidebar />}
      <div className="left-panel">
        <div className="panel-header">
          <Tabs activeTab={activeTab} onTabChange={setActiveTab} />
          <button
            className="ai-toggle-btn"
            onClick={() => setShowAISidebar(!showAISidebar)}
            title={showAISidebar ? 'Ocultar AI' : 'Mostrar AI'}
          >
            {showAISidebar ? '✕' : '🤖'}
          </button>
        </div>
        <div className="editor-wrapper">
          {renderEditor()}
        </div>
      </div>
      <div className="right-panel">
        <PreviewPane />
      </div>
    </div>
  );
}

