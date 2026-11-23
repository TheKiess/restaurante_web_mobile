import Image   from "next/image";
import estilos from "./FotoItem.module.css";

type PropsFotoItem = {
  dsImagem?: string | null;
  nmItem: string;
  variante?: "miniatura" | "grande" | "cartao";
  flOcultarSemFoto?: boolean;
};

// A foto vem do backend como caminho (/uploads/...), e é buscada pelo proxy do site em /api.
export default function FotoItem({ dsImagem, nmItem, variante = "miniatura", flOcultarSemFoto = false }: PropsFotoItem)
{
  if (!dsImagem && flOcultarSemFoto)
    return null;

  return (
    <div className={`${estilos.caixa} ${estilos[variante]}`}>
      {dsImagem ? (
        <Image
          src={`/api${dsImagem}`}
          alt={`Foto de ${nmItem}`}
          fill
          sizes={variante === "cartao" ? "(max-width: 700px) 100vw, 320px" : "96px"}
          unoptimized
          className={estilos.imagem}
        />
      ) : (
        <span className={estilos.semFoto}>Sem foto</span>
      )}
    </div>
  );
}
