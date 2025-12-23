'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useRenderJobs } from '../hooks/useRenderJobs';
import Toast from './Toast';

const STATUS_LABELS = {
  queued: 'En cola',
  processing: 'Procesando',
  succeeded: 'Completado',
  failed: 'Fallido',
  cancelled: 'Cancelado',
  expired: 'Expirado',
};

const STATUS_COLORS = {
  queued: '#6b7280',
  processing: '#3b82f6',
  succeeded: '#10b981',
  failed: '#ef4444',
  cancelled: '#f59e0b',
  expired: '#8b5cf6',
};

export default function GeneratePDFModal({ isOpen, onClose, jobId, onSuccess }) {
  const router = useRouter();
  const { fetchJob } = useRenderJobs();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  // Polling del estado del job
  useEffect(() => {
    if (!isOpen || !jobId) {
      setJob(null);
      setLoading(true);
      setError(null);
      // Limpiar intervalo y timeout si existen
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    let isMounted = true;
    let pollCount = 0;
    const MAX_POLLS = 150; // Máximo 5 minutos (150 * 2 segundos)

    const pollJobStatus = async () => {
      if (!isMounted) return;
      
      pollCount++;
      
      // Timeout después de 5 minutos
      if (pollCount > MAX_POLLS) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setError('El proceso está tomando más tiempo del esperado. Por favor, verifica el estado del job manualmente.');
        setLoading(false);
        return;
      }
      
      try {
        console.log(`[Poll ${pollCount}] Fetching job status for:`, jobId);
        const jobData = await fetchJob(jobId);
        if (!isMounted) return;
        
        console.log(`[Poll ${pollCount}] Job status received:`, jobData.status);
        setJob(jobData);
        setLoading(false);
        setError(null);

        // Si el job terminó (succeeded o failed), detener polling
        if (jobData.status === 'succeeded' || jobData.status === 'failed' || jobData.status === 'cancelled' || jobData.status === 'expired') {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }

          if (jobData.status === 'succeeded' && onSuccess) {
            onSuccess(jobData);
          }
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('Error polling job status:', err);
        setError(err.message || 'Error al consultar el estado del job');
        setLoading(false);
        // Detener polling en caso de error
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      }
    };

    // Cargar inmediatamente
    pollJobStatus();

    // Polling cada 2 segundos si el job está en proceso
    intervalRef.current = setInterval(() => {
      pollJobStatus();
    }, 2000);

    return () => {
      isMounted = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isOpen, jobId, fetchJob, onSuccess]);

  const handleClose = () => {
    onClose();
  };

  const handleViewDocument = () => {
    if (job?.document?.id) {
      router.push('/documents');
      handleClose();
    }
  };

  const handleDownload = () => {
    if (job?.document?.file_url) {
      window.open(job.document.file_url, '_blank');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}
        onClick={handleClose}
      >
        <div 
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            padding: '24px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
              Generando PDF
            </h2>
            {jobId && (
              <p style={{ fontSize: '14px', color: '#6b7280' }}>
                Job ID: <code style={{ backgroundColor: '#f3f4f6', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>{jobId.slice(0, 8)}...</code>
              </p>
            )}
          </div>

          {loading && !job && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                border: '4px solid #f3f4f6', 
                borderTop: '4px solid #3b82f6', 
                borderRadius: '50%', 
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }} />
              <p style={{ color: '#6b7280' }}>Iniciando generación...</p>
            </div>
          )}

          {error && (
            <div style={{ 
              padding: '16px', 
              backgroundColor: '#fee2e2', 
              borderRadius: '6px', 
              marginBottom: '16px',
              color: '#dc2626'
            }}>
              <strong>Error:</strong> {error}
            </div>
          )}

          {job && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: STATUS_COLORS[job.status] || '#6b7280',
                    animation: job.status === 'processing' ? 'pulse 2s infinite' : 'none',
                  }} />
                  <span style={{ fontSize: '16px', fontWeight: '500', color: '#111827' }}>
                    {STATUS_LABELS[job.status] || job.status}
                  </span>
                </div>

                {(job.status === 'processing' || job.status === 'queued') && (
                  <div style={{ marginLeft: '24px' }}>
                    <div style={{ 
                      width: '100%', 
                      height: '4px', 
                      backgroundColor: '#f3f4f6', 
                      borderRadius: '2px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: STATUS_COLORS[job.status] || '#6b7280',
                        animation: 'progress 2s ease-in-out infinite',
                      }} />
                    </div>
                    {job.status === 'queued' && (
                      <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                        <p>Esperando a que el servidor procese el job...</p>
                        <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                          Nota: Se requiere un servicio backend que procese los render jobs.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {job.templateVersion?.template && (
                  <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px', marginLeft: '24px' }}>
                    Template: {job.templateVersion.template.name} ({job.templateVersion.versionLabel})
                  </p>
                )}
              </div>

              {job.status === 'succeeded' && job.document && (
                <div style={{ 
                  padding: '16px', 
                  backgroundColor: '#f0fdf4', 
                  borderRadius: '6px', 
                  marginBottom: '16px',
                  border: '1px solid #86efac'
                }}>
                  <p style={{ color: '#166534', marginBottom: '12px', fontWeight: '500' }}>
                    ✓ PDF generado exitosamente
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={handleViewDocument}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                      }}
                    >
                      Ver en Documents
                    </button>
                    <button
                      onClick={handleDownload}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#ffffff',
                        color: '#10b981',
                        border: '1px solid #10b981',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                      }}
                    >
                      Descargar
                    </button>
                  </div>
                </div>
              )}

              {job.status === 'failed' && (
                <div style={{ 
                  padding: '16px', 
                  backgroundColor: '#fee2e2', 
                  borderRadius: '6px', 
                  marginBottom: '16px',
                  color: '#dc2626'
                }}>
                  <strong>Error:</strong> {job.errorMessage || 'Error desconocido al generar el PDF'}
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '24px' }}>
            <button
              onClick={handleClose}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              {job?.status === 'succeeded' || job?.status === 'failed' ? 'Cerrar' : 'Cancelar'}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>

      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </>
  );
}

