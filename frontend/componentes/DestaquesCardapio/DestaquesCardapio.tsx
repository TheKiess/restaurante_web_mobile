import FotoItem                    from "@/componentes/FotoItem/FotoItem";
import { ARR_CATEGORIAS_CARDAPIO } from "@/lib/constantes";
import { URL_API }                 from "@/lib/servidor";
import estilos                     from "./DestaquesCardapio.module.css";

type ItemDestaque = {
  id_item_cardapio: number;
  nm_item: string;
  ds_item: string | null;
  ds_imagem: string | null;
  disponivel: boolean;
  categoria?: { nm_categoria: string };
};

const NR_MAXIMO_DESTAQUES = 6;

// Itens disponíveis que têm foto. Se o backend estiver fora do ar, a lista vem vazia e o site mostra as categorias.
async function buscarDestaques(): Promise<ItemDestaque[]>
{
  try
  {
    const resposta = await fetch(`${URL_API}/itens-cardapio`, { next: { revalidate: 60 } });

    if (!resposta.ok)
      return [];

    const arrItens = (await resposta.json()) as ItemDestaque[];

    return arrItens.filter((item) => item.disponivel && item.ds_imagem).slice(0, NR_MAXIMO_DESTAQUES);
  }
  catch
  {
    return [];
  }
}

export default async function DestaquesCardapio()
{
  const arrDestaques = await buscarDestaques();

  return (
    <section id="cardapio" className={`secao ${estilos.cardapio}`}>
      <div className="container">
        <div className="cabecalhoSecao">
          <p className="sobretitulo">Cardápio</p>
          <h2 className="tituloSecao">Algo para cada momento</h2>
          <p>
            {arrDestaques.length > 0
              ? "Conheça alguns dos nossos pratos. Os itens e valores completos você confere no salão."
              : "Conheça as categorias do nosso cardápio. Os itens e valores completos você confere no salão."}
          </p>
        </div>

        {arrDestaques.length > 0 ? (
          <ul className={estilos.categorias}>
            {arrDestaques.map((item) => (
              <li key={item.id_item_cardapio} className={estilos.cartaoFoto}>
                <FotoItem dsImagem={item.ds_imagem} nmItem={item.nm_item} variante="cartao" />
                {item.categoria && <p className={estilos.categoriaItem}>{item.categoria.nm_categoria}</p>}
                <h3 className={estilos.tituloCartao}>{item.nm_item}</h3>
                {item.ds_item && <p className={estilos.textoCartao}>{item.ds_item}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <ul className={estilos.categorias}>
            {ARR_CATEGORIAS_CARDAPIO.map((categoria) => (
              <li key={categoria.nmCategoria} className={estilos.cartao}>
                <h3 className={estilos.tituloCartao}>{categoria.nmCategoria}</h3>
                <p className={estilos.textoCartao}>{categoria.dsCategoria}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
