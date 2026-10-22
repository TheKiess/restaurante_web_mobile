"use client";

import Link               from "next/link";
import { usePathname }    from "next/navigation";
import { NM_RESTAURANTE } from "@/lib/constantes";
import estilos            from "./LayoutPainel.module.css";

interface LinkPainel {
  nmRotulo: string;
  dsCaminho: string;
}

interface LayoutPainelProps {
  nmArea: string;
  arrLinks: LinkPainel[];
  children: React.ReactNode;
}

export default function LayoutPainel({ nmArea, arrLinks, children }: LayoutPainelProps)
{
  const dsRotaAtual = usePathname();
  const dsRaiz = arrLinks[0]?.dsCaminho;

  function verificarAtivo(dsCaminho: string) {
    if (dsRotaAtual === dsCaminho)
      return true;

    return dsCaminho !== dsRaiz && dsRotaAtual.startsWith(`${dsCaminho}/`);
  }

  return (
    <div className={estilos.painel}>
      <aside className={estilos.lateral}>
        <Link href="/" className={estilos.marca}>
          <span className={estilos.ornamento} aria-hidden="true" />
          {NM_RESTAURANTE}
        </Link>
        <p className={estilos.area}>{nmArea}</p>
        <nav aria-label={nmArea}>
          <ul className={estilos.lista}>
            {arrLinks.map((link) => (
              <li key={link.dsCaminho}>
                <Link
                  href={link.dsCaminho}
                  className={estilos.link}
                  aria-current={verificarAtivo(link.dsCaminho) ? "page" : undefined}
                >
                  {link.nmRotulo}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className={estilos.rodapeLateral}>
          <Link href="/" className={estilos.link}>Voltar ao site</Link>
        </div>
      </aside>
      <div className={estilos.conteudo}>{children}</div>
    </div>
  );
}
