# PRD Master — SaaS Odontológico Enterprise

Sistema de gestão para clínicas odontológicas (multi-módulo).

## Implementação local

Aplicação em Next.js rodando em `http://localhost:3001`.

**Login demo:** `admin@odonto.local` / `admin123`

## Módulos

| Arquivo | Status local |
|---|---|
| auth | Login JWT |
| permissions | Papéis e lista de usuários |
| dashboard | KPIs e atalhos |
| patients | CRUD persistido (Prisma) + perfil |
| patient-profile | Ficha completa (persistência do paciente) |
| schedule / appointments | Agenda com CRUD Prisma |
| medical-records | Prontuário |
| odontogram | Mapa dentário |
| anamnesis | Questionário de saúde |
| budgets | Orçamentos globais + paciente (Prisma) |
| accounts-receivable | Contas a receber (criar + quitar) |
| accounts-payable | Contas a pagar |
| cashflow | Fluxo de caixa |
| commissions | Comissões |
| payment-splits | Rateios (estrutura) |
| inventory | Estoque |
| prescriptions | Receitas médicas + Memed |
| documents | Documentos clínicos |
| reports / analytics | Indicadores |
| automations / mobile | Roadmap |
| settings | Edição Clínica + ClinicSetting |
| architecture / database / design-system | Stack Next + Prisma + Tailwind |
