import { supabase } from './supabase';
import { getUserContext } from './templates';

/**
 * Crea un nuevo render job para generar un documento PDF
 */
export async function createRenderJob({ templateVersionId, projectId, payload, options }) {
  try {
    const context = await getUserContext();
    
    if (context.needsOrganization) {
      throw new Error('Usuario necesita crear una organización primero');
    }
    
    const { appUserId, organizationId } = context;

    // Validar que el template version existe
    const { data: templateVersion, error: versionError } = await supabase
      .from('template_versions')
      .select('id, template_id')
      .eq('id', templateVersionId)
      .single();

    if (versionError || !templateVersion) {
      throw new Error('Template version no encontrado');
    }

    // Validar que el template pertenece a la organización
    const { data: template, error: templateError } = await supabase
      .from('templates')
      .select('id, organization_id, project_id')
      .eq('id', templateVersion.template_id)
      .eq('organization_id', organizationId)
      .single();

    if (templateError || !template) {
      throw new Error('Template no encontrado o sin permisos');
    }

    // Usar project_id del template si no se proporciona uno
    const finalProjectId = projectId || template.project_id;
    
    if (!finalProjectId) {
      throw new Error('El template debe estar asociado a un proyecto para generar documentos');
    }

    // Verificar que el proyecto pertenece a la organización
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, organization_id')
      .eq('id', finalProjectId)
      .eq('organization_id', organizationId)
      .single();

    if (projectError || !project) {
      throw new Error('Proyecto no encontrado o sin permisos');
    }

    // Crear el render job
    const { data: renderJob, error: jobError } = await supabase
      .from('render_jobs')
      .insert({
        organization_id: organizationId,
        project_id: finalProjectId,
        template_version_id: templateVersionId,
        requested_by_user_id: appUserId,
        status: 'queued',
        payload: payload || {},
        options: options || null,
      })
      .select()
      .single();

    if (jobError) {
      throw new Error(`Error creando render job: ${jobError.message}`);
    }

    return renderJob;
  } catch (error) {
    console.error('Error creating render job:', error);
    throw error;
  }
}

/**
 * Obtiene un render job por ID
 */
export async function getRenderJob(jobId) {
  try {
    const context = await getUserContext();
    
    if (context.needsOrganization) {
      throw new Error('Usuario necesita crear una organización primero');
    }
    
    const { organizationId } = context;

    const { data: renderJob, error } = await supabase
      .from('render_jobs')
      .select(`
        id,
        status,
        payload,
        options,
        error_message,
        created_at,
        queued_at,
        started_at,
        finished_at,
        template_version_id,
        project_id,
        template_version:template_versions(
          id,
          version_label,
          template:templates(id, name)
        ),
        document:documents(
          id,
          file_url,
          file_size_bytes,
          created_at
        )
      `)
      .eq('id', jobId)
      .eq('organization_id', organizationId)
      .single();

    if (error) {
      console.error('Error fetching render job from Supabase:', error);
      throw new Error(`Error obteniendo render job: ${error.message}`);
    }

    if (!renderJob) {
      console.error('Render job not found:', { jobId, organizationId });
      throw new Error('Render job no encontrado');
    }

    console.log('Render job fetched:', { id: renderJob.id, status: renderJob.status });

    return {
      id: renderJob.id,
      status: renderJob.status,
      payload: renderJob.payload,
      options: renderJob.options,
      errorMessage: renderJob.error_message,
      createdAt: renderJob.created_at,
      queuedAt: renderJob.queued_at,
      startedAt: renderJob.started_at,
      finishedAt: renderJob.finished_at,
      templateVersionId: renderJob.template_version_id,
      projectId: renderJob.project_id,
      templateVersion: renderJob.template_version ? {
        id: renderJob.template_version.id,
        versionLabel: renderJob.template_version.version_label,
        template: renderJob.template_version.template,
      } : null,
      document: renderJob.document && renderJob.document.length > 0 ? renderJob.document[0] : null,
    };
  } catch (error) {
    console.error('Error fetching render job:', error);
    throw error;
  }
}

/**
 * Obtiene todos los render jobs del usuario (de su organización)
 */
export async function getUserRenderJobs({ projectId, status } = {}) {
  try {
    const context = await getUserContext();
    
    if (context.needsOrganization) {
      return [];
    }
    
    const { organizationId } = context;

    let query = supabase
      .from('render_jobs')
      .select(`
        id,
        status,
        payload,
        error_message,
        created_at,
        queued_at,
        started_at,
        finished_at,
        template_version_id,
        project_id,
        template_version:template_versions(
          id,
          version_label,
          template:templates(id, name)
        ),
        document:documents(
          id,
          file_url,
          file_size_bytes,
          created_at
        )
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(50); // Limitar a los últimos 50 jobs

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: renderJobs, error } = await query;

    if (error) {
      throw new Error(`Error obteniendo render jobs: ${error.message}`);
    }

    return (renderJobs || []).map(job => ({
      id: job.id,
      status: job.status,
      payload: job.payload,
      errorMessage: job.error_message,
      createdAt: job.created_at,
      queuedAt: job.queued_at,
      startedAt: job.started_at,
      finishedAt: job.finished_at,
      templateVersionId: job.template_version_id,
      projectId: job.project_id,
      templateVersion: job.template_version ? {
        id: job.template_version.id,
        versionLabel: job.template_version.version_label,
        template: job.template_version.template,
      } : null,
      document: job.document && job.document.length > 0 ? job.document[0] : null,
    }));
  } catch (error) {
    console.error('Error fetching render jobs:', error);
    throw error;
  }
}

