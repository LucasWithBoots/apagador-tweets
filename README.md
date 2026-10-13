# Apagador de Tweets

Monta um script para apagar seus tweets do X/Twitter de uma data para trás. O script roda no console do próprio navegador e clica em "⋯ → Excluir → Confirmar" por você. Não usa a API do X, não pede senha e não precisa instalar nada.

**Acesse:** https://lucaswithboots.github.io/apagador-tweets/

## Como usar

1. No site, preencha o seu @ e a data. Tudo daquele dia para trás será apagado, incluindo o próprio dia.
2. Copie o script gerado.
3. No x.com, pelo computador e logado na sua conta, abra a aba do seu perfil com o que você quer apagar:
   - **Posts** (`x.com/seuuser`): apaga só os posts.
   - **Respostas** (`x.com/seuuser/with_replies`): apaga posts e respostas.
4. Role a página até a data escolhida. Assim o script já começa apagando.
5. Abra o console (`F12`, ou `⌘ + ⌥ + J` no Mac), cole o script e aperte `Enter`. Se o Chrome bloquear a colagem, digite `allow pasting` antes.
6. Deixe a aba aberta. Para parar a qualquer momento, digite `PARAR = true` no console.

O passo a passo completo, com os links já montados para a sua conta, está no próprio site.

## O que o script faz

- Apaga só tweets seus, anteriores à data escolhida. Retweets e tweets de outras pessoas que aparecem na página são ignorados.
- Pula os tweets que você marcar para manter, como o fixado. Basta colar o link ou o ID nas opções avançadas.
- Espera um pouco entre uma exclusão e outra, para diminuir a chance de o X limitar sua conta. Dá para ajustar a velocidade.
- Rola a página sozinho para carregar mais tweets e para quando não encontra mais nada para apagar.

## Cuidados

- **Apagar não tem volta.** Se quiser guardar uma cópia, baixe seus dados antes em *Configurações → Sua conta → Baixar um arquivo dos seus dados*.
- O script depende do HTML do X. Se o site mudar, ele pode parar de funcionar.
- Se o X começar a limitar as ações, pare, espere um pouco e rode de novo. O script continua de onde parou.
- Só cole no console código que você entende ou que vem de uma fonte em que confia. Este script é aberto e está todo em [`src/gerarScript.js`](src/gerarScript.js).

## Rodando localmente

Precisa de Node 20 ou mais novo.

```bash
npm install
npm run dev
```

O site é feito em React com Vite. A página fica em [`src/App.jsx`](src/App.jsx), e o script gerado sai de [`src/gerarScript.js`](src/gerarScript.js).
