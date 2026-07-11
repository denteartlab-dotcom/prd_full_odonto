"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LayoutGrid, List, Plus, Upload } from "lucide-react";
import type { PatientProfile } from "@/lib/patient-profile-types";
import type { DocumentCategory, DocumentFolder, PatientDocument } from "@/lib/document-types";
import { categoryToFolder } from "@/lib/document-types";
import {
  applyDocumentFilters,
  createDefaultDocuments,
  DEFAULT_DOCUMENT_FILTERS,
  detectFileType,
  documentSummary,
  exportDocumentsList,
  folderCounts,
  migrateLegacyDocument,
  type DocumentFilterState,
  type PendingUpload,
} from "@/lib/document-mock";
import { patientSeedFromId } from "@/lib/budget-mock";
import { DocumentFolderSidebar } from "./DocumentFolderSidebar";
import { DocumentPreviewDrawer } from "./DocumentPreviewDrawer";
import { DocumentsCategoryTabs } from "./DocumentsCategoryTabs";
import { DocumentUploadDropzone } from "./DocumentUploadDropzone";
import { DocumentsFilters } from "./DocumentsFilters";
import { DocumentsGrid } from "./DocumentsGrid";
import { DocumentsHeader, DocumentsSecurityNote } from "./DocumentsHeader";
import { DocumentsSummaryCards } from "./DocumentsSummaryCards";
import { DocumentsTable } from "./DocumentsTable";
import { DocumentSection } from "./shared";
import {
  MoveCategoryModal,
  NewFolderModal,
  RenameDocumentModal,
  UploadDocumentModal,
  type UploadDocumentForm,
} from "./UploadDocumentModal";

function loadDocuments(patient: PatientProfile): PatientDocument[] {
  if (patient.documents?.length && patient.documents[0]?.fileType) {
    return patient.documents;
  }
  if (patient.documents?.length) {
    return patient.documents.map((d, i) => migrateLegacyDocument(d, i));
  }
  return createDefaultDocuments(patientSeedFromId(patient.id));
}

