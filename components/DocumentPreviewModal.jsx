'use client';
import { useState, useEffect, useRef } from 'react';

// Funciones para renderizar template (copiadas de PreviewPane)
function getValue(obj, path) {
  return path.split('.').reduce((o, k) => (o ? o[k] : ''), obj);
}

function hydrateHtml(htmlString, dataObject) {
  // Process {% for item in array %}...{% endfor %} loops
  let result = htmlString.replace(
    /{%\s*for\s+(\w+)\s+in\s+([\w.]+)\s*%}([\s\S]*?){%\s*endfor\s*%}/g,
    (_, itemName, arrayPath, content) => {
      const array = getValue(dataObject, arrayPath);
      if (!Array.isArray(array)) return '';
      return array.map((item, index) => {
        const itemContext = { ...dataObject, [itemName]: item, loop: { index } };
        return hydrateHtml(content, itemContext);
      }).join('');
    }
  );

  // Process {{variable}} tokens
  result = result.replace(/{{\s*([\w.]+)\s*}}/g, (_, key) => {
    const value = getValue(dataObject, key);
    return value ?? '';
  });

  return result;
}

function buildFullDocument(hydratedHtml, cssString) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${cssString || ''}</style>
      </head>
      <body style="margin: 0; padding: 20px;">
        ${hydratedHtml}
      </body>
    </html>
  `;
}

export default function DocumentPreviewModal({ isOpen, onClose, document }) {
  const [previewHtml, setPreviewHtml] = useState('');
  const [blobUrl, setBlobUrl] = useState('');
  const blobUrlRef = useRef('');

  useEffect(() => {
    // Limpiar blob URL anterior
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = '';
      setBlobUrl('');
    }

    if (!isOpen || !document) return;

    // Intentar obtener HTML/CSS del template_version del render_job
    const renderJob = Array.isArray(document.render_jobs) 
      ? document.render_jobs[0] 
      : document.render_jobs;
    
    if (!renderJob) {
      setPreviewHtml(null);
      return;
    }

    const templateVersion = Array.isArray(renderJob.template_versions)
      ? renderJob.template_versions[0]
      : renderJob.template_versions;

    if (!templateVersion || !templateVersion.html) {
      setPreviewHtml(null);
      return;
    }

    try {
      // Obtener datos del payload del render_job
      let payload = renderJob.payload || {};
      const html = templateVersion.html || '';
      const css = templateVersion.css || '';

      // Si el payload está incompleto, usar datos por defecto como fallback
      // Esto es para que el template se renderice correctamente incluso con datos dummy
      const defaultPayload = {
        name: payload.name || 'Daniel Rojas',
        user: {
          email: payload.user?.email || payload.email || 'danielrojas243@gmail.com'
        },
        description: payload.description || 'Welcome to the template editor!',
        resultados: payload.resultados || [
          { titulo: 'Ventas Q1', valor: '$12,500' },
          { titulo: 'Ventas Q2', valor: '$15,800' },
          { titulo: 'Ventas Q3', valor: '$18,200' }
        ]
      };

      // Combinar payload real con defaults (payload real tiene prioridad)
      const finalPayload = {
        ...defaultPayload,
        ...payload,
        user: {
          ...defaultPayload.user,
          ...(payload.user || {})
        }
      };

      console.log('[DocumentPreviewModal] Payload original:', payload);
      console.log('[DocumentPreviewModal] Payload final:', finalPayload);

      // Renderizar template con datos
      const hydrated = hydrateHtml(html, finalPayload);
      const fullDoc = buildFullDocument(hydrated, css);
      setPreviewHtml(fullDoc);

      // Crear blob URL para el iframe
      const blob = new Blob([fullDoc], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      blobUrlRef.current = url;
      setBlobUrl(url);
    } catch (error) {
      console.error('Error renderizando template:', error);
      setPreviewHtml(null);
    }

    // Cleanup al cerrar
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = '';
        setBlobUrl('');
      }
    };
  }, [isOpen, document]);

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

        {/* Template Preview */}
        <div
          style={{
            flex: 1,
            overflow: 'hidden',
            position: 'relative',
            backgroundColor: '#f3f4f6',
          }}
        >
          {blobUrl ? (
            <iframe
              src={blobUrl}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
              }}
              title="Template Preview"
              sandbox="allow-same-origin allow-scripts"
            />
          ) : document.file_url ? (
            // Fallback: Si hay PDF pero no template, mostrar PDF
            <iframe
              src={`${document.file_url}#toolbar=1&navpanes=1&scrollbar=1`}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
              }}
              title="Document Preview"
              allow="fullscreen"
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
                gap: '12px',
              }}
            >
              <div style={{ fontSize: '3rem' }}>📄</div>
              <div style={{ fontSize: '1rem', fontWeight: 500 }}>
                No se puede mostrar la vista previa
              </div>
              <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                {previewHtml === null 
                  ? 'No se encontró template o datos para renderizar'
                  : 'Este documento aún no se ha generado'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
