'use client';
import { useState } from 'react';
import { DocumentIcon, CopyIcon, MoreVerticalIcon, XIcon } from './Icons';

export default function DocumentListItem({ document, onView, onRetry }) {
  const [showMenu, setShowMenu] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'succeeded':
        return '#10b981'; // green
      case 'queued':
        return '#6b7280'; // gray
      case 'processing':
        return '#3b82f6'; // blue
      case 'failed':
        return '#ec4899'; // pink
      default:
        return '#6b7280';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'succeeded':
        return 'Success';
      case 'queued':
        return 'Queued';
      case 'processing':
        return 'Processing';
      case 'failed':
        return 'Failure';
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(document.id);
    if (onView) {
      onView('copied', 'ID copiado al portapapeles');
    }
  };

  const canView = document.file_url && document.status === 'succeeded';
  const canRetry = document.status === 'failed';

  return (
    <div className="template-card">
      <div className="template-header">
        <div className="template-title">
          <DocumentIcon className="template-icon" />
          <span className="template-name">
            {document.template_name || 'Unknown Template'}
          </span>
        </div>
        <div className="template-actions">
          {canRetry && onRetry && (
            <button
              className="template-edit-btn"
              onClick={() => onRetry(document.render_job_id)}
              style={{ marginRight: '8px' }}
            >
              Retry
            </button>
          )}
          {canView && (
            <button
              className="template-edit-btn"
              onClick={() => onView('view', document)}
            >
              Ver
            </button>
          )}
        </div>
      </div>
      <div className="template-details">
        <div className="template-id" style={{ marginBottom: '12px' }}>
          <span>ID: {document.id}</span>
          <button
            className="copy-btn"
            title="Copy ID"
            onClick={handleCopyId}
          >
            <CopyIcon />
          </button>
        </div>
        <div style={{ marginBottom: '8px', color: '#6b7280', fontSize: '0.875rem' }}>
          Proyecto: {document.project_name || 'Unknown'}
        </div>
        <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ color: '#ec4899', fontSize: '0.875rem' }}>
            Template: {document.template_name || 'Unknown'}
          </span>
          <span
            style={{
              backgroundColor: getStatusColor(document.status),
              color: '#fff',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: 500,
            }}
          >
            {getStatusLabel(document.status)}
          </span>
        </div>
        <div style={{ marginBottom: '8px', color: '#6b7280', fontSize: '0.875rem' }}>
          Date: {formatDate(document.created_at)}
        </div>
        {document.error_message && (
          <div
            style={{
              marginTop: '8px',
              padding: '8px 12px',
              backgroundColor: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: '6px',
              color: '#991b1b',
              fontSize: '0.875rem',
            }}
          >
            <strong>Error:</strong> {document.error_message}
          </div>
        )}
      </div>
    </div>
  );
}
