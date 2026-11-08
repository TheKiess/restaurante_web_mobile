"use client";

import { useCallback, useState, type FormEvent } from "react";
import { apiGet, apiPatch, apiPost }             from "@/lib/api";
import { OBJ_NOMES_PERFIL }                      from "@/lib/constantes";
import { useCarregarAoMontar }                   from "@/lib/useCarregarAoMontar";
import { useSessao }                             from "@/lib/useSessao";
import estilos                                   from "@/estilos/Painel.module.css";

type Funcionario = {
  id_usuario: number;
  ds_apelido: string;
  perfil: string;
  id_ativo: boolean;
  pessoa: {
    nm_pessoa: string;
    ds_email: string | null;
    ds_telefone: string | null;
    ds_cnpj_cpf: string | null;
  };
};

type FormularioFuncionario = {
  nm_pessoa: string;
  ds_apelido: string;
  ds_senha: string;
  perfil: string;
  ds_email: string;
  ds_telefone: string;
  ds_cnpj_cpf: string;
};

const ARR_PERFIS_FUNCIONARIO = ["GARCOM", "COZINHA", "GERENCIA"];

const OBJ_FORMULARIO_INICIAL: FormularioFuncionario = {
  nm_pessoa: "",
  ds_apelido: "",
  ds_senha: "",
  perfil: "GARCOM",
  ds_email: "",
  ds_telefone: "",
  ds_cnpj_cpf: "",
};

const OBJ_CLASSE_PERFIL: Record<string, string> = {
  GERENCIA: estilos.seloEmPreparo,
  GARCOM: estilos.seloAguardando,
  COZINHA: estilos.seloNeutro,
};

function somenteNumeros(dsTexto: string): string
{
  return dsTexto.replace(/\D/g, "");
}

