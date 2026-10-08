import Link from "next/link";
import { ARR_LINKS_NAVEGACAO, NM_RESTAURANTE } from "@/lib/constantes";
import estilos from "./Cabecalho.module.css";

export default function Cabecalho()
{
  return (
    <header className={estilos.cabecalho}>
      <div className={`container ${estilos.conteudo}`}>
        <Link href="/" className={estilos.marca}>
          <span className={estilos.ornamento} aria-hidden="true" />
          {NM_RESTAURANTE}
        </Link>
        <nav className={estilos.navegacao} aria-label="Navegação principal">
          <ul className={estilos.lista}>
            {ARR_LINKS_NAVEGACAO.map((link) => (
              <li key={link.dsCaminho}>
                <Link href={link.dsCaminho} className={estilos.link}>{link.nmRotulo}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className={estilos.acoes}>
          <Link href="/login" className="botao botaoContorno">Entrar</Link>
        </div>
      </div>
    </header>
  );
}
