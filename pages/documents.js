import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '../hooks/useUser';
import { useDocuments } from '../hooks/useDocuments';
import { useProjects } from '../hooks/useProjects';
import { useTemplates } from '../hooks/useTemplates';
import { supabase } from '../lib/supabase';
import { updateUserDisplayName } from '../lib/user';
import SettingsSidebar from '../components/SettingsSidebar';
import SettingsHeader from '../components/SettingsHeader';
import DocumentsContent from '../components/DocumentsContent';
import ChatWidget from '../components/ChatWidget';
import Toast from '../components/Toast';

export default function Documents() {
  const [activeSection, setActiveSection] = useState('Documents');
  const { userName, userEmail, refreshUserName } = useUser();
  const router = useRouter();
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState('');
  const [selectedTemplateFilter, setSelectedTemplateFilter] = useState('');
  
  const { projects } = useProjects();
  const { templates } = useTemplates();
  const { documents, loading, error, refreshDocuments } = useDocuments({
    projectId: selectedProjectFilter || undefined,
    templateId: selectedTemplateFilter || undefined,
  });

  // Detectar filtros desde query params
  useEffect(() => {
    const projectId = router.query.projectId;
    const templateId = router.query.templateId;
    
    if (projectId && typeof projectId === 'string') {
      setSelectedProjectFilter(projectId);
    } else {
      setSelectedProjectFilter('');
    }
    
    if (templateId && typeof templateId === 'string') {
      setSelectedTemplateFilter(templateId);
    } else {
      setSelectedTemplateFilter('');
    }
  }, [router.query.projectId, router.query.templateId]);

  // Filtrar documentos basado en el término de búsqueda
  const filteredDocuments = useMemo(() => {
    if (!searchTerm.trim()) {
      return documents;
    }
    
    const term = searchTerm.toLowerCase().trim();
    return documents.filter(document => {
      const nameMatch = document.template?.name?.toLowerCase().includes(term);
      const projectMatch = document.project?.name?.toLowerCase().includes(term);
      const idMatch = document.id?.toLowerCase().includes(term);
      return nameMatch || projectMatch || idMatch;
    });
  }, [documents, searchTerm]);

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
    } catch (err) {
      showToast('Error al actualizar el nombre: ' + err.message, 'error');
      throw err;
    }
  };

  const handleDocumentAction = async (action, documentId, errorMessage) => {
    if (action === 'downloaded') {
      showToast('Descargando documento...', 'success');
    } else if (action === 'copied') {
      showToast('ID copiado al portapapeles', 'success');
    } else if (action === 'error') {
      showToast(errorMessage || 'Ocurrió un error', 'error');
    }
  };

  const handleProjectFilterChange = (projectId) => {
    setSelectedProjectFilter(projectId);
    const params = new URLSearchParams();
    if (projectId) params.set('projectId', projectId);
    if (selectedTemplateFilter) params.set('templateId', selectedTemplateFilter);
    router.push(`/documents${params.toString() ? '?' + params.toString() : ''}`, undefined, { shallow: true });
  };

  const handleTemplateFilterChange = (templateId) => {
    setSelectedTemplateFilter(templateId);
    const params = new URLSearchParams();
    if (selectedProjectFilter) params.set('projectId', selectedProjectFilter);
    if (templateId) params.set('templateId', templateId);
    router.push(`/documents${params.toString() ? '?' + params.toString() : ''}`, undefined, { shallow: true });
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
          actionLabel={null}
          onAction={null}
        />

        <DocumentsContent 
          documents={documents}
          filteredDocuments={filteredDocuments}
          onDocumentAction={handleDocumentAction}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          loading={loading}
          projects={projects}
          templates={templates}
          selectedProjectFilter={selectedProjectFilter}
          selectedTemplateFilter={selectedTemplateFilter}
          onProjectFilterChange={handleProjectFilterChange}
          onTemplateFilterChange={handleTemplateFilterChange}
        />
      </main>

      <ChatWidget />
      
      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </div>
  );
}

