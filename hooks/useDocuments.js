import { useState, useEffect } from 'react';
import { getUserDocuments } from '../lib/documents';

export function useDocuments({ projectId, templateId } = {}) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUserDocuments({ projectId, templateId });
      setDocuments(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [projectId, templateId]);

  return {
    documents,
    loading,
    error,
    refreshDocuments: fetchDocuments,
  };
}

