# Tutti Pane - Sistema de Padaria

Sistema web completo para padaria com duas interfaces: **clientes** e **administrador**.

## Funcionalidades

### Interface do Cliente

- Página inicial com destaques e informações da padaria
- Catálogo de produtos com filtros por categoria
- Carrinho de compras e checkout com pagamento Pix (Mercado Pago)
- QR Code Pix na confirmação do pedido
- Cards com imagem, preço, código e estoque
- Pedidos via WhatsApp com mensagem pré-preenchida
- Mapa interativo com localização da padaria (OpenStreetMap)
- Botão flutuante de WhatsApp

### Interface do Administrador

- Login seguro com JWT
- Dashboard com gráficos de faturamento mensal e produto mais vendido
- Cadastro de produtos (CRUD completo)
- Registro de vendas com baixa automática de estoque
- Configurações da padaria (nome, endereço, WhatsApp, coordenadas do mapa)

### Campos do Produto

| Campo | Obrigatório | Descrição |
| --- | --- | --- |
| Código | Sim | Identificador único (ex: PAO001) |
| Nome | Sim | Nome do produto |
| Categoria | Sim | Pães, Bolos, Doces, etc. |
| Preço de venda | Sim | Valor em R$ |
| Quantidade em estoque | Sim | Unidades disponíveis |
| Data de validade | Não | Campo opcional |
| Status | Sim | Ativo ou Inativo |
| URL da imagem | Não | Foto exibida no cardápio |

## Tecnologias

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Prisma + SQLite
- Mercado Pago (pagamentos Pix)
- Recharts (gráficos do dashboard)
- Leaflet (mapas)
- JWT (autenticação)

## Como Executar

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar banco de dados

Copie o arquivo de exemplo e ajuste se necessário:

```bash
cp .env.example .env
```

No Windows (PowerShell):

```powershell
Copy-Item .env.example .env
```

Depois execute:

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

### 3. Iniciar o servidor

```bash
npm run dev
```

Acesse: http://localhost:3000

## Credenciais do Admin

| Campo | Valor |
| --- | --- |
| E-mail | admin@padaria.com |
| Senha | admin123 |

Altere as credenciais no arquivo `.env` antes de usar em produção.

## Estrutura de Rotas

| Rota | Descrição |
| --- | --- |
| `/` | Página inicial (cliente) |
| `/produtos` | Catálogo de produtos |
| `/carrinho` | Carrinho de compras |
| `/checkout` | Finalização do pedido com Pix |
| `/pedidos` | Consulta de pedidos pelo telefone |
| `/contato` | Mapa e WhatsApp |
| `/admin/login` | Login do administrador |
| `/admin/dashboard` | Painel com gráficos e estatísticas |
| `/admin/produtos` | Cadastro de produtos |
| `/admin/vendas` | Registrar venda e baixar estoque |
| `/admin/pedidos` | Pedidos online e status de pagamento Pix |
| `/admin/configuracoes` | Configurações da padaria |

## Vendas e Estoque

Ao registrar uma venda em **Admin > Registrar Venda**, o sistema:

1. Valida se o produto está ativo
2. Verifica se há estoque suficiente
3. Cria o registro de venda
4. Reduz automaticamente a quantidade em estoque

## Pagamento Pix (Mercado Pago)

O checkout gera uma cobrança Pix via Mercado Pago. O cliente vê o QR Code na página de confirmação; ao pagar, o pedido é confirmado automaticamente.

### Configuração

1. Crie uma aplicação em [Mercado Pago Developers](https://www.mercadopago.com.br/developers/panel/app).
2. Copie o **Access Token** (use credenciais de teste para desenvolvimento).
3. Adicione ao `.env`:

```env
MERCADOPAGO_ACCESS_TOKEN="TEST-seu-token-aqui"
```

4. Para receber confirmações em produção, configure o webhook no painel do Mercado Pago:

```
https://seu-dominio.com/api/webhooks/mercadopago
```

Eventos: `payment` (criação e atualização).

### Fluxo

1. Cliente finaliza o checkout com nome, telefone e e-mail.
2. O sistema cria o pedido, reserva o estoque e gera o Pix (validade: 30 minutos).
3. Cliente paga escaneando o QR Code ou usando copia e cola.
4. Mercado Pago notifica o webhook; o pedido passa para **Confirmado** / **Pago**.
5. Se o Pix expirar, o pedido é cancelado e o estoque é restaurado.

## WhatsApp

A integração usa links `wa.me` com mensagens pré-preenchidas.

Configure o número em **Admin > Configurações** no formato: código do país + DDD + número (ex: `5511999999999`).

## Mapa

O mapa usa OpenStreetMap via Leaflet. Configure latitude e longitude em **Admin > Configurações**.

## Scripts Disponíveis

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera build de produção |
| `npm run start` | Inicia servidor de produção |
| `npm run db:generate` | Gera o client do Prisma |
| `npm run db:push` | Sincroniza schema com o banco |
| `npm run db:seed` | Popula dados iniciais |
