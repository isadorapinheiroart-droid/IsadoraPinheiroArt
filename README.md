# Isadora Pinheiro Art

Site estatico de vendas de pinturas originais com painel administrativo local e endpoint seguro para Checkout Pro do Mercado Pago.

## Publicacao na Vercel

1. Importe este repositorio na Vercel.
2. Configure a variavel de ambiente `MP_ACCESS_TOKEN` com o Access Token de producao do Mercado Pago.
3. Crie um banco PostgreSQL pelo Storage/Marketplace da Vercel, usando Neon, Supabase ou outro provedor Postgres.
4. Conecte o banco ao projeto para a Vercel criar `DATABASE_URL`.
5. Configure `SITE_BASE_URL` com `https://isadora-pinheiro-art.vercel.app`.
6. Configure `ALLOWED_ORIGIN` com `https://isadora-pinheiro-art.vercel.app`.
7. Publique ou faca redeploy do projeto.

O site usa `/api/checkout` para criar a preferencia de pagamento no Mercado Pago.

O painel administrativo usa `/api/state` para salvar obras, imagem inicial e ajustes do site no banco.
