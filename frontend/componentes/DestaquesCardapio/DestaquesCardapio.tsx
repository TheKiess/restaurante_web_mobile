import { ARR_CATEGORIAS_CARDAPIO } from "@/lib/constantes";
import estilos from "./DestaquesCardapio.module.css";

export default function DestaquesCardapio() {
  return (
    <section id="cardapio" className={`secao ${estilos.cardapio}`}>
      <div className="container">
        <div className="cabecalhoSecao">
          <p className="sobretitulo">Cardápio</p>
          <h2 className="tituloSecao">Algo para cada momento</h2>
          <p>Conheça as categorias do nosso cardápio. Os itens e valores completos você confere no salão.</p>
        </div>
        <ul className={estilos.categorias}>
          {ARR_CATEGORIAS_CARDAPIO.map((categoria) => (
            <li key={categoria.nmCategoria} className={estilos.cartao}>
              <h3 className={estilos.tituloCartao}>{categoria.nmCategoria}</h3>
              <p className={estilos.textoCartao}>{categoria.dsCategoria}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
