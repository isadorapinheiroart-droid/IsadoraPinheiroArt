# Isadora Pinheiro Art

Site estatico de vendas de pinturas originais com painel administrativo local e endpoint seguro para Checkout Pro do Mercado Pago.

## Publicacao na Vercel

1. Importe este repositorio na Vercel.
2. Configure a variavel de ambiente `MP_ACCESS_TOKEN` com o Access Token de producao do Mercado Pago.
3. Configure `SITE_BASE_URL` com o dominio final da Vercel.
4. Configure `ALLOWED_ORIGIN` com o mesmo dominio final da Vercel.
5. Publique o projeto.

O site usa `/api/checkout` para criar a preferencia de pagamento no Mercado Pago.
