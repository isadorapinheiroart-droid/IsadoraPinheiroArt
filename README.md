# Isadora Pinheiro Art

Site de vendas de pinturas originais com painel administrativo, pedidos persistentes e Checkout Pro do Mercado Pago.

## Publicacao na Vercel

1. Importe este repositorio na Vercel.
2. Configure a variavel de ambiente `MP_ACCESS_TOKEN` com o Access Token de producao do Mercado Pago.
3. Crie um banco PostgreSQL pelo Storage/Marketplace da Vercel, usando Neon, Supabase ou outro provedor Postgres.
4. Conecte o banco ao projeto para a Vercel criar `DATABASE_URL`.
5. Configure `SITE_BASE_URL` com `https://isadora-pinheiro-art.vercel.app`.
6. Configure `ALLOWED_ORIGIN` com `https://isadora-pinheiro-art.vercel.app`.
7. Configure `ADMIN_USER` (por exemplo, `admin`) e `ADMIN_PASSWORD` com uma senha forte para proteger o painel.
8. Configure `SESSION_SECRET` com uma chave longa e aleatoria.
9. Publique ou faca redeploy do projeto.

O site usa `/api/checkout` para criar a preferencia de pagamento no Mercado Pago.

O painel administrativo usa `/api/state` para salvar obras e ajustes do site. Os pedidos e dados de entrega ficam na tabela `atelier_orders` e so podem ser consultados por uma sessao autenticada do painel.

O endpoint `/api/mercado-pago-webhook` recebe as notificacoes do Mercado Pago e consulta o pagamento diretamente na API antes de marcar um pedido como pago.
