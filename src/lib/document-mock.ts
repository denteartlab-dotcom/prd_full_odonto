import {
  categoryToFolder,
  type DocumentCategory,
  type DocumentFileType,
  type DocumentFolder,
  type DocumentStatus,
  type DocumentVisibility,
  type PatientDocument,
} from "./document-types";

export type DocumentFilterState = {
  search: string;
  category: DocumentCategory | "todos";
  fileType: DocumentFileType | "todos";
  period: "todos" | "30d" | "90d" | "365d";
  folder: DocumentFolder | "todos";
};

export const DEFAULT_DOCUMENT_FILTERS: DocumentFilterState = {
  search: "",
  category: "todos",
  fileType: "todos",
  period: "todos",
  folder: "todos",
};

export type PendingUpload = {
  id: string;
  file: File;
  progress: number;
};

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function detectFileType(filename: string, mimeType?: string): DocumentFileType {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf" || mimeType === "application/pdf") return "pdf";
  if (["doc", "docx"].includes(ext)) return "word";
  if (["xls", "xlsx"].includes(ext)) return "excel";
  if (["jpg", "jpeg", "png", "webp"].includes(ext) || mimeType?.startsWith("image/"))
    return "image";
  if (["zip", "rar"].includes(ext)) return "zip";
  if (ext === "txt") return "txt";
  if (ext === "csv") return "csv";
  return "other";
}

export function isAcceptedFile(file: File): boolean {
  if (file.size > 20 * 1024 * 1024) return false;
  const ext = "." + (file.name.split(".").pop()?.toLowerCase() ?? "");
  const accepted = [
    ".pdf",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".zip",
    ".rar",
    ".txt",
    ".csv",
  ];
  return accepted.includes(ext);
}

export function migrateLegacyDocument(
  doc: {
    id: string;
    name: string;
    category: string;
    uploadedAt: string;
    description?: string;
    fileType?: DocumentFileType;
    sizeBytes?: number;
    uploadedBy?: string;
    status?: DocumentStatus;
    visibility?: DocumentVisibility;
    tags?: string[];
    folder?: DocumentFolder;
    documentDate?: string;
    previewUrl?: string;
    mimeType?: string;
  },
  index: number
): PatientDocument {
  const category = (["pessoal", "exame", "radiografia", "contrato", "receita", "orcamento", "comprovante", "outros"].includes(
    doc.category
  )
    ? doc.category
    : "outros") as DocumentCategory;

  const fileType = doc.fileType ?? detectFileType(doc.name);

  return {
    id: doc.id,
    name: doc.name,
    description: doc.description ?? `Documento ${doc.name}`,
    category,
    fileType,
    mimeType: doc.mimeType,
    sizeBytes: doc.sizeBytes ?? 120_000 + index * 45_000,
    uploadedAt: doc.uploadedAt,
    documentDate: doc.documentDate ?? doc.uploadedAt,
    uploadedBy: doc.uploadedBy ?? "Recepção",
    status: doc.status ?? "processado",
    visibility: doc.visibility ?? "interno",
    tags: doc.tags ?? [],
    folder: doc.folder ?? categoryToFolder(category),
    previewUrl:
      doc.previewUrl ??
      (fileType === "image"
        ? "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&q=80"
        : undefined),
  };
}

