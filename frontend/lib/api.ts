/**
 * Arquivo responsável por mediar a comunicação entre frontend e backend
 */

const API_URL = "/api";

function obterUrl(endpoint: string): string {
  return `${API_URL}/${endpoint.replace(/^\/+/, "")}`;
}

function lerMensagemDoCorpo(dsCorpo: string): string | undefined {
  try {
    const { message } = JSON.parse(dsCorpo);

    if (Array.isArray(message))
      return message.join(". ");

    return typeof message === "string" ? message : undefined;
  } catch {
    return undefined;
  }
}

async function tratarResposta<T>(resposta: Response): Promise<T> {
  if (resposta.status === 401 && !window.location.pathname.startsWith("/login"))
    window.location.href = `/login?de=${encodeURIComponent(window.location.pathname)}`;

  if (!resposta.ok)
  {
    const dsCorpo    = await resposta.text();
    const dsMensagem = lerMensagemDoCorpo(dsCorpo) || dsCorpo || `Erro na API: HTTP ${resposta.status}`;

    throw new Error(dsMensagem);
  }

  if (resposta.status === 204) {
    return undefined as T;
  }

  return (await resposta.json()) as T;
}

export async function apiGet<T>(endpoint: string): Promise<T> {
  const resposta = await fetch(obterUrl(endpoint), {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  return tratarResposta<T>(resposta);
}

export async function apiPost<T>(
  endpoint: string,
  dados: unknown
): Promise<T> {
  const resposta = await fetch(obterUrl(endpoint), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dados),
  });

  return tratarResposta<T>(resposta);
}

export async function apiPatch<T>(
  endpoint: string,
  dados: unknown
): Promise<T> {
  const resposta = await fetch(obterUrl(endpoint), {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dados),
    cache: "no-store",
  });

  return tratarResposta<T>(resposta);
}

export async function apiDelete<T>(endpoint: string): Promise<T> {
  const resposta = await fetch(obterUrl(endpoint), {
    method: "DELETE",
    headers: { Accept: "application/json" },
  });

  return tratarResposta<T>(resposta);
}
