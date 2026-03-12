#!/bin/bash

echo "🔧 Fixing import.meta.env TypeScript error..."

# ─────────────────────────────────────────────────────────────
# 1. Add vite/client types to client/src/vite-env.d.ts
# ─────────────────────────────────────────────────────────────
cat > client/src/vite-env.d.ts << 'EOF'
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_SOCKET_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
EOF
echo "✅ Created client/src/vite-env.d.ts"

# ─────────────────────────────────────────────────────────────
# 2. Simplify main.tsx — use hardcoded fallback instead of
#    import.meta.env to avoid any build-time issues
# ─────────────────────────────────────────────────────────────
cat > client/src/main.tsx << 'EOF'
import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import App from './App';
import { useAuthStore } from './stores/authStore';
import './index.css';

const queryClient = new QueryClient();
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

async function initAuth() {
  try {
    const { data } = await axios.post(
      `${API_URL}/api/auth/refresh`,
      {},
      { withCredentials: true }
    );
    const { data: user } = await axios.get(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${data.accessToken}` },
      withCredentials: true,
    });
    useAuthStore.getState().setAuth(user, data.accessToken);
  } catch {
    // No valid session
  }
}

function Root() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initAuth().finally(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <Root />
  </QueryClientProvider>
);
EOF
echo "✅ Fixed client/src/main.tsx"

echo ""
echo "Now run:"
echo "  docker-compose up --build"