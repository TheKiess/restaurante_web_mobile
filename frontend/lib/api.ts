/**
 * Arquivo responsável por mediar a comunicação entre frontend e backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function obterUrl(endpoint: string): string {
  if (!API_URL) {
    throw new Error(
      "A variável NEXT_PUBLIC_API_URL não foi configurada."
    );
  }

  const baseUrl = API_URL.replace(/\/+$/, "");
  const caminho = endpoint.replace(/^\/+/, "");

  return `${baseUrl}/${caminho}`;
}

async function tratarResposta<T>(resposta: Response): Promise<T> {
  if (!resposta.ok) {
    const mensagem = await resposta.text();

    throw new Error(
      mensagem || `Erro na API: HTTP ${resposta.status}`
    );
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
