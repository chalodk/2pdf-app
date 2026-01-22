-- Documentos dummy para probar Documents y filtro por proyecto
-- Flujo: 1) API keys por proyecto. 2) Ejecutar este seed. 3) En /documents ves todos y filtras.
-- Crea docs (PDF público) para "Carpeta usuarios" y "Proyecto 2". Pasos de verificación: README.md
-- Si ejecutas varias veces → más filas. Limpiar: borrar manualmente o restaurar DB.

DO $$
DECLARE
  v_org_id uuid;
  v_app_user_id uuid;
  v_project_1_id uuid;  -- Carpeta usuarios
  v_project_2_id uuid;  -- Proyecto 2
  v_tpl_1_id uuid;
  v_tpl_2_id uuid;
  v_tv_1_id uuid;
  v_tv_2_id uuid;
  v_job_id uuid;
  v_pdf_url text := 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
BEGIN
  -- 1. app_user
  SELECT id INTO v_app_user_id FROM app_users LIMIT 1;
  IF v_app_user_id IS NULL THEN
    INSERT INTO app_users (auth_user_id, display_name)
    VALUES (gen_random_uuid(), 'Usuario Dummy')
    RETURNING id INTO v_app_user_id;
  END IF;

  -- 2. Organización (usar existente)
  SELECT id INTO v_org_id FROM organizations LIMIT 1;
  IF v_org_id IS NULL THEN
    INSERT INTO organizations (name, slug, created_by)
    VALUES ('Organización Dummy', 'org-dummy', v_app_user_id)
    RETURNING id INTO v_org_id;
    INSERT INTO organization_memberships (organization_id, user_id, role)
    VALUES (v_org_id, v_app_user_id, 'owner');
  END IF;

  -- 3. Proyecto 1: "Carpeta usuarios" (o el primero que exista)
  SELECT id INTO v_project_1_id
  FROM projects
  WHERE organization_id = v_org_id AND name ILIKE '%Carpeta usuarios%'
  LIMIT 1;
  IF v_project_1_id IS NULL THEN
    SELECT id INTO v_project_1_id
    FROM projects
    WHERE organization_id = v_org_id
    ORDER BY created_at ASC
    LIMIT 1;
  END IF;
  IF v_project_1_id IS NULL THEN
    INSERT INTO projects (organization_id, name, slug, created_by)
    VALUES (v_org_id, 'Carpeta usuarios', 'carpeta-usuarios', v_app_user_id)
    RETURNING id INTO v_project_1_id;
  END IF;

  -- 4. Proyecto 2: "Proyecto 2" (crear si no existe)
  SELECT id INTO v_project_2_id
  FROM projects
  WHERE organization_id = v_org_id AND name ILIKE '%Proyecto 2%'
  LIMIT 1;
  IF v_project_2_id IS NULL THEN
    INSERT INTO projects (organization_id, name, slug, created_by)
    VALUES (v_org_id, 'Proyecto 2', 'proyecto-2', v_app_user_id)
    RETURNING id INTO v_project_2_id;
  END IF;

  -- 5. Template + version para Proyecto 1 (Carpeta usuarios)
  SELECT t.id, tv.id INTO v_tpl_1_id, v_tv_1_id
  FROM templates t
  JOIN template_versions tv ON tv.template_id = t.id AND tv.is_default = true
  WHERE t.organization_id = v_org_id AND t.project_id = v_project_1_id
  LIMIT 1;
  IF v_tpl_1_id IS NULL OR v_tv_1_id IS NULL THEN
    INSERT INTO templates (organization_id, project_id, name, created_by)
    VALUES (v_org_id, v_project_1_id, 'Template usuarios', v_app_user_id)
    RETURNING id INTO v_tpl_1_id;
    INSERT INTO template_versions (template_id, version_label, html, css, is_default, is_active, created_by)
    VALUES (
      v_tpl_1_id, '1.0.0',
      '<div>Hola {{name}}, Carpeta usuarios.</div>',
      'body { font-family: Arial; }',
      true, true, v_app_user_id
    )
    RETURNING id INTO v_tv_1_id;
  END IF;

  -- 6. Template + version para Proyecto 2
  SELECT t.id, tv.id INTO v_tpl_2_id, v_tv_2_id
  FROM templates t
  JOIN template_versions tv ON tv.template_id = t.id AND tv.is_default = true
  WHERE t.organization_id = v_org_id AND t.project_id = v_project_2_id
  LIMIT 1;
  IF v_tpl_2_id IS NULL OR v_tv_2_id IS NULL THEN
    INSERT INTO templates (organization_id, project_id, name, created_by)
    VALUES (v_org_id, v_project_2_id, 'Template Proyecto 2', v_app_user_id)
    RETURNING id INTO v_tpl_2_id;
    INSERT INTO template_versions (template_id, version_label, html, css, is_default, is_active, created_by)
    VALUES (
      v_tpl_2_id, '1.0.0',
      '<div>Hola {{name}}, Proyecto 2.</div>',
      'body { font-family: Arial; }',
      true, true, v_app_user_id
    )
    RETURNING id INTO v_tv_2_id;
  END IF;

  -- ---------- DOCUMENTOS DUMMY: CARPETA USUARIOS (Proyecto 1) ----------
  -- succeeded + PDF
  INSERT INTO render_jobs (organization_id, project_id, template_version_id, status, payload, queued_at, started_at, finished_at)
  VALUES (v_org_id, v_project_1_id, v_tv_1_id, 'succeeded',
    '{"name": "Daniel Rojas", "email": "daniel@example.com"}'::jsonb,
    NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour 55 minutes', NOW() - INTERVAL '1 hour 50 minutes')
  RETURNING id INTO v_job_id;
  INSERT INTO documents (render_job_id, organization_id, project_id, template_version_id, file_url, storage_provider, file_size_bytes, created_at)
  VALUES (v_job_id, v_org_id, v_project_1_id, v_tv_1_id, v_pdf_url, 'supabase', 102400, NOW() - INTERVAL '1 hour 50 minutes');

  -- queued
  INSERT INTO render_jobs (organization_id, project_id, template_version_id, status, payload, queued_at)
  VALUES (v_org_id, v_project_1_id, v_tv_1_id, 'queued',
    '{"name": "Test User", "email": "test@example.com"}'::jsonb,
    NOW() - INTERVAL '30 minutes');

  -- processing
  INSERT INTO render_jobs (organization_id, project_id, template_version_id, status, payload, queued_at, started_at)
  VALUES (v_org_id, v_project_1_id, v_tv_1_id, 'processing',
    '{"name": "Processing User", "email": "processing@example.com"}'::jsonb,
    NOW() - INTERVAL '15 minutes', NOW() - INTERVAL '10 minutes');

  -- failed (sin document)
  INSERT INTO render_jobs (organization_id, project_id, template_version_id, status, payload, error_message, queued_at, started_at, finished_at)
  VALUES (v_org_id, v_project_1_id, v_tv_1_id, 'failed',
    '{"name": "Failed User", "email": "failed@example.com"}'::jsonb,
    'Loading images, fonts, CSS or JS in a Template requires a paid plan.',
    NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '5 minutes', NOW() - INTERVAL '1 day' + INTERVAL '10 minutes');

  -- succeeded + PDF (otro)
  INSERT INTO render_jobs (organization_id, project_id, template_version_id, status, payload, queued_at, started_at, finished_at)
  VALUES (v_org_id, v_project_1_id, v_tv_1_id, 'succeeded',
    '{"name": "Juan Pérez", "email": "juan@example.com"}'::jsonb,
    NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '2 minutes', NOW() - INTERVAL '3 days' + INTERVAL '5 minutes')
  RETURNING id INTO v_job_id;
  INSERT INTO documents (render_job_id, organization_id, project_id, template_version_id, file_url, storage_provider, file_size_bytes, created_at)
  VALUES (v_job_id, v_org_id, v_project_1_id, v_tv_1_id, v_pdf_url, 'supabase', 204800, NOW() - INTERVAL '3 days' + INTERVAL '5 minutes');

  -- ---------- DOCUMENTOS DUMMY: PROYECTO 2 ----------
  -- succeeded + PDF
  INSERT INTO render_jobs (organization_id, project_id, template_version_id, status, payload, queued_at, started_at, finished_at)
  VALUES (v_org_id, v_project_2_id, v_tv_2_id, 'succeeded',
    '{"name": "Usuario Proyecto 2", "email": "p2@example.com"}'::jsonb,
    NOW() - INTERVAL '5 hours', NOW() - INTERVAL '4 hours 55 minutes', NOW() - INTERVAL '4 hours 50 minutes')
  RETURNING id INTO v_job_id;
  INSERT INTO documents (render_job_id, organization_id, project_id, template_version_id, file_url, storage_provider, file_size_bytes, created_at)
  VALUES (v_job_id, v_org_id, v_project_2_id, v_tv_2_id, v_pdf_url, 'supabase', 153600, NOW() - INTERVAL '4 hours 50 minutes');

  -- queued
  INSERT INTO render_jobs (organization_id, project_id, template_version_id, status, payload, queued_at)
  VALUES (v_org_id, v_project_2_id, v_tv_2_id, 'queued',
    '{"name": "Cola P2", "email": "queue-p2@example.com"}'::jsonb,
    NOW() - INTERVAL '1 hour');

  -- succeeded + PDF (otro)
  INSERT INTO render_jobs (organization_id, project_id, template_version_id, status, payload, queued_at, started_at, finished_at)
  VALUES (v_org_id, v_project_2_id, v_tv_2_id, 'succeeded',
    '{"name": "María García", "email": "maria@example.com"}'::jsonb,
    NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '1 minute', NOW() - INTERVAL '2 days' + INTERVAL '3 minutes')
  RETURNING id INTO v_job_id;
  INSERT INTO documents (render_job_id, organization_id, project_id, template_version_id, file_url, storage_provider, file_size_bytes, created_at)
  VALUES (v_job_id, v_org_id, v_project_2_id, v_tv_2_id, v_pdf_url, 'supabase', 256000, NOW() - INTERVAL '2 days' + INTERVAL '3 minutes');

  RAISE NOTICE 'Documentos dummy creados: Carpeta usuarios (Proyecto 1) y Proyecto 2';
  RAISE NOTICE 'Org: %, Proyecto 1: %, Proyecto 2: %', v_org_id, v_project_1_id, v_project_2_id;
END $$;
