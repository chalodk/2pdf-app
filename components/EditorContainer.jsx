'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Tabs from './Tabs';
import HtmlEditor from './Editors/HtmlEditor';
import CssEditor from './Editors/CssEditor';
import DataEditor from './Editors/DataEditor';
import PreviewPane from './PreviewPane';
import AIChatSidebar from './AIChatSidebar';
import { useEditorStore } from '../store/editorStore';
import { supabase } from '../lib/supabase';

export default function EditorContainer() {
  const [activeTab, setActiveTab] = useState('HTML');
  const [showAISidebar, setShowAISidebar] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const router = useRouter();
  
  // Get state from Zustand store
  const html = useEditorStore((state) => state.html);
  const css = useEditorStore((state) => state.css);
  const data = useEditorStore((state) => state.data);
  const setHtml = useEditorStore((state) => state.setHtml);
  const setCss = useEditorStore((state) => state.setCss);
  const setData = useEditorStore((state) => state.setData);
  const updateUserData = useEditorStore((state) => state.updateUserData);

  // Update user data when component mounts or user changes
  useEffect(() => {
    const updateDataWithUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        updateUserData(user);
      }
    };

    updateDataWithUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        updateUserData(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [updateUserData]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleToggleSidebar = () => {
    if (showAISidebar) {
      // Iniciar animación de salida
      setIsClosing(true);
      setTimeout(() => {
        setShowAISidebar(false);
        setIsClosing(false);
      }, 300); // Duración de la animación
    } else {
      setShowAISidebar(true);
    }
  };

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
      {showAISidebar && (
        <div className={`ai-sidebar-container ${isClosing ? 'closing' : ''}`}>
          <button
            className="ai-toggle-btn"
            onClick={handleToggleSidebar}
            title="Ocultar AI"
          >
            ✕
          </button>
          <AIChatSidebar />
        </div>
      )}
      <div className="left-panel">
        <div className="panel-header">
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {!showAISidebar && (
              <button
                className="ai-toggle-btn"
                onClick={handleToggleSidebar}
                title="Mostrar AI"
              >
                🤖
              </button>
            )}
            <button
              className="logout-btn"
              onClick={handleLogout}
              title="Cerrar sesión"
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#21262d',
                color: '#c9d1d9',
                border: '1px solid #30363d',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#30363d';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#21262d';
              }}
            >
              Salir
            </button>
          </div>
          <Tabs activeTab={activeTab} onTabChange={setActiveTab} />
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

