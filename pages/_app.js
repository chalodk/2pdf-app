import '../styles/editor.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { useRouter } from 'next/router';
import AuthGuard from '../components/AuthGuard';

export default function App({ Component, pageProps }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }));

  const router = useRouter();
  const isLoginPage = router.pathname === '/login';

  return (
    <QueryClientProvider client={queryClient}>
      {isLoginPage ? (
        <Component {...pageProps} />
      ) : (
        <AuthGuard>
          <Component {...pageProps} />
        </AuthGuard>
      )}
    </QueryClientProvider>
  );
}

