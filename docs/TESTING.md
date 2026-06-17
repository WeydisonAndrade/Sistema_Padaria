# Guia de Testes — Tutti Pane

Este documento descreve a estratégia de QA do projeto seguindo a **pirâmide de testes** e as boas práticas de engenharia de qualidade.

## Pirâmide de testes

```
        ┌─────────────┐
        │    E2E      │  Poucos — fluxos críticos de ponta a ponta
        │  Playwright │
        ├─────────────┤
        │ Integração  │  Médio — regras de negócio + banco + APIs
        │   Vitest    │
        ├─────────────┤
        │  Unitários  │  Muitos — funções puras, rápidas, isoladas
        │   Vitest    │
        └─────────────┘
        ┌─────────────┐
        │ Componentes │  Carrinho, UI com interação do usuário
        │  Vitest+RTL │
        └─────────────┘
```

| Camada | Onde fica | O que testa | Velocidade |
|--------|-----------|-------------|------------|
| **Unitário** | `src/**/__tests__/*.test.ts` | `utils`, `auth` (JWT) | Muito rápido |
| **Componentes** | `src/**/__tests__/*.test.tsx` | `CartContext`, hooks React | Rápido |
| **Integração** | `tests/integration/*.test.ts` | `sales`, `orders`, rotas API | Médio |
| **E2E** | `tests/e2e/*.spec.ts` | Login admin, navegação cliente | Mais lento |

## Convenções e boas práticas

### Nomenclatura

- Arquivos: `*.test.ts` (unit/integration) ou `*.test.tsx` (componentes) ou `*.spec.ts` (E2E)
- Descreva comportamento: `it("rejeita estoque insuficiente")` em vez de `it("teste 1")`
- Use `describe` para agrupar por módulo ou fluxo

### Metadados nos arquivos

Cada arquivo de teste inicia com comentários `@layer` e `@module` para documentar a camada da pirâmide:

```ts
/**
 * @layer unit
 * @module utils
 */
```

### Princípios aplicados

1. **AAA** — Arrange (preparar), Act (executar), Assert (verificar)
2. **Um conceito por teste** — cada `it` valida um comportamento
3. **Testes independentes** — integração limpa o banco entre casos (`resetDatabase`)
4. **Banco isolado** — integração usa `prisma/test.db`, nunca `dev.db`
5. **Sem mocks desnecessários** — unitários testam funções puras; integração usa banco real
6. **E2E só no crítico** — login, home, cardápio (não duplicar tudo que unitários já cobrem)

## Como executar

```bash
# Todos os testes Vitest (unit + integration + components)
npm test

# Por camada
npm run test:unit
npm run test:integration
npm run test:components

# Modo watch durante desenvolvimento
npm run test:watch

# E2E (sobe build de produção automaticamente)
npm run test:e2e

# E2E com interface visual
npm run test:e2e:ui

# Pirâmide completa (sem E2E — E2E é separado por ser mais lento)
npm run test:all
```

### Pré-requisitos

- `npm install` (inclui `postinstall` → `prisma generate`)
- Para **integração**: schema aplicado automaticamente em `prisma/test.db`
- Para **E2E**: credenciais padrão do seed (`admin@padaria.com` / `admin123`)

## Mapa de cobertura atual

### Unitários (`src/lib/__tests__/`)

| Arquivo | Módulo | Cenários |
|---------|--------|----------|
| `utils.test.ts` | `formatPrice`, WhatsApp, status, datas | Formatação pt-BR, links, rótulos |
| `auth.test.ts` | JWT | Criar sessão, token válido/inválido |
| `dashboard.test.ts` | `getDashboardData` | Agregações, buckets mensais, ranking |

### Componentes (`src/contexts/__tests__/`)

| Arquivo | Módulo | Cenários |
|---------|--------|----------|
| `CartContext.test.tsx` | Carrinho | Adicionar, estoque, subtotal, remover |
| `ProductCard.test.tsx` | Card de produto | Renderização, carrinho, estoque, WhatsApp |

### Integração (`tests/integration/`)

| Arquivo | Módulo | Cenários |
|---------|--------|----------|
| `sales.test.ts` | Vendas balcão | Débito estoque, validações, produto inativo |
| `orders.test.ts` | Pedidos online | Criação, e-mail Pix, cancelamento restaura estoque |
| `api-products.test.ts` | `GET /api/products` | Lista, filtro ativo, categoria |
| `payments.test.ts` | Pagamento Pix | Mock Mercado Pago, aprovação, expiração, estoque |

### E2E (`tests/e2e/`)

| Arquivo | Fluxo | Cenários |
|---------|-------|----------|
| `customer.spec.ts` | Site público | Home, cardápio, contato |
| `admin.spec.ts` | Painel admin | Redirect login, credenciais inválidas/válidas |
| `checkout.spec.ts` | Checkout | Carrinho vazio, fluxo até confirmação Pix (mock) |

## Próximos testes sugeridos (roadmap QA)

Implementar **um a um**, sempre na camada mais baixa possível:

1. ~~`payments.test.ts` — integração com mock do Mercado Pago~~ ✅
2. ~~`dashboard.test.ts` — unitário das agregações em `lib/dashboard.ts`~~ ✅
3. ~~`ProductCard.test.tsx` — componente com botão adicionar ao carrinho~~ ✅
4. ~~`checkout.spec.ts` — E2E do fluxo carrinho → checkout (sem Pix real em CI)~~ ✅

### Roadmap futuro (sugestões)

- `lib/dashboard.ts` — testes de integração com vendas reais no banco
- `PixPaymentBox.test.tsx` — polling de pagamento
- `webhook-mercadopago.test.ts` — integração do webhook

## Estrutura de pastas

```
tests/
├── setup/           # Configuração Vitest por camada
│   ├── unit.ts
│   ├── integration.ts
│   └── components.ts
├── helpers/
│   └── db.ts        # Seed e reset do banco de teste
├── integration/     # Testes de integração
└── e2e/             # Playwright

src/
├── lib/__tests__/   # Unitários
└── contexts/__tests__/  # Componentes
```

## CI/CD (referência)

Pipeline recomendado:

```yaml
- npm run test:all
- npx playwright install --with-deps chromium
- npm run test:e2e
```

O E2E usa `npm run build && npm run start` para evitar instabilidade do hot reload em desenvolvimento.
