import estilos from "./DestaquesCardapio.module.css";

const ARR_CATEGORIAS = [
  { nmCategoria: "Entradas", dsCategoria: "Porções e petiscos para começar a refeição com calma." },
  { nmCategoria: "Pratos principais", dsCategoria: "Pratos preparados na hora, com opções para todos os gostos." },
  { nmCategoria: "Sobremesas", dsCategoria: "Doces para fechar a refeição com um toque especial." },
  { nmCategoria: "Bebidas", dsCategoria: "Sucos, refrigerantes, cervejas e vinhos para acompanhar." },
];

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
          {ARR_CATEGORIAS.map((categoria) => (
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
