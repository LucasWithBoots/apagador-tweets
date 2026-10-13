// Monta o script de console a partir das escolhas do formulário.

export const limparUser = (texto) => texto.replace(/^@+/, "").replace(/[^A-Za-z0-9_]/g, "").slice(0, 15);

// Aceita IDs soltos ou links (x.com/user/status/123...), separados por espaço, vírgula ou linha.
export const extrairIds = (texto) => [
  ...new Set(
    texto
      .split(/[\s,;]+/)
      .map((parte) => parte.match(/status\/(\d+)/)?.[1] ?? parte.match(/^\d{5,}$/)?.[0])
      .filter(Boolean)
  ),
];

// "2026-09-25" → "2026-09-26". Feito em UTC para não sofrer com horário de verão.
export const diaSeguinte = (data) => {
  const d = new Date(`${data}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
};

export const formatarData = (data) => data.split("-").reverse().join("/");

export const linkPosts = (user) => `https://x.com/${user}`;
export const linkRespostas = (user) => `https://x.com/${user}/with_replies`;

export function gerarScript({ user, data, manter, pausa }) {
  const limite = diaSeguinte(data);

  return `// Apaga seus tweets de @${user} até ${formatarData(data)} (o dia inteiro entra).
// Gerado pelo Apagador de Tweets. Para parar a qualquer momento, digite no console:  PARAR = true
//
// Abra antes, logado como @${user}, a aba do perfil com o que quer apagar:
//   Só posts:            ${linkPosts(user)}
//   Posts e respostas:   ${linkRespostas(user)}

(async () => {
  // ===== CONFIGURAÇÕES =====
  const MEU_USER = ${JSON.stringify(user)};
  // Apaga tudo ANTES de ${formatarData(limite)} 00:00 no fuso do seu computador.
  const LIMITE = new Date(${JSON.stringify(`${limite}T00:00:00`)});
  const MANTER = ${JSON.stringify(manter)}; // IDs que nunca serão apagados
  const PAUSA = ${pausa}; // ms entre exclusões
  // ==========================

  const dormir = (ms) => new Promise((r) => setTimeout(r, ms + Math.random() * 500));
  const esperar = async (achar, tempo = 5000) => {
    const fim = Date.now() + tempo;
    while (Date.now() < fim) {
      const el = achar();
      if (el) return el;
      await dormir(100);
    }
    return null;
  };
  const fecharMenu = async () => {
    for (const alvo of [document.activeElement, document.body, document]) {
      alvo?.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", code: "Escape", keyCode: 27, bubbles: true }));
    }
    await esperar(() => !document.querySelector('[role="menu"]'), 2000);
  };

  // O autor do tweet é o primeiro bloco "User-Name" do artigo (o segundo seria de um tweet citado).
  const ehMeu = (artigo) => {
    const bloco = artigo.querySelector('[data-testid="User-Name"]');
    return [...(bloco?.querySelectorAll("a[href]") ?? [])]
      .some((a) => a.getAttribute("href").toLowerCase() === \`/\${MEU_USER.toLowerCase()}\`);
  };

  window.PARAR = false;
  const vistos = new Set();
  let apagados = 0, pulados = 0, rolagensVazias = 0;

  console.log("▶️ Começando. Para parar: PARAR = true");

  while (!window.PARAR) {
    let apagouNestaVolta = false;

    for (const artigo of document.querySelectorAll('article[data-testid="tweet"]')) {
      if (window.PARAR) break;

      const hora = artigo.querySelector("time");
      const id = hora?.closest("a")?.href.match(/status\\/(\\d+)/)?.[1];
      if (!id || vistos.has(id)) continue;
      vistos.add(id);

      if (!ehMeu(artigo)) { pulados++; continue; }            // tweet de outra pessoa ou retweet
      if (MANTER.includes(id)) { console.log(\`📌 Mantido \${id}\`); continue; }
      if (new Date(hora.dateTime) >= LIMITE) continue;        // mais novo que o limite

      artigo.scrollIntoView({ block: "center" });
      await dormir(300);
      const botao = artigo.querySelector('[data-testid="caret"]');
      if (!botao) continue;
      botao.click();

      const excluir = await esperar(() =>
        [...document.querySelectorAll('[role="menu"] [role="menuitem"]')]
          .find((item) => /^(excluir|delete)/i.test(item.innerText.trim()))
      );
      if (!excluir) { await fecharMenu(); continue; }

      excluir.click();
      const confirmar = await esperar(() => document.querySelector('[data-testid="confirmationSheetConfirm"]'));
      if (!confirmar) { await fecharMenu(); continue; }
      confirmar.click();

      apagados++;
      apagouNestaVolta = true;
      console.log(\`🗑️ \${apagados} — \${id} (\${new Date(hora.dateTime).toLocaleString("pt-BR")})\`);
      await dormir(PAUSA);
    }

    if (apagouNestaVolta) {
      rolagensVazias = 0;
    } else {
      window.scrollBy(0, 1500); // carrega mais tweets
      await dormir(2500);
      if (++rolagensVazias > 15) break; // nada novo aparece: acabou
    }
  }

  console.log(\`✅ Fim: \${apagados} apagados, \${pulados} tweets de outras pessoas ignorados.\`);
})();
`;
}
