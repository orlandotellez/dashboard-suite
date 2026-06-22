interface ApiError {
  message: string;
  statusCode?: number;
}

export class ApiFetchError extends Error {
  status: number;
  body: ApiError;

  constructor(message: string, status: number, body: ApiError) {
    super(message);
    this.name = 'ApiFetchError';
    this.status = status;
    this.body = body;
  }
}

async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  // Obtener token del localStorage para evitar dependencias circulares
  const token = localStorage.getItem('auth-storage')
    ? JSON.parse(localStorage.getItem('auth-storage')!)?.state?.accessToken
    : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const url = path.startsWith('http') ? path : `/api${path}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody: ApiError = await response.json().catch(() => ({
      message: `HTTP error ${response.status}`,
    }));

    // Si es 401, redirigir a login
    if (response.status === 401) {
      // Limpiar storage y redirigir
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }

    throw new ApiFetchError(
      errorBody.message || `HTTP error ${response.status}`,
      response.status,
      errorBody
    );
  }

  // Para respuestas 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// Helpers para métodos HTTP comunes
export const api = {
  get: <T = unknown>(path: string) => apiFetch<T>(path, { method: 'GET' }),

  post: <T = unknown>(path: string, data?: unknown) =>
    apiFetch<T>(path, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T = unknown>(path: string, data?: unknown) =>
    apiFetch<T>(path, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T = unknown>(path: string, data?: unknown) =>
    apiFetch<T>(path, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T = unknown>(path: string) =>
    apiFetch<T>(path, { method: 'DELETE' }),
};
