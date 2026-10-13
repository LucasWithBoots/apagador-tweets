import { useMemo, useState } from "react";
import { extrairIds, formatarData, gerarScript, limparUser, linkPosts, linkRespostas } from "./gerarScript";
import "./App.css";

const PAUSAS = [
  { valor: 1000, rotulo: "Rápida (1s)" },
  { valor: 1500, rotulo: "Normal (1,5s)" },
  { valor: 3000, rotulo: "Cautelosa (3s)" },
];

export default function App() {
  const [user, setUser] = useState("");
  const [data, setData] = useState("");
  const [manterTexto, setManterTexto] = useState("");
  const [pausa, setPausa] = useState(1500);
  const [copiado, setCopiado] = useState(false);

  const manter = useMemo(() => extrairIds(manterTexto), [manterTexto]);
  const pronto = user.length > 0 && data.length > 0;
  const script = pronto ? gerarScript({ user, data, manter, pausa }) : "";

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(script);
    } catch {
      // Sem permissão de clipboard (ex.: http): cai no método antigo.
      const area = document.getElementById("script");
      area.select();
      document.execCommand("copy");
    }
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div className="pagina">
      <header className="topo">
        <h1>Apagador de Tweets</h1>
        <p>
          Monte um script para apagar seus posts ou respostas de uma data para trás. Ele roda no
          próprio navegador, clicando em "⋯ → Excluir" por você. Sem API, sem senha, sem baixar nada.
        </p>
      </header>

      <main className="grade">
        <section className="cartao">
          <h2>1. Configure</h2>

          <label className="campo">
            <span>Seu @ no X/Twitter</span>
            <div className="arroba">
              <span>@</span>
              <input
                value={user}
                onChange={(e) => setUser(limparUser(e.target.value))}
                placeholder="seuusuario"
                autoComplete="off"
                spellCheck="false"
              />
            </div>
          </label>

          <label className="campo">
            <span>Apagar tudo até o dia (inclusive)</span>
            <input type="date" value={data} onChange={(e) => setData(e.target.value)} />
            {data && <small>Tudo de {formatarData(data)} para trás será apagado. Os mais novos ficam.</small>}
          </label>

          <details className="avancado">
            <summary>Opções avançadas</summary>

            <label className="campo">
              <span>Tweets para manter (opcional)</span>
              <textarea
                rows={3}
                value={manterTexto}
                onChange={(e) => setManterTexto(e.target.value)}
                placeholder={"Cole links ou IDs, um por linha\nx.com/seuusuario/status/1234567890"}
              />
              {manter.length > 0 && (
                <small>
                  {manter.length} {manter.length === 1 ? "tweet será mantido" : "tweets serão mantidos"}
                </small>
              )}
            </label>

            <label className="campo">
              <span>Velocidade</span>
              <select value={pausa} onChange={(e) => setPausa(Number(e.target.value))}>
                {PAUSAS.map((p) => (
                  <option key={p.valor} value={p.valor}>{p.rotulo}</option>
                ))}
              </select>
              <small>Ir rápido demais aumenta a chance de bloqueio temporário pelo X.</small>
            </label>
          </details>
        </section>

        <section className="cartao">
          <div className="cabecalho-script">
            <h2>2. Copie o script</h2>
            <button className="copiar" onClick={copiar} disabled={!pronto}>
              {copiado ? "Copiado ✓" : "Copiar script"}
            </button>
          </div>
          {pronto ? (
            <textarea id="script" className="script" value={script} readOnly spellCheck="false" />
          ) : (
            <div className="script vazio">Preencha seu @ e a data para gerar o script.</div>
          )}
        </section>

        <section className="cartao passos">
          <h2>3. Passo a passo</h2>
          <ol>
            <li>
              <strong>Entre no x.com</strong> pelo computador, logado na conta{" "}
              {user ? <code>@{user}</code> : "que você quer limpar"}.
            </li>
            <li>
              <strong>Abra a página com os tweets</strong>
              : a aba do seu perfil decide o que será apagado.
              <ul>
                <li>
                  Para apagar <strong>só posts</strong>, use a aba{" "}
                  {user ? (
                    <a href={linkPosts(user)} target="_blank" rel="noreferrer">Posts</a>
                  ) : (
                    <em>Posts</em>
                  )}
                  . Retweets que aparecem ali são ignorados.
                </li>
                <li>
                  Para apagar <strong>posts e respostas</strong>, use a aba{" "}
                  {user ? (
                    <a href={linkRespostas(user)} target="_blank" rel="noreferrer">Respostas</a>
                  ) : (
                    <em>Respostas</em>
                  )}
                  . Os tweets de outras pessoas que você respondeu aparecem ali, mas são ignorados.
                </li>
              </ul>
            </li>
            <li>
              <strong>Role até a data</strong>: desça a página até aparecerem os tweets de{" "}
              {data ? formatarData(data) : "a data escolhida"} e pare ali. O script começa pelos tweets que estão
              na tela, então assim ele já sai apagando, sem perder tempo rolando pelos mais novos.
              <div className="dica">
                💡 Vale a pena principalmente se você tiver muitos tweets depois da data: o script desiste depois
                de umas 15 rolagens seguidas sem achar nada para apagar, e pode parar antes de chegar lá.
              </div>
            </li>
            <li>
              <strong>Abra o console</strong>: aperte <kbd>F12</kbd> (no Mac, <kbd>⌘</kbd>+<kbd>⌥</kbd>+<kbd>J</kbd>)
              e clique na aba <em>Console</em>.
            </li>
            <li>
              <strong>Cole o script</strong> e aperte <kbd>Enter</kbd>. Se o Chrome avisar sobre colar
              código, digite <code>allow pasting</code>, aperte <kbd>Enter</kbd> e cole de novo.
            </li>
            <li>
              <strong>Deixe a aba aberta</strong> e acompanhe pelo console. Cada tweet apagado aparece com 🗑️.
              Quando acabar, aparece ✅.
            </li>
            <li>
              <strong>Para parar</strong> a qualquer momento, digite <code>PARAR = true</code> no console e aperte{" "}
              <kbd>Enter</kbd>.
            </li>
          </ol>

          <div className="aviso">
            <strong>Atenção:</strong> tweet apagado não volta. Se quiser guardar uma cópia, baixe seu arquivo em{" "}
            <em>Configurações → Sua conta → Baixar um arquivo dos seus dados</em> antes de começar. Se o X
            limitar as ações, pare, espere um tempo e rode de novo: o script continua de onde parou.
          </div>
        </section>
      </main>
    </div>
  );
}
