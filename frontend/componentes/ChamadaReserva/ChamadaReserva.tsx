import Link from "next/link";
import estilos from "./ChamadaReserva.module.css";

export default function ChamadaReserva() {
  return (
    <section className="secao">
      <div className="container">
        <div className={estilos.painel}>
          <h2 className={estilos.titulo}>Reserve a sua mesa</h2>
          <p className={estilos.texto}>
            Venha com a família ou com os amigos. Entre em contato e garanta o seu lugar.
          </p>
          <Link href="/#contato" className="botao botaoPreenchido">Ver contatos</Link>
        </div>
      </div>
    </section>
  );
}
