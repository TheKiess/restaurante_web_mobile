"use client";

import { FormEvent, useState } from "react";
import estilos from "./FormularioLogin.module.css";

export default function FormularioLogin() {
  const [dsEmail, setDsEmail] = useState("");
  const [dsSenha, setDsSenha] = useState("");

  function enviarFormulario(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (!dsEmail.trim() || !dsSenha)
      return;
    // A chamada de login na API entra aqui quando a autenticação for feita Evelyn...
  }

  return (
    <form className={estilos.formulario} onSubmit={enviarFormulario}>
      <div className={estilos.campo}>
        <label htmlFor="email" className={estilos.rotulo}>E-mail</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={dsEmail}
          onChange={(evento) => setDsEmail(evento.target.value)}
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

      <button type="submit" className={`botao botaoPreenchido ${estilos.botao}`}>Entrar</button>
    </form>
  );
}
