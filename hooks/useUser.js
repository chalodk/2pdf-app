import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getUserDisplayName } from '../utils/userUtils';

export function useUser() {
  const [userName, setUserName] = useState('Usuario');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserName(getUserDisplayName(user));
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserName();
  }, []);

  return { userName, loading };
}

