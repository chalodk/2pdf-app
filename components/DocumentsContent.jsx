'use client';
import DocumentListItem from './DocumentListItem';
import DocumentSkeleton from './DocumentSkeleton';
import SearchBar from './SearchBar';

export default function DocumentsContent({ 
  documents, 
  onDocumentAction, 
  searchTerm, 
  onSearchChange, 
  filteredDocuments, 
  loading, 
  projects, 
  templates,
  selectedProjectFilter, 
  selectedTemplateFilter,
  onProjectFilterChange,
  onTemplateFilterChange
}) {
  return (
    <div className="settings-content">
      <div className="settings-actions">
        {projects && projects.length > 0 && (
          <select
            value={selectedProjectFilter || ''}
            onChange={(e) => onProjectFilterChange(e.target.value || '')}
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
        {templates && templates.length > 0 && (
          <select
            value={selectedTemplateFilter || ''}
            onChange={(e) => onTemplateFilterChange(e.target.value || '')}
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
            title="Filtrar por template"
          >
            <option value="">Todos los templates</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        )}
        <SearchBar 
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          placeholder="Buscar documentos..."
        />
      </div>

      <div className="templates-list">
        {loading ? (
          <>
            <DocumentSkeleton />
            <DocumentSkeleton />
            <DocumentSkeleton />
            <DocumentSkeleton />
          </>
        ) : filteredDocuments.length === 0 ? (
          <div className="templates-empty">
            <p>
              {searchTerm || selectedProjectFilter || selectedTemplateFilter
                ? `No se encontraron documentos que coincidan con los filtros aplicados` 
                : 'No hay documentos aún. Los documentos generados aparecerán aquí.'}
            </p>
          </div>
        ) : (
          filteredDocuments.map((document) => (
            <DocumentListItem 
              key={document.id} 
              document={document}
              onAction={onDocumentAction}
            />
          ))
        )}
      </div>
    </div>
  );
}

