import Link from "next/link";
import { NM_SISTEMA } from "@/lib/constantes";
import estilos from "./Cabecalho.module.css";

const ARR_LINKS_NAVEGACAO = [
  { nmRotulo: "Início",     dsCaminho: "/" },
  { nmRotulo: "Cozinha",    dsCaminho: "/cozinha" },
  { nmRotulo: "Cardápio",   dsCaminho: "/cardapio" },
  { nmRotulo: "Salão",      dsCaminho: "/salao" },
  { nmRotulo: "Relatórios", dsCaminho: "/relatorios" },
];

export default function Cabecalho()
{
  return (
    <header className={estilos.cabecalho}>
      <div className={estilos.conteudo}>
        <Link href="/" className={estilos.marca}>{NM_SISTEMA}</Link>
        <nav aria-label="Navegação principal">
          <ul className={estilos.lista}>
            {ARR_LINKS_NAVEGACAO.map((link) => (
              <li key={link.dsCaminho}>
                <Link href={link.dsCaminho} className={estilos.link}>{link.nmRotulo}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
