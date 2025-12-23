'use client';
import { useState, useEffect, useRef } from 'react';
import { useEditorStore } from '../store/editorStore';
import { useRenderJobs } from '../hooks/useRenderJobs';
import GeneratePDFModal from './GeneratePDFModal';

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
        // Create context with loop item and index
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
        <style>${cssString}</style>
      </head>
      <body>
        ${hydratedHtml}
      </body>
    </html>
  `;
}

function convertToHandlebars(htmlString) {
  // Convert {% for item in array %}...{% endfor %} to Handlebars {{#each array as |item|}}...{{/each}}
  return htmlString.replace(
    /{%\s*for\s+(\w+)\s+in\s+([\w.]+)\s*%}([\s\S]*?){%\s*endfor\s*%}/g,
    (_, itemName, arrayPath, content) => {
      // Keep {{item.property}} as is, Handlebars will resolve it with the block param
      return `{{#each ${arrayPath} as |${itemName}|}}${content}{{/each}}`;
    }
  );
}

function buildTemplate(htmlString, cssString) {
  // Convert {% for %} syntax to Handlebars before sending
  const handlebarsHtml = convertToHandlebars(htmlString);
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>${cssString}</style>
      </head>
      <body>
        ${handlebarsHtml}
      </body>
    </html>
  `;
}

async function generatePDF(html, css, data) {
  try {
    const jsonData = JSON.parse(data);
    const template = buildTemplate(html, css);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${apiUrl}/render`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        template: template,
        data: jsonData,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'documento.pdf';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Error al generar el PDF: ' + error.message);
  }
}

export default function PreviewPane({ templateVersionId, templateId, projectId }) {
  const [output, setOutput] = useState('');
  const [blobUrl, setBlobUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [currentJobId, setCurrentJobId] = useState(null);
  const blobUrlRef = useRef('');
  const { createJob } = useRenderJobs();
  
  // Get state from Zustand store
  const html = useEditorStore((state) => state.html);
  const css = useEditorStore((state) => state.css);
  const data = useEditorStore((state) => state.data);

  // Ensure component only renders on client
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return; // Don't run on server
    
    try {
      const json = JSON.parse(data);
      const hydrated = hydrateHtml(html, json);
      const fullDoc = buildFullDocument(hydrated, css);
      setOutput(fullDoc);
      
      // Cleanup previous blob URL
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
      
      // Create blob URL for better external resource loading (Tailwind CSS, etc.)
      const blob = new Blob([fullDoc], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      blobUrlRef.current = url;
      setBlobUrl(url);
    } catch {
      // Invalid JSON → keep previous render
    }
    
    // Cleanup blob URL on unmount
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = '';
      }
    };
  }, [html, css, data, mounted]);

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    try {
      await generatePDF(html, css, data);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateAndSavePDF = async () => {
    // Validar que el template esté guardado
    if (!templateVersionId) {
      alert('Por favor guarda el template primero antes de generar un PDF. El template debe estar guardado para poder generar documentos.');
      return;
    }

    if (!projectId) {
      alert('Por favor asocia este template a un proyecto antes de generar un PDF. Los documentos deben estar asociados a un proyecto.');
      return;
    }

    try {
      setIsGenerating(true);
      
      // Validar que data sea JSON válido
      let jsonData;
      try {
        jsonData = JSON.parse(data);
      } catch (parseError) {
        throw new Error('El campo Data debe contener JSON válido');
      }
      
      // Crear render job
      const job = await createJob({
        templateVersionId,
        projectId: projectId,
        payload: jsonData,
        options: null,
      });

      if (!job || !job.id) {
        throw new Error('No se pudo crear el render job');
      }

      // Mostrar modal con el job ID
      setCurrentJobId(job.id);
      setShowGenerateModal(true);
    } catch (error) {
      console.error('Error creating render job:', error);
      alert('Error al generar PDF: ' + (error.message || 'Error desconocido'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleJobSuccess = (jobData) => {
    // El modal maneja la navegación y descarga
    console.log('Job completed:', jobData);
  };

  if (!mounted) {
    return (
      <div className="preview-container">
        <div className="preview-header">
          <button 
            className="generate-pdf-btn"
            disabled
          >
            Cargando...
          </button>
        </div>
        <div className="preview-frame" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b949e' }}>
          Cargando preview...
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="preview-container">
        <div className="preview-header" style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="generate-pdf-btn"
            onClick={handleGeneratePDF}
            disabled={isGenerating}
            title="Generar PDF y descargar directamente (sin guardar en BD)"
          >
            {isGenerating ? 'Generando...' : 'Generar PDF'}
          </button>
          <button 
            className="generate-pdf-btn"
            onClick={handleGenerateAndSavePDF}
            disabled={isGenerating || !templateVersionId || !projectId}
            style={{
              backgroundColor: (templateVersionId && projectId) ? '#10b981' : '#9ca3af',
              cursor: (templateVersionId && projectId) ? 'pointer' : 'not-allowed',
            }}
            title={
              !templateVersionId 
                ? 'Guarda el template primero para generar y guardar PDF'
                : !projectId
                ? 'Asocia este template a un proyecto para generar PDF'
                : 'Generar PDF y guardarlo en la base de datos'
            }
          >
            {isGenerating ? 'Generando...' : 'Generar y Guardar PDF'}
          </button>
        </div>
        {blobUrl && (
          <iframe
            className="preview-frame"
            src={blobUrl}
            sandbox="allow-same-origin allow-scripts allow-popups"
            title="Preview"
          />
        )}
      </div>

      <GeneratePDFModal
        isOpen={showGenerateModal}
        onClose={() => {
          setShowGenerateModal(false);
          setCurrentJobId(null);
        }}
        jobId={currentJobId}
        onSuccess={handleJobSuccess}
      />
    </>
  );
}

