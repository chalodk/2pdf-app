import { supabase } from './supabase';
import { getUserContext } from './templates';

/**
 * Obtiene todos los documentos de la organización del usuario
 * Incluye información del template, proyecto y render job
 */
export async function getUserDocuments({ projectId, templateId } = {}) {
  try {
    const context = await getUserContext();
    
    if (context.needsOrganization) {
      return [];
    }
    
    const { organizationId } = context;

    let query = supabase
      .from('documents')
      .select(`
        id,
        file_url,
        file_size_bytes,
        storage_provider,
        checksum,
        created_at,
        expires_at,
        is_deleted,
        render_job_id,
        project_id,
        template_version_id,
        project:projects(id, name, slug),
        template_version:template_versions!inner(
          id,
          version_label,
          template:templates!inner(id, name)
        )
      `)
      .eq('organization_id', organizationId)
      .eq('is_deleted', false);

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    if (templateId) {
      query = query.eq('template_version.template.id', templateId);
    }

    query = query.order('created_at', { ascending: false });

    const { data: documents, error } = await query;

    if (error) {
      throw new Error(`Error obteniendo documentos: ${error.message}`);
    }

    return (documents || []).map(doc => ({
      id: doc.id,
      fileUrl: doc.file_url,
      fileSizeBytes: doc.file_size_bytes,
      storageProvider: doc.storage_provider,
      checksum: doc.checksum,
      createdAt: doc.created_at,
      expiresAt: doc.expires_at,
      renderJobId: doc.render_job_id,
      projectId: doc.project_id,
      templateVersionId: doc.template_version_id,
      project: doc.project ? {
        id: doc.project.id,
        name: doc.project.name,
        slug: doc.project.slug,
      } : null,
      template: doc.template_version?.template ? {
        id: doc.template_version.template.id,
        name: doc.template_version.template.name,
      } : null,
      templateVersion: doc.template_version ? {
        id: doc.template_version.id,
        versionLabel: doc.template_version.version_label,
      } : null,
    }));
  } catch (error) {
    console.error('Error fetching documents:', error);
    throw error;
  }
}

/**
 * Formatea el tamaño del archivo en formato legible
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Verifica si un documento ha expirado
 */
export function isDocumentExpired(expiresAt) {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
}

