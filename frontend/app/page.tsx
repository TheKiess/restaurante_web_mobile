import { DS_SISTEMA, NM_SISTEMA } from "@/lib/constantes";
import estilos from "./page.module.css";

const ARR_MODULOS = [
  { nmModulo: "Fila de preparo",         dsModulo: "Pedidos lançados pelos garçons, na ordem em que a cozinha deve preparar." },
  { nmModulo: "Cardápio e preços",       dsModulo: "Cadastro das categorias, itens e valores do cardápio." },
  { nmModulo: "Painel do salão",         dsModulo: "Situação das mesas, comandas abertas e reservas." },
  { nmModulo: "Fechamento e relatórios", dsModulo: "Fechamento das comandas e consulta de relatórios." },
];

export default function Home()
{
  return (
    <section>
      <h1 className={estilos.titulo}>{NM_SISTEMA}</h1>
      <p className={estilos.descricao}>{DS_SISTEMA}</p>
      <ul className={estilos.modulos}>
        {ARR_MODULOS.map((modulo) => (
          <li key={modulo.nmModulo} className={estilos.cartao}>
            <h2 className={estilos.tituloCartao}>{modulo.nmModulo}</h2>
            <p className={estilos.textoCartao}>{modulo.dsModulo}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
