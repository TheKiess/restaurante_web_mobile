import Link from "next/link";
import { DS_CHAMADA, NM_RESTAURANTE } from "@/lib/constantes";
import estilos from "./Apresentacao.module.css";

export default function Apresentacao()
{
  return (
    <section className={estilos.apresentacao}>
      <div className={`container ${estilos.conteudo}`}>
        <p className="sobretitulo">Seja bem-vindo</p>
        <h1 className={estilos.titulo}>{NM_RESTAURANTE}</h1>
        <span className={estilos.divisor} aria-hidden="true" />
        <p className={estilos.chamada}>{DS_CHAMADA}</p>
        <div className={estilos.botoes}>
          <Link href="/#cardapio" className="botao botaoPreenchido">Ver cardápio</Link>
          <Link href="/#contato" className="botao botaoContorno">Reservar mesa</Link>
        </div>
      </div>
    </section>
  );
}
