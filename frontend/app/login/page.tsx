import type { Metadata } from "next";
import FormularioLogin from "@/componentes/FormularioLogin/FormularioLogin";
import { NM_RESTAURANTE } from "@/lib/constantes";
import estilos from "./page.module.css";

export const metadata: Metadata = {
  title: `Entrar | ${NM_RESTAURANTE}`,
};

export default function Login() {
  return (
    <section className={`secao ${estilos.pagina}`}>
      <div className="container">
        <div className={estilos.cartao}>
          <p className="sobretitulo">Área restrita</p>
          <h1 className={estilos.titulo}>Entrar</h1>
          <span className={estilos.divisor} aria-hidden="true" />
          <FormularioLogin />
        </div>
      </div>
    </section>
  );
}
