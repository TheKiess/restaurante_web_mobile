import Apresentacao from "@/componentes/Apresentacao/Apresentacao";
import ChamadaReserva from "@/componentes/ChamadaReserva/ChamadaReserva";
import DestaquesCardapio from "@/componentes/DestaquesCardapio/DestaquesCardapio";
import Sobre from "@/componentes/Sobre/Sobre";

export default function Home()
{
  return (
    <>
      <Apresentacao />
      <Sobre />
      <DestaquesCardapio />
      <ChamadaReserva />
    </>
  );
}
