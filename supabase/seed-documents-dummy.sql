-- Script para insertar documentos dummy en la tabla documents
-- Este script crea datos de prueba para desarrollar el frontend

-- Primero, obtener o crear datos base necesarios
DO $$
DECLARE
  v_org_id uuid;
  v_project_id uuid;
  v_template_id uuid;
  v_template_version_id uuid;
  v_render_job_id uuid;
  v_app_user_id uuid;
BEGIN
  -- 1. Obtener o crear app_user (usar el primero que encuentre o crear uno dummy)
  SELECT id INTO v_app_user_id FROM app_users LIMIT 1;
  
  IF v_app_user_id IS NULL THEN
    INSERT INTO app_users (auth_user_id, display_name)
    VALUES (gen_random_uuid(), 'Usuario Dummy')
    RETURNING id INTO v_app_user_id;
  END IF;

  -- 2. Obtener o crear organización
  SELECT id INTO v_org_id FROM organizations LIMIT 1;
  
  IF v_org_id IS NULL THEN
    INSERT INTO organizations (name, slug, created_by)
    VALUES ('Organización Dummy', 'org-dummy', v_app_user_id)
    RETURNING id INTO v_org_id;
    
    -- Crear membership
    INSERT INTO organization_memberships (organization_id, user_id, role)
    VALUES (v_org_id, v_app_user_id, 'owner');
  END IF;

  -- 3. Obtener o crear proyecto
  SELECT id INTO v_project_id FROM projects WHERE organization_id = v_org_id LIMIT 1;
  
  IF v_project_id IS NULL THEN
    INSERT INTO projects (organization_id, name, slug, created_by)
    VALUES (v_org_id, 'Proyecto Dummy', 'proyecto-dummy', v_app_user_id)
    RETURNING id INTO v_project_id;
  END IF;

  -- 4. Obtener o crear template
  SELECT id INTO v_template_id FROM templates WHERE organization_id = v_org_id LIMIT 1;
  
  IF v_template_id IS NULL THEN
    INSERT INTO templates (organization_id, project_id, name, created_by)
    VALUES (v_org_id, v_project_id, 'Template Dummy', v_app_user_id)
    RETURNING id INTO v_template_id;
  END IF;

  -- 5. Obtener o crear template_version
  SELECT id INTO v_template_version_id 
  FROM template_versions 
  WHERE template_id = v_template_id AND is_default = true
  LIMIT 1;
  
  IF v_template_version_id IS NULL THEN
    INSERT INTO template_versions (
      template_id, 
      version_label, 
      html, 
      css, 
      is_default, 
      is_active,
      created_by
    )
    VALUES (
      v_template_id,
      '1.0.0',
      '<div>Hello {{name}}</div>',
      'body { font-family: Arial; }',
      true,
      true,
      v_app_user_id
    )
    RETURNING id INTO v_template_version_id;
  END IF;

  -- 6. Crear render_jobs dummy con diferentes estados
  -- Render job 1: succeeded
  INSERT INTO render_jobs (
    organization_id,
    project_id,
    template_version_id,
    status,
    payload,
    queued_at,
    started_at,
    finished_at
  )
  VALUES (
    v_org_id,
    v_project_id,
    v_template_version_id,
    'succeeded',
    '{"name": "Daniel Rojas", "email": "daniel@example.com"}'::jsonb,
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '1 hour 55 minutes',
    NOW() - INTERVAL '1 hour 50 minutes'
  )
  RETURNING id INTO v_render_job_id;

  -- Documento 1: succeeded (con URL dummy)
  INSERT INTO documents (
    render_job_id,
    organization_id,
    project_id,
    template_version_id,
    file_url,
    storage_provider,
    file_size_bytes,
    created_at
  )
  VALUES (
    v_render_job_id,
    v_org_id,
    v_project_id,
    v_template_version_id,
    'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    'supabase',
    102400,
    NOW() - INTERVAL '1 hour 50 minutes'
  );

  -- Render job 2: queued
  INSERT INTO render_jobs (
    organization_id,
    project_id,
    template_version_id,
    status,
    payload,
    queued_at
  )
  VALUES (
    v_org_id,
    v_project_id,
    v_template_version_id,
    'queued',
    '{"name": "Test User", "email": "test@example.com"}'::jsonb,
    NOW() - INTERVAL '30 minutes'
  )
  RETURNING id INTO v_render_job_id;

  -- Render job 3: processing
  INSERT INTO render_jobs (
    organization_id,
    project_id,
    template_version_id,
    status,
    payload,
    queued_at,
    started_at
  )
  VALUES (
    v_org_id,
    v_project_id,
    v_template_version_id,
    'processing',
    '{"name": "Processing User", "email": "processing@example.com"}'::jsonb,
    NOW() - INTERVAL '15 minutes',
    NOW() - INTERVAL '10 minutes'
  )
  RETURNING id INTO v_render_job_id;

  -- Render job 4: failed
  INSERT INTO render_jobs (
    organization_id,
    project_id,
    template_version_id,
    status,
    payload,
    error_message,
    queued_at,
    started_at,
    finished_at
  )
  VALUES (
    v_org_id,
    v_project_id,
    v_template_version_id,
    'failed',
    '{"name": "Failed User", "email": "failed@example.com"}'::jsonb,
    'Loading images, fonts, CSS or JS in a Template requires a paid plan.',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day' + INTERVAL '5 minutes',
    NOW() - INTERVAL '1 day' + INTERVAL '10 minutes'
  )
  RETURNING id INTO v_render_job_id;

  -- Documento 2: failed (sin URL porque falló)
  -- No insertamos documento para este porque falló

  -- Render job 5: succeeded (otro documento exitoso)
  INSERT INTO render_jobs (
    organization_id,
    project_id,
    template_version_id,
    status,
    payload,
    queued_at,
    started_at,
    finished_at
  )
  VALUES (
    v_org_id,
    v_project_id,
    v_template_version_id,
    'succeeded',
    '{"name": "Juan Pérez", "email": "juan@example.com"}'::jsonb,
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days' + INTERVAL '2 minutes',
    NOW() - INTERVAL '3 days' + INTERVAL '5 minutes'
  )
  RETURNING id INTO v_render_job_id;

  -- Documento 3: succeeded
  INSERT INTO documents (
    render_job_id,
    organization_id,
    project_id,
    template_version_id,
    file_url,
    storage_provider,
    file_size_bytes,
    created_at
  )
  VALUES (
    v_render_job_id,
    v_org_id,
    v_project_id,
    v_template_version_id,
    'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    'supabase',
    204800,
    NOW() - INTERVAL '3 days' + INTERVAL '5 minutes'
  );

  RAISE NOTICE 'Documentos dummy creados exitosamente';
  RAISE NOTICE 'Organization ID: %', v_org_id;
  RAISE NOTICE 'Project ID: %', v_project_id;
  RAISE NOTICE 'Template Version ID: %', v_template_version_id;

END $$;
