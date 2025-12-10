'use client';
import { useRouter } from 'next/router';
import { CodeIcon, CopyIcon, AlertIcon, EditIcon, MoreVerticalIcon } from './Icons';

export default function TemplateListItem({ template }) {
  const router = useRouter();

  const handleEdit = () => {
    router.push('/template-editor');
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(template.id);
    // Aquí podrías agregar una notificación de éxito si quieres
  };

  return (
    <div className="template-card">
      <div className="template-header">
        <div className="template-title">
          <CodeIcon className="template-icon" />
          <span className="template-name">{template.name}</span>
        </div>
        <div className="template-actions">
          <button 
            className="template-edit-btn"
            onClick={handleEdit}
          >
            <EditIcon className="edit-icon" />
            Edit
          </button>
          <button className="template-more-btn">
            <MoreVerticalIcon />
          </button>
        </div>
      </div>
      <div className="template-details">
        <div className="template-id">
          <span>ID: {template.id}</span>
          <button 
            className="copy-btn" 
            title="Copy ID"
            onClick={handleCopyId}
          >
            <CopyIcon />
          </button>
        </div>
        <div className="template-engine">Engine: {template.engine}</div>
        {template.hasUnpublishedChanges && (
          <div className="template-warning">
            <AlertIcon className="warning-icon" />
            <span>Unpublished changes</span>
          </div>
        )}
      </div>
    </div>
  );
}

