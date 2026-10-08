import Link from "next/link";
import {
  ARR_HORARIOS,
  ARR_LINKS_NAVEGACAO,
  DS_CHAMADA,
  DS_EMAIL,
  DS_ENDERECO,
  DS_TELEFONE,
  NM_RESTAURANTE,
} from "@/lib/constantes";
import estilos from "./Rodape.module.css";

export default function Rodape()
{
  const nrAnoAtual = new Date().getFullYear();
  const dsTelefoneLink = DS_TELEFONE.replace(/\D/g, "");

  return (
    <footer className={estilos.rodape}>
      <div className={`container ${estilos.colunas}`}>
        <section>
          <p className={estilos.marca}>{NM_RESTAURANTE}</p>
          <p className={estilos.texto}>{DS_CHAMADA}</p>
        </section>

        <nav aria-label="Navegação do rodapé">
          <h2 className={estilos.tituloColuna}>Navegação</h2>
          <ul className={estilos.lista}>
            {ARR_LINKS_NAVEGACAO.map((link) => (
              <li key={link.dsCaminho}>
                <Link href={link.dsCaminho} className={estilos.link}>{link.nmRotulo}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <section id="horarios">
          <h2 className={estilos.tituloColuna}>Horários</h2>
          <dl className={estilos.horarios}>
            {ARR_HORARIOS.map((horario) => (
              <div key={horario.nmDias} className={estilos.horario}>
                <dt>{horario.nmDias}</dt>
                <dd>{horario.dsHorario}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section id="contato">
          <h2 className={estilos.tituloColuna}>Contato</h2>
          <address className={estilos.contato}>
            <p>{DS_ENDERECO}</p>
            <p><a href={`tel:${dsTelefoneLink}`} className={estilos.link}>{DS_TELEFONE}</a></p>
            <p><a href={`mailto:${DS_EMAIL}`} className={estilos.link}>{DS_EMAIL}</a></p>
          </address>
        </section>
      </div>

      <div className={estilos.barraFinal}>
        <div className={`container ${estilos.conteudoBarra}`}>
          <p>© {nrAnoAtual} {NM_RESTAURANTE}. Todos os direitos reservados.</p>
          <p>Trabalho final de Desenvolvimento Web e Mobile</p>
        </div>
      </div>
    </footer>
  );
}
