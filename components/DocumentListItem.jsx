'use client';
import { DocumentIcon, CopyIcon, DownloadIcon, FolderIcon, CodeIcon } from './Icons';
import { formatFileSize, isDocumentExpired } from '../lib/documents';

export default function DocumentListItem({ document, onAction }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    window.open(document.fileUrl, '_blank');
    if (onAction) {
      onAction('downloaded', document.id);
    }
    setTimeout(() => setDownloading(false), 1000);
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(document.id);
    if (onAction) {
      onAction('copied', document.id);
    }
  };

  const documentName = document.template?.name 
    ? `${document.template.name} - ${new Date(document.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}`
    : `Documento - ${new Date(document.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;

  const expired = isDocumentExpired(document.expiresAt);

  return (
    <div className="template-card">
      <div className="template-header">
        <div className="template-title">
          <DocumentIcon className="template-icon" />
          <span className="template-name">{documentName}</span>
          {expired && (
            <span style={{ 
              marginLeft: '8px', 
              padding: '2px 8px', 
              backgroundColor: '#fee2e2', 
              color: '#dc2626', 
              borderRadius: '4px', 
              fontSize: '0.75rem',
              fontWeight: 500
            }}>
              Expirado
            </span>
          )}
        </div>
        <div className="template-actions">
          <button 
            className="template-edit-btn"
            onClick={handleDownload}
            disabled={downloading || expired}
            style={{ 
              opacity: expired ? 0.5 : 1,
              cursor: expired ? 'not-allowed' : 'pointer'
            }}
          >
            <DownloadIcon className="edit-icon" />
            {downloading ? 'Descargando...' : 'Descargar'}
          </button>
        </div>
      </div>
      <div className="template-details">
        <div className="template-id">
          <span>ID: {document.id}</span>
          <button 
            className="copy-btn" 
            title="Copy ID"
            onClick={handleCopyId}
          >
            <CopyIcon />
          </button>
        </div>
        {document.template && (
          <div className="template-version" style={{ marginTop: '4px', color: '#6b7280', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CodeIcon style={{ width: '14px', height: '14px' }} />
            <span>Template: {document.template.name}</span>
            {document.templateVersion && (
              <span style={{ marginLeft: '4px' }}>({document.templateVersion.versionLabel})</span>
            )}
          </div>
        )}
        {document.project && (
          <div className="template-project" style={{ marginTop: '4px', color: '#ec4899', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <FolderIcon style={{ width: '14px', height: '14px' }} />
            <span>Proyecto: {document.project.name}</span>
          </div>
        )}
        {document.fileSizeBytes && (
          <div className="template-version" style={{ marginTop: '4px', color: '#6b7280', fontSize: '0.875rem' }}>
            Tamaño: {formatFileSize(document.fileSizeBytes)}
          </div>
        )}
        <div className="template-version" style={{ marginTop: '4px', color: '#6b7280', fontSize: '0.875rem' }}>
          Creado: {new Date(document.createdAt).toLocaleString('es-ES', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
    </div>
  );
}

