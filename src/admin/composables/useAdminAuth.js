import { ref } from 'vue';

// Module-level singleton so every component/guard shares the same session state.
const authenticated = ref(null); // null = not checked yet
const checking = ref(false);

async function checkSession() {
  checking.value = true;
  try {
    const res = await fetch('/api/auth/session', { credentials: 'include' });
    const data = await res.json();
    authenticated.value = !!data.authenticated;
  } catch {
    authenticated.value = false;
  } finally {
    checking.value = false;
  }
  return authenticated.value;
}

async function login(password) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Login failed');
  authenticated.value = true;
}

async function logout() {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
  authenticated.value = false;
}

export function useAdminAuth() {
  return { authenticated, checking, checkSession, login, logout };
}
