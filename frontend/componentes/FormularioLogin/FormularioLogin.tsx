"use client";

import { FormEvent, useState }                 from "react";
import { useRouter }                           from "next/navigation";
import { OBJ_ROTA_POR_PERFIL }                 from "@/lib/constantes";
import { verificarAcesso, type UsuarioSessao } from "@/lib/sessao";
import estilos from "./FormularioLogin.module.css";

function escolherDestino(usuario: UsuarioSessao): string
{
  if (!usuario?.perfil)
    return "/";

  const dsDe = new URLSearchParams(window.location.search).get("de");

  if (dsDe && dsDe.startsWith("/") && !dsDe.startsWith("//") && verificarAcesso(dsDe, usuario.perfil))
    return dsDe;

  return OBJ_ROTA_POR_PERFIL[usuario.perfil];
}

export default function FormularioLogin() {
  const router                  = useRouter();
  const [dsLogin,  setDsLogin]  = useState("");
  const [dsSenha,  setDsSenha]  = useState("");
  const [dsErro,   setDsErro]   = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviarFormulario(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (!dsLogin.trim() || !dsSenha)
      return;

    setDsErro("");
    setEnviando(true);

    try
    {
      const resposta = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ds_login: dsLogin, ds_senha: dsSenha }),
      });
      const corpo = await resposta.json().catch(() => null);

      if (!resposta.ok)
      {
        const dsMensagem = Array.isArray(corpo?.message) ? corpo.message.join(". ") : corpo?.message;

        setDsErro(dsMensagem || "Não foi possível entrar.");
        return;
      }

      router.push(escolherDestino(corpo.usuario));
      router.refresh();
    }
    catch
    {
      setDsErro("Não foi possível conectar ao servidor.");
    }
    finally
    {
      setEnviando(false);
    }
  }

  return (
    <form className={estilos.formulario} onSubmit={enviarFormulario}>
      <div className={estilos.campo}>
        <label htmlFor="login" className={estilos.rotulo}>Apelido ou e-mail</label>
        <input
          id="login"
          type="text"
          autoComplete="username"
          required
          value={dsLogin}
          onChange={(evento) => setDsLogin(evento.target.value)}
          className={estilos.entrada}
        />
      </div>

      <div className={estilos.campo}>
        <label htmlFor="senha" className={estilos.rotulo}>Senha</label>
        <input
          id="senha"
          type="password"
          autoComplete="current-password"
          required
          value={dsSenha}
          onChange={(evento) => setDsSenha(evento.target.value)}
          className={estilos.entrada}
        />
      </div>

      {dsErro && <p role="alert" className={estilos.erro}>{dsErro}</p>}

      <button type="submit" disabled={enviando} className={`botao botaoPreenchido ${estilos.botao}`}>
        {enviando ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