export function PatientDocumentsTab({
  patient,
  onUpdate,
  userName = "Recepção",
}: {
  patient: PatientProfile;
  onUpdate: (patch: Partial<PatientProfile>) => void;
  userName?: string;
}) {
  const [documents, setDocuments] = useState<PatientDocument[]>([]);
  const [filters, setFilters] = useState<DocumentFilterState>(DEFAULT_DOCUMENT_FILTERS);
  const [categoryTab, setCategoryTab] = useState<DocumentCategory | "todos">("todos");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [editingDoc, setEditingDoc] = useState<PatientDocument | null>(null);
  const [renameOpen, setRenameOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const [folderOpen, setFolderOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const initialized = useRef(false);
  const pendingPersist = useRef(false);
  const patientIdRef = useRef(patient.id);

  useEffect(() => {
    if (patientIdRef.current !== patient.id) {
      patientIdRef.current = patient.id;
      initialized.current = false;
      pendingPersist.current = false;
    }
    if (initialized.current) return;
    setDocuments(loadDocuments(patient));
    initialized.current = true;
    setLoading(false);
  }, [patient]);

  useEffect(() => {
    if (!pendingPersist.current || loading) return;
    pendingPersist.current = false;
    onUpdate({ documents });
  }, [documents, loading, onUpdate]);

  const persist = useCallback((next: PatientDocument[]) => {
    setDocuments(next);
    pendingPersist.current = true;
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const filtered = useMemo(() => {
    const withCategory =
      categoryTab === "todos"
        ? documents
        : documents.filter((d) => d.category === categoryTab);
    return applyDocumentFilters(withCategory, filters);
  }, [documents, filters, categoryTab]);

  const summary = useMemo(() => documentSummary(documents), [documents]);
  const folders = useMemo(() => folderCounts(documents), [documents]);

  const categoryCounts = useMemo(() => {
    const counts: Record<DocumentCategory | "todos", number> = {
      todos: documents.length,
      pessoal: 0,
      exame: 0,
      radiografia: 0,
      contrato: 0,
      receita: 0,
      orcamento: 0,
      comprovante: 0,
      outros: 0,
    };
    documents.forEach((d) => {
      counts[d.category]++;
    });
    return counts;
  }, [documents]);

  const selected = useMemo(
    () => documents.find((d) => d.id === selectedId) ?? null,
    [documents, selectedId]
  );

  const openPreview = (id: string) => {
    setSelectedId(id);
    setPreviewOpen(true);
  };

  const handleAddPending = (files: File[]) => {
    const items: PendingUpload[] = files.map((file) => ({
      id: `pending-${Date.now()}-${Math.random()}`,
      file,
      progress: 0,
    }));
    setPendingUploads((prev) => [...prev, ...items]);

    items.forEach((item) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 15 + Math.random() * 20;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
        }
        setPendingUploads((prev) =>
          prev.map((p) => (p.id === item.id ? { ...p, progress: Math.min(100, progress) } : p))
        );
      }, 200);
    });
  };

  const handleRemovePending = (id: string) => {
    setPendingUploads((prev) => prev.filter((p) => p.id !== id));
  };

  const handleUploadSubmit = (form: UploadDocumentForm) => {
    if (editingDoc) {
      persist(
        documents.map((d) =>
          d.id === editingDoc.id
            ? {
                ...d,
                name: form.name,
                category: form.category,
                description: form.description,
                documentDate: form.documentDate,
                visibility: form.visibility,
                tags: form.tags
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean),
                folder: categoryToFolder(form.category),
              }
            : d
        )
      );
      showToast("Documento atualizado.");
    } else if (form.file) {
      const fileType = detectFileType(form.file.name, form.file.type);
      const newDoc: PatientDocument = {
        id: `doc-${Date.now()}`,
        name: form.name,
        description: form.description || `Upload: ${form.file.name}`,
        category: form.category,
        fileType,
        mimeType: form.file.type,
        sizeBytes: form.file.size,
        uploadedAt: new Date().toISOString().slice(0, 10),
        documentDate: form.documentDate,
        uploadedBy: userName,
        status: "processado",
        visibility: form.visibility,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        folder: categoryToFolder(form.category),
        previewUrl:
          fileType === "image" ? URL.createObjectURL(form.file) : undefined,
      };
      persist([newDoc, ...documents]);
      showToast("Documento salvo com sucesso.");
      setPendingUploads([]);
    }
    setUploadOpen(false);
    setUploadFile(null);
    setEditingDoc(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Excluir este documento?")) return;
    persist(documents.filter((d) => d.id !== id));
    setPreviewOpen(false);
    showToast("Documento excluído.");
  };

  const handleRename = (name: string) => {
    if (!selectedId) return;
    persist(documents.map((d) => (d.id === selectedId ? { ...d, name } : d)));
    setRenameOpen(false);
    showToast("Documento renomeado.");
  };

  const handleMove = (category: DocumentCategory) => {
    if (!selectedId) return;
    persist(
      documents.map((d) =>
        d.id === selectedId
          ? { ...d, category, folder: categoryToFolder(category) }
          : d
      )
    );
    setMoveOpen(false);
    showToast("Categoria atualizada.");
  };

  const handleDownload = (id: string) => {
    const doc = documents.find((d) => d.id === id);
    showToast(doc ? `Download simulado: ${doc.name}` : "Documento não encontrado.");
  };

  const handleExport = () => {
    const csv = exportDocumentsList(documents);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `documentos-${patient.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Lista exportada.");
  };

  const handleFolderSelect = (folder: DocumentFolder | "todos") => {
    setFilters((f) => ({ ...f, folder }));
  };

  const isEmpty = !loading && documents.length === 0;

  return (
    <div className="relative">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}

      <DocumentsHeader
        onUpload={() => {
          setEditingDoc(null);
          setUploadFile(null);
          setUploadOpen(true);
        }}
        onNewFolder={() => setFolderOpen(true)}
        onExport={handleExport}
      />

      <DocumentsSecurityNote />

      {!loading && !isEmpty && (
        <DocumentsSummaryCards
          total={summary.total}
          personal={summary.personal}
          exams={summary.exams}
          contracts={summary.contracts}
        />
      )}

      {!isEmpty && (
        <DocumentUploadDropzone
          pending={pendingUploads}
          onAdd={handleAddPending}
          onRemove={handleRemovePending}
          onOpenUpload={() => {
            const first = pendingUploads[0]?.file ?? null;
            setUploadFile(first);
            setEditingDoc(null);
            setUploadOpen(true);
          }}
        />
      )}

      {isEmpty ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center shadow-sm">
          <Upload className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-4 text-sm font-medium text-slate-600">
            Nenhum documento encontrado para este paciente.
          </p>
          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            + Enviar primeiro documento
          </button>
        </div>
      ) : (
        <>
          <DocumentsCategoryTabs
            active={categoryTab}
            onChange={setCategoryTab}
            counts={categoryCounts}
          />

          <DocumentsFilters
            filters={filters}
            onChange={(p) => setFilters((f) => ({ ...f, ...p }))}
            onClear={() => setFilters(DEFAULT_DOCUMENT_FILTERS)}
          />

          <div className="grid gap-5 xl:grid-cols-[220px_1fr]">
            <DocumentFolderSidebar
              folders={folders}
              active={filters.folder}
              onSelect={handleFolderSelect}
            />

            <DocumentSection
              title="Documentos"
              action={
                <div className="flex rounded-lg border border-slate-200 p-0.5">
                  <button
                    type="button"
                    onClick={() => setViewMode("table")}
                    className={`rounded-md p-1.5 ${
                      viewMode === "table"
                        ? "bg-indigo-100 text-indigo-700"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                    aria-label="Visualização em tabela"
                  >
                    <List className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={`rounded-md p-1.5 ${
                      viewMode === "grid"
                        ? "bg-indigo-100 text-indigo-700"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                    aria-label="Visualização em grid"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                </div>
              }
            >
              {viewMode === "table" ? (
                <DocumentsTable
                  documents={filtered}
                  onView={openPreview}
                  onDownload={handleDownload}
                  onRename={(id) => {
                    setSelectedId(id);
                    setRenameOpen(true);
                  }}
                  onMove={(id) => {
                    setSelectedId(id);
                    setMoveOpen(true);
                  }}
                  onDelete={handleDelete}
                />
              ) : (
                <DocumentsGrid
                  documents={filtered}
                  onView={openPreview}
                  onDownload={handleDownload}
                  onRename={(id) => {
                    setSelectedId(id);
                    setRenameOpen(true);
                  }}
                  onMove={(id) => {
                    setSelectedId(id);
                    setMoveOpen(true);
                  }}
                  onDelete={handleDelete}
                />
              )}
            </DocumentSection>
          </div>
        </>
      )}

      <DocumentPreviewDrawer
        document={selected}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        onEdit={() => {
          if (selected) {
            setEditingDoc(selected);
            setPreviewOpen(false);
            setUploadOpen(true);
          }
        }}
        onDownload={() => selectedId && handleDownload(selectedId)}
        onDelete={() => selectedId && handleDelete(selectedId)}
      />

      <UploadDocumentModal
        open={uploadOpen}
        onClose={() => {
          setUploadOpen(false);
          setUploadFile(null);
          setEditingDoc(null);
        }}
        onSubmit={handleUploadSubmit}
        initialFile={uploadFile}
        editing={editingDoc}
      />

      <NewFolderModal
        open={folderOpen}
        onClose={() => setFolderOpen(false)}
        onSubmit={(name) => {
          setFolderOpen(false);
          showToast(`Pasta "${name}" criada (mock).`);
        }}
      />

      <RenameDocumentModal
        open={renameOpen}
        currentName={selected?.name ?? ""}
        onClose={() => setRenameOpen(false)}
        onSubmit={handleRename}
      />

      <MoveCategoryModal
        open={moveOpen}
        documentName={selected?.name ?? ""}
        currentCategory={selected?.category ?? "outros"}
        onClose={() => setMoveOpen(false)}
        onSubmit={handleMove}
      />
    </div>
  );
}
