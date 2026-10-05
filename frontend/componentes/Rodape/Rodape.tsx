import { NM_SISTEMA } from "@/lib/constantes";
import estilos from "./Rodape.module.css";

export default function Rodape()
{
  const nrAnoAtual = new Date().getFullYear();

  return (
    <footer className={estilos.rodape}>
      <div className={estilos.conteudo}>
        <p>© {nrAnoAtual} {NM_SISTEMA}</p>
        <p>Trabalho final de Desenvolvimento Web e Mobile</p>
      </div>
    </footer>
  );
}
