import { Card, PageHeader } from "@/components/ui";

export default function RateiosPage() {
  return (
    <div>
      <PageHeader
        title="Rateios de pagamento"
        description="Divisão de valores entre profissionais e clínica (modules/payment-splits)."
      />
      <Card title="Regras de rateio">
        <p className="text-sm text-slate-600">
          Estrutura pronta para configurar percentuais por procedimento, convênio e profissional.
          No seed local, as comissões representam o rateio básico (ex.: 30% ao dentista).
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600">
          <li>Rateio clínica × profissional</li>
          <li>Rateio por forma de pagamento (PIX, cartão, boleto)</li>
          <li>Repasse automático ao fechar o caixa</li>
        </ul>
      </Card>
    </div>
  );
}