export function createDefaultDocuments(seed: number): PatientDocument[] {
  const base: {
    id: string;
    name: string;
    description: string;
    category: DocumentCategory;
    fileType: DocumentFileType;
    sizeBytes: number;
    uploadedAt: string;
    documentDate?: string;
    uploadedBy: string;
    status: DocumentStatus;
    visibility: DocumentVisibility;
    tags?: string[];
    previewUrl?: string;
  }[] = [
    {
      id: `doc-rg-${seed}`,
      name: "RG — Frente e verso.pdf",
      description: "Documento de identidade do paciente",
      category: "pessoal" as const,
      fileType: "pdf" as const,
      sizeBytes: 245_760,
      uploadedAt: "2024-01-15",
      documentDate: "2024-01-10",
      uploadedBy: "Recepção",
      status: "processado" as const,
      visibility: "interno" as const,
      tags: ["identidade"],
    },
    {
      id: `doc-res-${seed}`,
      name: "Comprovante de residência.pdf",
      description: "Conta de luz — comprovante de endereço",
      category: "pessoal" as const,
      fileType: "pdf" as const,
      sizeBytes: 189_440,
      uploadedAt: "2024-01-15",
      uploadedBy: "Recepção",
      status: "processado" as const,
      visibility: "interno" as const,
    },
    {
      id: `doc-contrato-${seed}`,
      name: "Contrato de tratamento.docx",
      description: "Termo de consentimento e contrato odontológico",
      category: "contrato" as const,
      fileType: "word" as const,
      sizeBytes: 98_304,
      uploadedAt: "2024-02-01",
      uploadedBy: "Dra. Ana Silva",
      status: "processado" as const,
      visibility: "paciente" as const,
      tags: ["contrato", "assinado"],
    },
    {
      id: `doc-rx-${seed}`,
      name: "Radiografia panorâmica.jpg",
      description: "Exame radiográfico inicial",
      category: "radiografia" as const,
      fileType: "image" as const,
      sizeBytes: 1_572_864,
      uploadedAt: "2024-01-20",
      uploadedBy: "Dr. Carlos Mendes",
      status: "processado" as const,
      visibility: "profissional" as const,
      previewUrl:
        "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&q=80",
    },
    {
      id: `doc-exame-${seed}`,
      name: "Hemograma completo.pdf",
      description: "Resultado de exame laboratorial",
      category: "exame" as const,
      fileType: "pdf" as const,
      sizeBytes: 312_000,
      uploadedAt: "2024-03-12",
      uploadedBy: "Laboratório",
      status: "processado" as const,
      visibility: "profissional" as const,
    },
    {
      id: `doc-rec-${seed}`,
      name: "Receituário — antibiótico.pdf",
      description: "Prescrição pós-procedimento",
      category: "receita" as const,
      fileType: "pdf" as const,
      sizeBytes: 45_056,
      uploadedAt: "2024-08-14",
      uploadedBy: "Dra. Ana Silva",
      status: "processado" as const,
      visibility: "paciente" as const,
    },
    {
      id: `doc-orc-${seed}`,
      name: "Orçamento implante #1042.xlsx",
      description: "Planilha detalhada do orçamento aprovado",
      category: "orcamento" as const,
      fileType: "excel" as const,
      sizeBytes: 67_584,
      uploadedAt: "2024-06-10",
      uploadedBy: "Financeiro",
      status: "arquivado" as const,
      visibility: "interno" as const,
    },
    {
      id: `doc-comp-${seed}`,
      name: "Comprovante PIX — parcela 1.png",
      description: "Pagamento da primeira parcela do implante",
      category: "comprovante" as const,
      fileType: "image" as const,
      sizeBytes: 234_567,
      uploadedAt: "2026-06-01",
      uploadedBy: "Financeiro",
      status: "processado" as const,
      visibility: "interno" as const,
      previewUrl:
        "https://images.unsplash.com/photo-1554224311-beee415c201f?w=800&q=80",
    },
  ];

  if (seed === 1) {
    base.push({
      id: `doc-tomografia-${seed}`,
      name: "Tomografia computadorizada.zip",
      description: "Arquivo DICOM compactado",
      category: "exame" as const,
      fileType: "zip" as const,
      sizeBytes: 8_388_608,
      uploadedAt: "2025-11-20",
      uploadedBy: "Dr. Carlos Mendes",
      status: "processado" as const,
      visibility: "profissional" as const,
    });
  }

  return base.map((doc, i) => migrateLegacyDocument(doc, i));
}

export function documentSummary(documents: PatientDocument[]) {
  return {
    total: documents.length,
    personal: documents.filter((d) => d.category === "pessoal").length,
    exams: documents.filter(
      (d) => d.category === "exame" || d.category === "radiografia"
    ).length,
    contracts: documents.filter(
      (d) => d.category === "contrato" || d.category === "receita"
    ).length,
  };
}

export function folderCounts(documents: PatientDocument[]) {
  const folders: DocumentFolder[] = [
    "documentos_pessoais",
    "exames",
    "radiografias",
    "contratos",
    "financeiro",
    "outros",
  ];
  return folders.map((folder) => ({
    folder,
    count: documents.filter((d) => (d.folder ?? categoryToFolder(d.category)) === folder)
      .length,
  }));
}

function withinPeriod(dateStr: string, period: DocumentFilterState["period"]) {
  if (period === "todos") return true;
  const date = new Date(dateStr + "T12:00:00");
  const now = new Date();
  const days = period === "30d" ? 30 : period === "90d" ? 90 : 365;
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - days);
  return date >= cutoff;
}

export function applyDocumentFilters(
  documents: PatientDocument[],
  filters: DocumentFilterState
) {
  return documents.filter((doc) => {
    if (filters.category !== "todos" && doc.category !== filters.category) return false;
    if (filters.fileType !== "todos" && doc.fileType !== filters.fileType) return false;
    if (filters.folder !== "todos") {
      const folder = doc.folder ?? categoryToFolder(doc.category);
      if (folder !== filters.folder) return false;
    }
    if (!withinPeriod(doc.uploadedAt, filters.period)) return false;
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      const hay = [
        doc.name,
        doc.description ?? "",
        doc.uploadedBy,
        ...(doc.tags ?? []),
      ]
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function exportDocumentsList(documents: PatientDocument[]) {
  const header = "Nome,Categoria,Tipo,Tamanho,Data,Enviado por,Status\n";
  const rows = documents
    .map(
      (d) =>
        `"${d.name}","${d.category}","${d.fileType}","${formatFileSize(d.sizeBytes)}","${d.uploadedAt}","${d.uploadedBy}","${d.status}"`
    )
    .join("\n");
  return header + rows;
}
