export type DocumentCategory =
  | "pessoal"
  | "exame"
  | "radiografia"
  | "contrato"
  | "receita"
  | "orcamento"
  | "comprovante"
  | "outros";

export type DocumentFileType =
  | "pdf"
  | "word"
  | "excel"
  | "image"
  | "zip"
  | "txt"
  | "csv"
  | "other";

export type DocumentStatus = "processado" | "enviando" | "erro" | "arquivado";

export type DocumentVisibility = "interno" | "paciente" | "profissional";

export type DocumentFolder =
  | "documentos_pessoais"
  | "exames"
  | "radiografias"
  | "contratos"
  | "financeiro"
  | "outros";

export type PatientDocument = {
  id: string;
  name: string;
  description?: string;
  category: DocumentCategory;
  fileType: DocumentFileType;
  mimeType?: string;
  sizeBytes: number;
  uploadedAt: string;
  documentDate?: string;
  uploadedBy: string;
  status: DocumentStatus;
  visibility: DocumentVisibility;
  tags?: string[];
  folder?: DocumentFolder;
  previewUrl?: string;
};

export const ACCEPTED_EXTENSIONS = [
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
] as const;

export const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;

export const ACCEPTED_FORMATS_LABEL =
  "Formatos aceitos: PDF, Word, Excel, imagens, ZIP, TXT e CSV.";

export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, string> = {
  pessoal: "Documento pessoal",
  exame: "Exame",
  radiografia: "Radiografia",
  contrato: "Contrato",
  receita: "Receita",
  orcamento: "Orçamento",
  comprovante: "Comprovante",
  outros: "Outros",
};

export const DOCUMENT_FILE_TYPE_LABELS: Record<DocumentFileType, string> = {
  pdf: "PDF",
  word: "Word",
  excel: "Excel",
  image: "Imagem",
  zip: "Compactado",
  txt: "TXT",
  csv: "CSV",
  other: "Outro",
};

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  processado: "Processado",
  enviando: "Enviando",
  erro: "Erro",
  arquivado: "Arquivado",
};

export const DOCUMENT_VISIBILITY_LABELS: Record<DocumentVisibility, string> = {
  interno: "Interno",
  paciente: "Paciente",
  profissional: "Profissional",
};

export const DOCUMENT_FOLDER_LABELS: Record<DocumentFolder, string> = {
  documentos_pessoais: "Documentos pessoais",
  exames: "Exames",
  radiografias: "Radiografias",
  contratos: "Contratos",
  financeiro: "Financeiro",
  outros: "Outros",
};

export function categoryToFolder(category: DocumentCategory): DocumentFolder {
  const map: Record<DocumentCategory, DocumentFolder> = {
    pessoal: "documentos_pessoais",
    exame: "exames",
    radiografia: "radiografias",
    contrato: "contratos",
    receita: "outros",
    orcamento: "financeiro",
    comprovante: "financeiro",
    outros: "outros",
  };
  return map[category];
}

export function isPreviewable(fileType: DocumentFileType) {
  return fileType === "pdf" || fileType === "image";
}
