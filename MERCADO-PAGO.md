# Mercado Pago

Este projeto usa o Checkout Pro do Mercado Pago. O site envia o carrinho para um endpoint seguro, e esse endpoint cria uma preferencia de pagamento na conta dona do `MP_ACCESS_TOKEN`.

## Como configurar

1. Entre em https://www.mercadopago.com.br/developers/panel com a sua conta Mercado Pago.
2. Crie ou abra uma aplicacao.
3. Copie o `Access Token` de producao.
4. Hospede a pasta do projeto em um servico com funcoes Node.js, como Vercel.
5. Configure estas variaveis de ambiente no servidor:

```env
MP_ACCESS_TOKEN=APP_USR_SEU_ACCESS_TOKEN_DE_PRODUCAO
ALLOWED_ORIGIN=https://isadora-pinheiro-art.vercel.app
SITE_BASE_URL=https://isadora-pinheiro-art.vercel.app
```

6. Depois da publicacao, copie o endpoint gerado, por exemplo:

```text
https://seu-projeto.vercel.app/api/checkout
```

7. Depois de publicar o backend, coloque esse endereco em `outputs/config.js`:

```js
window.ATELIER_CONFIG = {
  checkoutEndpoint: "/api/checkout",
};
```

Como a Vercel hospeda o site e a API no mesmo projeto, `/api/checkout` e o caminho recomendado. O campo `Endpoint de checkout` do painel admin tambem funciona, mas ele salva somente no navegador usado pelo administrador. Para todos os clientes comprarem pelo site publicado, use `outputs/config.js`.

## Observacao importante

Nao coloque o `Access Token` dentro do `outputs/app.js`, do HTML ou do painel admin. Esse token da acesso a sua conta Mercado Pago e deve existir apenas no servidor.

No modelo atual, os produtos e precos ficam no navegador via `localStorage`. Para uma loja em producao mais segura, o ideal e mover produtos, estoque e precos para um backend ou banco de dados, para impedir alteracao de preco pelo navegador do cliente.

## Nome publico no GitHub Pages

Para tirar `romulocearamor77-ops` do endereco, nao basta renomear o repositorio. Esse trecho vem do nome da conta do GitHub.

Para o endereco ficar assim:

```text
https://isadorapinheiropinturasoriginais.github.io
```

use uma destas opcoes:

1. Renomear a conta/organizacao do GitHub para `IsadoraPinheiroPinturasOriginais` e publicar o site em um repositorio chamado `isadorapinheiropinturasoriginais.github.io`.
2. Criar uma nova conta/organizacao do GitHub chamada `IsadoraPinheiroPinturasOriginais` e transferir o site para ela.
3. Usar um dominio proprio, como `isadorapinheiropinturasoriginais.com.br`, apontando para o GitHub Pages.
