# Odonto Enterprise — SaaS Odontológico

Sistema local baseado no PRD em `docs/prd/modules` (SaaS Odontológico Enterprise).

## Stack

- Next.js 15 + React 19 + TypeScript
- Tailwind CSS
- Prisma + SQLite (local)
- Auth JWT em cookie httpOnly

## Módulos (PRD)

| Módulo PRD | Rota |
|---|---|
| dashboard | `/app` |
| patients / patient-profile | `/app/pacientes` |
| schedule / appointments | `/app/agenda` |
| medical-records | `/app/prontuarios` |
| odontogram | `/app/odontograma` |
| anamnesis | `/app/anamnese` |
| budgets | `/app/orcamentos` |
| accounts-receivable | `/app/receitas` |
| accounts-payable | `/app/despesas` |
| cashflow | `/app/fluxo-caixa` |
| commissions | `/app/comissoes` |
| payment-splits | `/app/rateios` |
| inventory | `/app/estoque` |
| prescriptions | `/app/receitas-medicas` |
| documents | `/app/documentos` |
| reports | `/app/relatorios` |
| analytics | `/app/analytics` |
| automations | `/app/automacoes` |
| mobile | `/app/mobile` |
| permissions / auth | `/app/permissoes` + `/login` |
| settings | `/app/configuracoes` |

## Como rodar (local)

```bash
cd C:\Users\meuco\Downloads\prd_full_odonto
npm install
npm run db:setup
npm run dev
```

Abra: [http://localhost:3001](http://localhost:3001)

### Login demo

- **E-mail:** `admin@odonto.local`
- **Senha:** `admin123`

## Observação sobre o PRD

Os arquivos em `docs/prd/modules/*.md` vieram apenas com títulos. O sistema foi implementado a partir desses módulos e de práticas padrão de clínica odontológica (pacientes, agenda, prontuário, odontograma, financeiro e estoque).
