import { useState, useEffect } from 'react';
import { getUserDocuments, getDocument } from '../lib/documents';

export function useDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUserDocuments();
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
  }, []);

  const loadDocument = async (documentId) => {
    try {
      const document = await getDocument(documentId);
      return document;
    } catch (err) {
      throw err;
    }
  };

  return {
    documents,
    loading,
    error,
    loadDocument,
    refreshDocuments: fetchDocuments,
  };
}