export default function FuncionariosPage()
{
  const usuarioLogado = useSessao();

  const [arrFuncionarios, setArrFuncionarios]     = useState<Funcionario[]>([]);
  const [formulario,      setFormulario]          = useState<FormularioFuncionario>(OBJ_FORMULARIO_INICIAL);
  const [nrIdEditando,    setNrIdEditando]        = useState<number | null>(null);
  const [dsFiltroPerfil,  setDsFiltroPerfil]      = useState("");
  const [dsBusca,         setDsBusca]             = useState("");
  const [flMostrarInativos, setFlMostrarInativos] = useState(false);
  const [flCarregando,    setFlCarregando]        = useState(true);
  const [flSalvando,      setFlSalvando]          = useState(false);
  const [dsErro,          setDsErro]              = useState("");
  const [dsSucesso,       setDsSucesso]           = useState("");

  const carregarFuncionarios = useCallback(async () => {
    setFlCarregando(true);

    try
    {
      setArrFuncionarios(await apiGet<Funcionario[]>("usuarios?funcionarios=true"));
    }
    catch (erro)
    {
      setDsErro(erro instanceof Error ? erro.message : "Não foi possível carregar os funcionários.");
    }
    finally
    {
      setFlCarregando(false);
    }
  }, []);

  useCarregarAoMontar(carregarFuncionarios);

  function limparMensagens()
  {
    setDsErro("");
    setDsSucesso("");
  }

  function limparFormulario()
  {
    setFormulario(OBJ_FORMULARIO_INICIAL);
    setNrIdEditando(null);
    limparMensagens();
  }

  function iniciarEdicao(funcionario: Funcionario)
  {
    setNrIdEditando(funcionario.id_usuario);
    setFormulario({
      nm_pessoa: funcionario.pessoa.nm_pessoa,
      ds_apelido: funcionario.ds_apelido,
      ds_senha: "",
      perfil: funcionario.perfil,
      ds_email: funcionario.pessoa.ds_email ?? "",
      ds_telefone: funcionario.pessoa.ds_telefone ?? "",
      ds_cnpj_cpf: funcionario.pessoa.ds_cnpj_cpf ?? "",
    });
    limparMensagens();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function salvarFuncionario(evento: FormEvent<HTMLFormElement>)
  {
    evento.preventDefault();
    limparMensagens();

    const nmPessoa   = formulario.nm_pessoa.trim();
    const dsApelido  = formulario.ds_apelido.trim();
    const dsEmail    = formulario.ds_email.trim();
    const dsTelefone = formulario.ds_telefone.trim();
    const dsCpf      = somenteNumeros(formulario.ds_cnpj_cpf);
    const flEditando = nrIdEditando !== null;

    if (!nmPessoa)
    {
      setDsErro("Informe o nome do funcionário.");
      return;
    }

    if (dsApelido.length < 3)
    {
      setDsErro("O login precisa ter pelo menos 3 caracteres.");
      return;
    }

    if (!flEditando && formulario.ds_senha.length < 6)
    {
      setDsErro("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    if (flEditando && formulario.ds_senha && formulario.ds_senha.length < 6)
    {
      setDsErro("A nova senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    if (dsCpf && dsCpf.length !== 11 && dsCpf.length !== 14)
    {
      setDsErro("O CPF deve ter 11 dígitos (ou 14, se for CNPJ).");
      return;
    }

    setFlSalvando(true);

    try
    {
      if (flEditando)
      {
        // null limpa o campo opcional no cadastro
        await apiPatch(`usuarios/${nrIdEditando}`, {
          nm_pessoa: nmPessoa,
          ds_apelido: dsApelido,
          perfil: formulario.perfil,
          ds_email: dsEmail || null,
          ds_telefone: dsTelefone || null,
          ds_cnpj_cpf: dsCpf || null,
          ...(formulario.ds_senha ? { ds_senha: formulario.ds_senha } : {}),
        });
        setDsSucesso("Funcionário atualizado com sucesso!");
      }
      else
      {
        await apiPost("usuarios", {
          nm_pessoa: nmPessoa,
          ds_apelido: dsApelido,
          ds_senha: formulario.ds_senha,
          perfil: formulario.perfil,
          ...(dsEmail ? { ds_email: dsEmail } : {}),
          ...(dsTelefone ? { ds_telefone: dsTelefone } : {}),
          ...(dsCpf ? { ds_cnpj_cpf: dsCpf } : {}),
        });
        setDsSucesso("Funcionário cadastrado com sucesso!");
      }

      setFormulario(OBJ_FORMULARIO_INICIAL);
      setNrIdEditando(null);
      await carregarFuncionarios();
    }
    catch (erro)
    {
      setDsErro(erro instanceof Error ? erro.message : "Não foi possível salvar o funcionário.");
    }
    finally
    {
      setFlSalvando(false);
    }
  }

  async function alterarSituacao(funcionario: Funcionario, flAtivo: boolean)
  {
    const dsPergunta = flAtivo
      ? `Reativar o acesso de ${funcionario.pessoa.nm_pessoa}?`
      : `Inativar ${funcionario.pessoa.nm_pessoa}? A pessoa perde o acesso na hora, mas o histórico fica guardado.`;

    if (!window.confirm(dsPergunta))
      return;

    limparMensagens();

    try
    {
      await apiPatch(`usuarios/${funcionario.id_usuario}`, { id_ativo: flAtivo });

      if (nrIdEditando === funcionario.id_usuario)
        limparFormulario();

      setDsSucesso(flAtivo ? "Funcionário reativado." : "Funcionário inativado.");
      await carregarFuncionarios();
    }
    catch (erro)
    {
      setDsErro(erro instanceof Error ? erro.message : "Não foi possível alterar a situação.");
    }
  }

  const arrAtivos        = arrFuncionarios.filter((funcionario) => funcionario.id_ativo);
  const nrInativos       = arrFuncionarios.length - arrAtivos.length;
  const dsBuscaMinuscula = dsBusca.trim().toLowerCase();
  const arrFiltrados     = arrFuncionarios.filter((funcionario) => {
    if (!flMostrarInativos && !funcionario.id_ativo)
      return false;

    if (dsFiltroPerfil && funcionario.perfil !== dsFiltroPerfil)
      return false;

    return !dsBuscaMinuscula                                               ||
     funcionario.pessoa.nm_pessoa.toLowerCase().includes(dsBuscaMinuscula) ||
     funcionario.ds_apelido.toLowerCase().includes(dsBuscaMinuscula);
  });

  return (
    <div className={estilos.pagina}>
      <header>
        <p className="sobretitulo">Gerenciamento</p>
        <h1 className={estilos.titulo}>Funcionários</h1>
        <p className={estilos.descricao}>
          Cadastre quem trabalha no restaurante, troque senhas e inative quem saiu. O histórico de comandas fica guardado.
        </p>
      </header>

      <section className={estilos.estatisticas}>
        <div className={estilos.cartao}>
          <p className={estilos.estatisticaRotulo}>Funcionários ativos</p>
          <p className={estilos.estatisticaValor}>{arrAtivos.length}</p>
        </div>

        {ARR_PERFIS_FUNCIONARIO.map((dsPerfil) => (
          <div key={dsPerfil} className={estilos.cartao}>
            <p className={estilos.estatisticaRotulo}>{OBJ_NOMES_PERFIL[dsPerfil]}</p>
            <p className={estilos.estatisticaValor}>
              {arrAtivos.filter((funcionario) => funcionario.perfil === dsPerfil).length}
            </p>
          </div>
        ))}
      </section>

      {dsErro && (
        <div role="alert" className={`${estilos.alerta} ${estilos.alertaErro}`}>
          {dsErro}
        </div>
      )}

      {dsSucesso && (
        <div role="status" className={`${estilos.alerta} ${estilos.alertaSucesso}`}>
          {dsSucesso}
        </div>
      )}

      <section className={estilos.cartao}>
        <h2 className={estilos.tituloCartao}>{nrIdEditando !== null ? "Editar funcionário" : "Novo funcionário"}</h2>
        <p className={estilos.subtituloCartao}>
          {nrIdEditando !== null
            ? "Deixe a senha em branco para manter a atual."
            : "O funcionário entra no sistema com o login e a senha informados aqui."}
        </p>

        <form onSubmit={salvarFuncionario} className={estilos.formulario}>
          <div className={estilos.camposLinha}>
            <div>
              <label htmlFor="nm_pessoa" className={estilos.rotulo}>Nome completo *</label>
              <input
                id="nm_pessoa"
                type="text"
                value={formulario.nm_pessoa}
                onChange={(evento) => setFormulario({ ...formulario, nm_pessoa: evento.target.value })}
                maxLength={120}
                required
                className={estilos.entrada}
              />
            </div>

            <div>
              <label htmlFor="perfil" className={estilos.rotulo}>Função *</label>
              <select
                id="perfil"
                value={formulario.perfil}
                onChange={(evento) => setFormulario({ ...formulario, perfil: evento.target.value })}
                className={estilos.entrada}
              >
                {ARR_PERFIS_FUNCIONARIO.map((dsPerfil) => (
                  <option key={dsPerfil} value={dsPerfil}>{OBJ_NOMES_PERFIL[dsPerfil]}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={estilos.camposLinha}>
            <div>
              <label htmlFor="ds_apelido" className={estilos.rotulo}>Login *</label>
              <input
                id="ds_apelido"
                type="text"
                value={formulario.ds_apelido}
                onChange={(evento) => setFormulario({ ...formulario, ds_apelido: evento.target.value })}
                autoComplete="off"
                maxLength={40}
                required
                className={estilos.entrada}
              />
            </div>

            <div>
              <label htmlFor="ds_senha" className={estilos.rotulo}>
                {nrIdEditando !== null ? "Nova senha" : "Senha *"}
              </label>
              <input
                id="ds_senha"
                type="password"
                value={formulario.ds_senha}
                onChange={(evento) => setFormulario({ ...formulario, ds_senha: evento.target.value })}
                autoComplete="new-password"
                placeholder={nrIdEditando !== null ? "Deixe em branco para manter" : "Mínimo de 6 caracteres"}
                className={estilos.entrada}
              />
            </div>
          </div>

          <div className={estilos.camposLinha}>
            <div>
              <label htmlFor="ds_email" className={estilos.rotulo}>E-mail</label>
              <input
                id="ds_email"
                type="email"
                value={formulario.ds_email}
                onChange={(evento) => setFormulario({ ...formulario, ds_email: evento.target.value })}
                className={estilos.entrada}
              />
            </div>

            <div>
              <label htmlFor="ds_telefone" className={estilos.rotulo}>Telefone</label>
              <input
                id="ds_telefone"
                type="tel"
                value={formulario.ds_telefone}
                onChange={(evento) => setFormulario({ ...formulario, ds_telefone: evento.target.value })}
                className={estilos.entrada}
              />
            </div>
          </div>

          <div>
            <label htmlFor="ds_cnpj_cpf" className={estilos.rotulo}>CPF</label>
            <input
              id="ds_cnpj_cpf"
              type="text"
              inputMode="numeric"
              value={formulario.ds_cnpj_cpf}
              onChange={(evento) => setFormulario({ ...formulario, ds_cnpj_cpf: evento.target.value })}
              placeholder="Somente números"
              className={estilos.entrada}
            />
          </div>

          <div className={estilos.botoes}>
            <button type="submit" disabled={flSalvando} className={`${estilos.botao} ${estilos.botaoPrimario}`}>
              {flSalvando ? "Salvando..." : nrIdEditando !== null ? "Salvar alterações" : "Cadastrar funcionário"}
            </button>

            {nrIdEditando !== null && (
              <button type="button" onClick={limparFormulario} className={`${estilos.botao} ${estilos.botaoSecundario}`}>
                Cancelar edição
              </button>
            )}
          </div>
        </form>
      </section>

      <section className={estilos.cartaoTabela}>
        <div className={estilos.cabecalhoCartao}>
          <div>
            <h2 className={estilos.tituloCartao}>Equipe</h2>
            <p className={estilos.subtituloCartao}>
              {arrFiltrados.length} funcionário(s) na lista{nrInativos > 0 ? `, ${nrInativos} inativo(s) no total` : ""}.
            </p>
          </div>
        </div>

        <div className={estilos.corpoCartao}>
          <div className={estilos.filtros}>
            <div>
              <label htmlFor="busca" className={estilos.rotulo}>Buscar</label>
              <input
                id="busca"
                type="search"
                value={dsBusca}
                onChange={(evento) => setDsBusca(evento.target.value)}
                placeholder="Nome ou login..."
                className={estilos.entrada}
              />
            </div>

            <div>
              <label htmlFor="filtro_perfil" className={estilos.rotulo}>Função</label>
              <select
                id="filtro_perfil"
                value={dsFiltroPerfil}
                onChange={(evento) => setDsFiltroPerfil(evento.target.value)}
                className={estilos.entrada}
              >
                <option value="">Todas</option>
                {ARR_PERFIS_FUNCIONARIO.map((dsPerfil) => (
                  <option key={dsPerfil} value={dsPerfil}>{OBJ_NOMES_PERFIL[dsPerfil]}</option>
                ))}
              </select>
            </div>
          </div>

          <label htmlFor="mostrar_inativos" className={estilos.textoSuave}>
            <input
              id="mostrar_inativos"
              type="checkbox"
              checked={flMostrarInativos}
              onChange={(evento) => setFlMostrarInativos(evento.target.checked)}
            />{" "}
            Mostrar funcionários inativos
          </label>

          {flCarregando && arrFuncionarios.length === 0 ? (
            <p className={estilos.carregando}>Carregando funcionários...</p>
          ) : arrFiltrados.length === 0 ? (
            <div className={estilos.vazio}>
              <p className={estilos.vazioTitulo}>Nenhum funcionário encontrado.</p>
              <p className={estilos.vazioTexto}>Mude os filtros ou cadastre alguém no formulário acima.</p>
            </div>
          ) : (
            <div className={estilos.tabelaRolagem}>
              <table className={estilos.tabela}>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Login</th>
                    <th>Função</th>
                    <th>Contato</th>
                    <th>Situação</th>
                    <th className={estilos.alinharDireita}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {arrFiltrados.map((funcionario) => {
                    const flEhVoce = usuarioLogado?.id_usuario === funcionario.id_usuario;

                    return (
                      <tr key={funcionario.id_usuario}>
                        <td>
                          <strong>{funcionario.pessoa.nm_pessoa}</strong>
                          {flEhVoce && <span className={estilos.textoSuave}> (você)</span>}
                        </td>
                        <td className={estilos.textoSuave}>{funcionario.ds_apelido}</td>
                        <td>
                          <span className={`${estilos.seloEstado} ${OBJ_CLASSE_PERFIL[funcionario.perfil] ?? estilos.seloNeutro}`}>
                            {OBJ_NOMES_PERFIL[funcionario.perfil] ?? funcionario.perfil}
                          </span>
                        </td>
                        <td className={estilos.textoSuave}>
                          {[funcionario.pessoa.ds_telefone, funcionario.pessoa.ds_email].filter(Boolean).join(" · ") || "Sem contato"}
                        </td>
                        <td>
                          <span className={`${estilos.seloEstado} ${funcionario.id_ativo ? estilos.seloSucesso : estilos.seloCancelado}`}>
                            {funcionario.id_ativo ? "Ativo" : "Inativo"}
                          </span>
                        </td>
                        <td>
                          <div className={estilos.acoesLinha}>
                            <button
                              type="button"
                              onClick={() => iniciarEdicao(funcionario)}
                              className={`${estilos.botao} ${estilos.botaoSecundario} ${estilos.botaoPequeno}`}
                            >
                              Editar
                            </button>

                            {funcionario.id_ativo ? (
                              !flEhVoce && (
                                <button
                                  type="button"
                                  onClick={() => void alterarSituacao(funcionario, false)}
                                  className={`${estilos.botao} ${estilos.botaoPerigo} ${estilos.botaoPequeno}`}
                                >
                                  Inativar
                                </button>
                              )
                            ) : (
                              <button
                                type="button"
                                onClick={() => void alterarSituacao(funcionario, true)}
                                className={`${estilos.botao} ${estilos.botaoPrimario} ${estilos.botaoPequeno}`}
                              >
                                Reativar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
