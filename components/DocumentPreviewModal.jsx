'use client';
import { useState, useEffect } from 'react';

export default function DocumentPreviewModal({ isOpen, onClose, document }) {
  const [iframeError, setIframeError] = useState(false);

  useEffect(() => {
    // Reset error cuando cambia el documento
    setIframeError(false);
  }, [document?.file_url]);

  if (!isOpen || !document) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          width: '90%',
          maxWidth: '1200px',
          height: '90%',
          maxHeight: '900px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '1.25rem',
              fontWeight: 600,
              color: '#111827',
            }}
          >
            {document.template_name || 'Document Preview'}
          </h2>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
              color: '#6b7280',
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#f3f4f6';
              e.target.style.color = '#111827';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#6b7280';
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* PDF Viewer */}
        <div
          style={{
            flex: 1,
            overflow: 'hidden',
            position: 'relative',
            backgroundColor: '#f3f4f6',
          }}
        >
          {document.file_url ? (
            <>
              {!iframeError ? (
                <iframe
                  src={`${document.file_url}#toolbar=1&navpanes=1&scrollbar=1`}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                  }}
                  title="Document Preview"
                  allow="fullscreen"
                  onLoad={() => {
                    // Verificar si el iframe cargó correctamente
                    setIframeError(false);
                  }}
                  onError={() => {
                    console.error('Error cargando PDF en iframe:', document.file_url);
                    setIframeError(true);
                  }}
                />
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    color: '#6b7280',
                    gap: '16px',
                    padding: '40px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '4rem' }}>📄</div>
                  <div style={{ fontSize: '1rem', fontWeight: 500, color: '#111827' }}>
                    No se puede mostrar el PDF en el visor
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                    El documento no permite ser mostrado en un iframe por políticas de seguridad.
                  </div>
                </div>
              )}
              <div
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  right: '16px',
                  padding: '10px 16px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                }}
              >
                <a
                  href={document.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#ec4899',
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}
                  onMouseOver={(e) => {
                    e.target.style.textDecoration = 'underline';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.textDecoration = 'none';
                  }}
                >
                  Abrir en nueva pestaña
                </a>
              </div>
            </>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: '#6b7280',
                gap: '12px',
              }}
            >
              <div style={{ fontSize: '3rem' }}>📄</div>
              <div style={{ fontSize: '1rem', fontWeight: 500 }}>
                No hay URL de documento disponible
              </div>
              <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                Este documento aún no se ha generado
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
