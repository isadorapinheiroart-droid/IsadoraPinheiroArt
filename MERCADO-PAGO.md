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
ADMIN_USER=admin
ADMIN_PASSWORD=CRIE_UMA_SENHA_FORTE
SESSION_SECRET=CRIE_UMA_CHAVE_LONGA_E_ALEATORIA
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

Os precos usados no checkout sao consultados no banco, e nao sao aceitos diretamente do navegador do cliente.

## Banco de dados

O projeto usa PostgreSQL via `DATABASE_URL`. Na Vercel, crie um banco pelo menu Storage/Marketplace e conecte ao projeto para que a variavel `DATABASE_URL` seja injetada automaticamente.

Depois do banco conectado, o painel admin salva em `/api/state`:

```text
products
hero-settings
site-settings
```

Quando `DATABASE_URL` existe, o checkout tambem consulta o banco antes de enviar o cliente ao Mercado Pago, usando o preco salvo no servidor.

## Pedidos e confirmacao de pagamento

Antes de abrir o Mercado Pago, o checkout salva nome, endereco, numero, CEP, referencia, itens e total na tabela `atelier_orders`. Cada pedido recebe um codigo proprio e esse codigo e enviado ao Mercado Pago como `external_reference`.

A preferencia informa automaticamente esta URL de notificacao:

```text
https://isadora-pinheiro-art.vercel.app/api/mercado-pago-webhook
```

Quando o Mercado Pago envia uma notificacao, o servidor consulta o pagamento usando `MP_ACCESS_TOKEN`, confere o pedido e o valor e atualiza o status no painel. O estoque e reduzido uma unica vez quando o pagamento fica aprovado.

Os dados de entrega sao privados. A API de pedidos exige o login de servidor configurado por `ADMIN_USER`, `ADMIN_PASSWORD` e `SESSION_SECRET`.

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
