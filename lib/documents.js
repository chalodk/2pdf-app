import { supabase } from './supabase';
import { getUserContext } from './templates';

/**
 * Obtiene todos los documentos de la organización del usuario
 * Incluye información del render_job (status, error_message) y template
 */
export async function getUserDocuments() {
  try {
    const context = await getUserContext();
    
    if (context.needsOrganization) {
      console.log('[documents] Usuario no tiene organización');
      return [];
    }
    
    const { organizationId } = context;
    console.log('[documents] Obteniendo documentos para organización:', organizationId);

    // Obtener documentos con relaciones (usar left join para no perder documentos)
    const { data: documents, error } = await supabase
      .from('documents')
      .select(`
        id,
        render_job_id,
        organization_id,
        project_id,
        template_version_id,
        file_url,
        storage_provider,
        file_size_bytes,
        created_at,
        expires_at,
        is_deleted,
        render_jobs(
          id,
          status,
          error_message,
          payload,
          project_id,
          created_at,
          queued_at,
          started_at,
          finished_at,
          template_versions(
            id,
            template_id,
            html,
            css,
            templates(
              id,
              name
            )
          )
        ),
        projects(
          id,
          name,
          slug
        )
      `)
      .eq('organization_id', organizationId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[documents] Error obteniendo documentos:', error);
      throw new Error(`Error obteniendo documentos: ${error.message}`);
    }

    console.log('[documents] Documentos obtenidos:', documents?.length || 0, documents);

    // También obtener render_jobs sin documentos (queued, processing, failed)
    const { data: renderJobs, error: jobsError } = await supabase
      .from('render_jobs')
      .select(`
        id,
        status,
        error_message,
        payload,
        project_id,
        created_at,
        queued_at,
        started_at,
        finished_at,
        template_versions(
          id,
          template_id,
          html,
          css,
          templates(
            id,
            name
          )
        ),
        projects(
          id,
          name,
          slug
        )
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (jobsError) {
      console.error('[documents] Error obteniendo render_jobs:', jobsError);
    } else {
      console.log('[documents] Render jobs obtenidos:', renderJobs?.length || 0, renderJobs);
    }

    // Normalizar relaciones que pueden venir como array u objeto (Supabase/PostgREST)
    const first = (v) => (Array.isArray(v) ? v[0] : v);

    const documentsWithStatus = (documents || []).map(doc => {
      const renderJob = first(doc.render_jobs);
      const project = first(doc.projects);
      const templateVersion = first(renderJob?.template_versions);
      const template = first(templateVersion?.templates);

      return {
        ...doc,
        project_id: project?.id ?? doc.project_id,
        project_name: project?.name || 'Unknown',
        status: renderJob?.status || 'unknown',
        error_message: renderJob?.error_message || null,
        template_name: template?.name || 'Unknown',
      };
    });

    // Agregar render_jobs sin documentos (queued, processing, failed)
    const documentJobIds = new Set((documents || []).map(doc => doc.render_job_id).filter(Boolean));
    
    const jobsWithoutDocuments = (renderJobs || [])
      .filter(job => {
        // Solo incluir si no tiene documento asociado
        const hasDocument = documentJobIds.has(job.id);
        return !hasDocument && ['queued', 'processing', 'failed'].includes(job.status);
      })
      .map(job => {
        const templateVersion = first(job.template_versions);
        const template = first(templateVersion?.templates);
        const project = first(job.projects);

        return {
          id: job.id,
          render_job_id: job.id,
          organization_id: organizationId,
          project_id: project?.id ?? job.project_id,
          project_name: project?.name || 'Unknown',
          template_version_id: templateVersion?.id,
          file_url: null,
          storage_provider: null,
          file_size_bytes: null,
          created_at: job.created_at,
          expires_at: null,
          is_deleted: false,
          status: job.status,
          error_message: job.error_message,
          template_name: template?.name || 'Unknown',
          render_jobs: job,
          projects: project,
        };
      });

    const allDocuments = [...documentsWithStatus, ...jobsWithoutDocuments].sort((a, b) => {
      return new Date(b.created_at) - new Date(a.created_at);
    });

    console.log('[documents] Total documentos a retornar:', allDocuments.length, allDocuments);
    return allDocuments;

  } catch (error) {
    console.error('Error fetching documents:', error);
    throw error;
  }
}

/**
 * Obtiene un documento por ID
 */
export async function getDocument(documentId) {
  try {
    const context = await getUserContext();
    
    if (context.needsOrganization) {
      throw new Error('Usuario necesita crear una organización primero');
    }
    
    const { organizationId } = context;

    const { data: document, error } = await supabase
      .from('documents')
      .select(`
        *,
        render_jobs!inner(
          *,
          template_versions!inner(
            *,
            templates!inner(*)
          )
        ),
        projects!inner(*)
      `)
      .eq('id', documentId)
      .eq('organization_id', organizationId)
      .eq('is_deleted', false)
      .single();

    if (error) {
      throw new Error(`Error obteniendo documento: ${error.message}`);
    }

    if (!document) {
      throw new Error('Documento no encontrado');
    }

    return document;
  } catch (error) {
    console.error('Error fetching document:', error);
    throw error;
  }
}
