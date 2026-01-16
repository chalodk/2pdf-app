import { useState } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '../hooks/useUser';
import { useDocuments } from '../hooks/useDocuments';
import { useProjects } from '../hooks/useProjects';
import { supabase } from '../lib/supabase';
import { updateUserDisplayName } from '../lib/user';
import SettingsSidebar from '../components/SettingsSidebar';
import SettingsHeader from '../components/SettingsHeader';
import DocumentListItem from '../components/DocumentListItem';
import DocumentPreviewModal from '../components/DocumentPreviewModal';
import ChatWidget from '../components/ChatWidget';
import Toast from '../components/Toast';
import SearchBar from '../components/SearchBar';

// Skeleton para loading
function DocumentSkeleton() {
  return (
    <div className="template-card" style={{ opacity: 0.5 }}>
      <div className="template-header">
        <div className="template-title">
          <div style={{ width: '20px', height: '20px', backgroundColor: '#30363d', borderRadius: '4px' }} />
          <div style={{ width: '150px', height: '20px', backgroundColor: '#30363d', borderRadius: '4px' }} />
        </div>
      </div>
      <div className="template-details">
        <div style={{ width: '100px', height: '16px', backgroundColor: '#30363d', borderRadius: '4px', marginBottom: '8px' }} />
        <div style={{ width: '200px', height: '14px', backgroundColor: '#30363d', borderRadius: '4px' }} />
      </div>
    </div>
  );
}

export default function Documents() {
  const [activeSection, setActiveSection] = useState('Documents');
  const { userName, userEmail, refreshUserName } = useUser();
  const { documents, loading, error, refreshDocuments } = useDocuments();
  const { projects } = useProjects();
  const router = useRouter();
  
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Filtrar documentos
  const filteredDocuments = documents.filter(doc => {
    // Filtrar por proyecto
    if (selectedProjectFilter && doc.project_id !== selectedProjectFilter) {
      return false;
    }
    
    // Filtrar por status
    if (selectedStatusFilter && doc.status !== selectedStatusFilter) {
      return false;
    }
    
    // Filtrar por término de búsqueda
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      const idMatch = doc.id?.toLowerCase().includes(term);
      const templateMatch = doc.template_name?.toLowerCase().includes(term);
      const projectMatch = doc.project_name?.toLowerCase().includes(term);
      return idMatch || templateMatch || projectMatch;
    }
    
    return true;
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const showToast = (message, type = 'success') => {
    setToast({ isVisible: true, message, type });
  };

  const handleUpdateName = async (newName) => {
    try {
      await updateUserDisplayName(newName);
      await refreshUserName();
      showToast('Nombre actualizado exitosamente', 'success');
    } catch (error) {
      showToast('Error al actualizar nombre: ' + error.message, 'error');
    }
  };

  const handleDocumentAction = (action, documentOrMessage) => {
    if (action === 'view') {
      setSelectedDocument(documentOrMessage);
      setShowPreviewModal(true);
    } else if (action === 'copied') {
      showToast(documentOrMessage || 'Copiado al portapapeles', 'success');
    } else if (action === 'retry') {
      // TODO: Implementar retry cuando el equipo lo implemente
      showToast('Función de retry próximamente disponible', 'info');
    }
  };

  const handleClosePreviewModal = () => {
    setShowPreviewModal(false);
    setSelectedDocument(null);
  };

  return (
    <div className="settings-layout">
      <SettingsSidebar 
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        userName={userName}
        userEmail={userEmail}
        onLogout={handleLogout}
        onUpdateName={handleUpdateName}
      />

      <main className="settings-main">
        <SettingsHeader 
          title="Documents"
          actionLabel="Add a Document"
          onAction={() => {
            // TODO: Implementar cuando el equipo lo necesite
            showToast('Función próximamente disponible', 'info');
          }}
        />

        <div className="settings-content">
          <div className="settings-actions">
            {projects && projects.length > 0 && (
              <select
                value={selectedProjectFilter}
                onChange={(e) => setSelectedProjectFilter(e.target.value)}
                style={{
                  padding: '10px 12px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  color: '#111827',
                  fontSize: '14px',
                  outline: 'none',
                  cursor: 'pointer',
                  minWidth: '180px',
                }}
                title="Filtrar por proyecto"
              >
                <option value="">Todos los proyectos</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            )}
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              style={{
                padding: '10px 12px',
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                color: '#111827',
                fontSize: '14px',
                outline: 'none',
                cursor: 'pointer',
                minWidth: '140px',
              }}
              title="Filtrar por estado"
            >
              <option value="">Todos los estados</option>
              <option value="succeeded">Success</option>
              <option value="queued">Queued</option>
              <option value="processing">Processing</option>
              <option value="failed">Failure</option>
            </select>
            <SearchBar 
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder="Buscar por ID, template o proyecto..."
            />
          </div>

          {/* Info box */}
          <div style={{
            backgroundColor: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
          }}>
            <p style={{ 
              fontSize: '0.875rem', 
              color: '#0369a1', 
              margin: 0,
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
            }}>
              <span style={{ fontSize: '16px' }}>💡</span>
              <span>
                Los documentos se generan automáticamente cuando usas la API. 
                Puedes ver el estado de cada generación y previsualizar los PDFs generados.
              </span>
            </p>
          </div>

          {/* Error state */}
          {error && (
            <div style={{
              backgroundColor: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px',
              color: '#991b1b',
            }}>
              <strong>Error:</strong> {error}
              <div style={{ marginTop: '8px', fontSize: '0.875rem' }}>
                Revisa la consola del navegador para más detalles.
              </div>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="template-grid">
              {[1, 2, 3].map((i) => (
                <DocumentSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && filteredDocuments.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#6b7280',
            }}>
              <p style={{ fontSize: '1.125rem', marginBottom: '8px' }}>
                {searchTerm || selectedProjectFilter || selectedStatusFilter
                  ? 'No se encontraron documentos con los filtros aplicados'
                  : 'No hay documentos aún'}
              </p>
              <p style={{ fontSize: '0.875rem' }}>
                {searchTerm || selectedProjectFilter || selectedStatusFilter
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Los documentos aparecerán aquí cuando uses la API para generar PDFs'}
              </p>
            </div>
          )}

          {/* Documents list */}
          {!loading && !error && filteredDocuments.length > 0 && (
            <div className="template-grid">
              {filteredDocuments.map((document) => (
                <DocumentListItem
                  key={document.id}
                  document={document}
                  onView={handleDocumentAction}
                  onRetry={handleDocumentAction}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && filteredDocuments.length > 0 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: '32px',
              gap: '8px',
              color: '#6b7280',
              fontSize: '0.875rem',
            }}>
              <span>
                {filteredDocuments.length} de {documents.length} documento{filteredDocuments.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </main>

      <ChatWidget />
      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
      <DocumentPreviewModal
        isOpen={showPreviewModal}
        onClose={handleClosePreviewModal}
        document={selectedDocument}
      />
    </div>
  );
}
