import { Badge, Card, EmptyState, PageHeader, StatCard } from "@/components/ui";
import { money, formatDate, formatDateTime } from "@/lib/utils";

export function ModulePlaceholder({
  title,
  moduleId,
  description,
  stats,
  rows,
  columns,
}: {
  title: string;
  moduleId: string;
  description: string;
  stats?: { label: string; value: string }[];
  columns: string[];
  rows: (string | React.ReactNode)[][];
}) {
  return (
    <div>
      <PageHeader title={title} description={`${description} (modules/${moduleId}).`} />
      {stats && stats.length > 0 ? (
        <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <StatCard key={s.label} label={s.label} value={s.value} />
          ))}
        </div>
      ) : null}
      <Card title="Registros">
        {rows.length === 0 ? (
          <EmptyState message="Nenhum registro neste módulo." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase text-slate-500">
                  {columns.map((c) => (
                    <th key={c} className="px-2 py-2">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className="border-b border-slate-50">
                    {row.map((cell, j) => (
                      <td key={j} className="px-2 py-2 text-slate-700">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

export { money, formatDate, formatDateTime, Badge };
