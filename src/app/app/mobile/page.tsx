import { Card, PageHeader } from "@/components/ui";

export default function MobilePage() {
  return (
    <div>
      <PageHeader title="Mobile" description="Acesso mobile e PWA (modules/mobile)." />
      <Card title="Estratégia">
        <p className="text-sm text-slate-600">
          O produto principal é web responsivo. Este módulo documenta o roadmap de app/PWA para
          agenda do dentista, confirmação de consultas e visualização rápida de prontuário.
        </p>
      </Card>
    </div>
  );
}
