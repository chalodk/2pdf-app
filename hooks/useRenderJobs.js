import { useState, useCallback } from 'react';
import { createRenderJob, getRenderJob } from '../lib/renderJobs';

export function useRenderJobs() {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  const createJob = useCallback(async ({ templateVersionId, projectId, payload, options }) => {
    try {
      setCreating(true);
      setError(null);
      const job = await createRenderJob({ templateVersionId, projectId, payload, options });
      return job;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setCreating(false);
    }
  }, []);

  const fetchJob = useCallback(async (jobId) => {
    try {
      const job = await getRenderJob(jobId);
      return job;
    } catch (err) {
      throw err;
    }
  }, []);

  return {
    createJob,
    fetchJob,
    creating,
    error,
  };
}

