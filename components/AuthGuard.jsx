import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';

export default function AuthGuard({ children }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    // Verificar sesión actual y procesar callback de OAuth si existe
    const checkSession = async () => {
      // Procesar el hash de la URL si viene del callback de OAuth
      const { data: { session: hashSession } } = await supabase.auth.getSession();
      
      if (mounted) {
        if (hashSession) {
          setAuthenticated(true);
          setLoading(false);
        } else {
          // Verificar si hay un hash en la URL (callback de OAuth)
          const hashParams = new URLSearchParams(
            typeof window !== 'undefined' ? window.location.hash.substring(1) : ''
          );
          
          if (hashParams.get('access_token') || hashParams.get('error')) {
            // Esperar a que onAuthStateChange maneje el callback
            return;
          }
          
          router.push('/login');
          setLoading(false);
        }
      }
    };

    checkSession();

    // Escuchar cambios en la autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      
      if (session) {
        setAuthenticated(true);
        setLoading(false);
        // Limpiar el hash de la URL después del login exitoso
        if (typeof window !== 'undefined' && window.location.hash) {
          window.history.replaceState(null, '', window.location.pathname);
        }
      } else {
        if (event === 'SIGNED_OUT') {
          router.push('/login');
        }
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#0d1117',
        color: '#c9d1d9',
      }}>
        <div>Cargando...</div>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return <>{children}</>;
}

