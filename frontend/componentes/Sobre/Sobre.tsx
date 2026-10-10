import estilos from "./Sobre.module.css";

const ARR_DIFERENCIAIS = [
  { nmTitulo: "Ingredientes frescos", dsTexto: "Pratos feitos na hora, com ingredientes selecionados." },
  { nmTitulo: "Ambiente acolhedor", dsTexto: "Um espaço confortável para reunir família e amigos." },
  { nmTitulo: "Atendimento atencioso", dsTexto: "Uma equipe pronta para cuidar de cada detalhe do seu pedido." },
];

export default function Sobre()
{
  return (
    <section id="sobre" className="secao">
      <div className="container">
        <div className="cabecalhoSecao">
          <p className="sobretitulo">Sobre nós</p>
          <h2 className="tituloSecao">Uma mesa pensada para receber bem</h2>
          <p>
            Aqui, cada refeição é preparada com cuidado, do preparo na cozinha ao atendimento no salão.
            Nosso objetivo é que você se sinta em casa, seja num almoço rápido ou numa comemoração em família.
          </p>
        </div>
        <ul className={estilos.diferenciais}>
          {ARR_DIFERENCIAIS.map((diferencial) => (
            <li key={diferencial.nmTitulo} className={estilos.diferencial}>
              <h3 className={estilos.tituloDiferencial}>{diferencial.nmTitulo}</h3>
              <p className={estilos.textoDiferencial}>{diferencial.dsTexto}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
