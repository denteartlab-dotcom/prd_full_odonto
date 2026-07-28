import type { jsPDF } from "jspdf";

const A4_WIDTH_PX = Math.round((210 / 25.4) * 96);

function waitForImages(root: HTMLElement) {
  const images = Array.from(root.querySelectorAll("img"));
  if (!images.length) return Promise.resolve();
  return Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) resolve();
          else {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          }
        })
    )
  ).then(() => undefined);
}

function waitForLayout() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

function addCanvasToPdf(pdf: jsPDF, canvas: HTMLCanvasElement) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imageHeight = (canvas.height * pageWidth) / canvas.width;
  const imgData = canvas.toDataURL("image/jpeg", 0.95);
  const thresholdMm = 4;

  if (imageHeight <= pageHeight + 0.5) {
    pdf.addImage(imgData, "JPEG", 0, 0, pageWidth, imageHeight);
    return;
  }

  let positionY = 0;
  pdf.addImage(imgData, "JPEG", 0, positionY, pageWidth, imageHeight);
  let remaining = imageHeight - pageHeight;

  while (remaining > thresholdMm) {
    positionY -= pageHeight;
    pdf.addPage();
    pdf.addImage(imgData, "JPEG", 0, positionY, pageWidth, imageHeight);
    remaining -= pageHeight;
  }
}

/** Converte o HTML preenchido do contrato em PDF A4 (páginas `.contract-pdf-page`). */
export async function gerarPdfContratoDeElemento(root: HTMLElement): Promise<Blob> {
  if (typeof window === "undefined") {
    throw new Error("Geração de PDF disponível apenas no navegador.");
  }

  await waitForImages(root);
  await waitForLayout();

  const pages = Array.from(
    root.querySelectorAll(".contract-pdf-page")
  ) as HTMLElement[];
  const targets = pages.length ? pages : [root];

  const html2canvas = (await import("html2canvas")).default;
  const { jsPDF } = await import("jspdf");

  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

  for (let i = 0; i < targets.length; i++) {
    if (i > 0) pdf.addPage();
    const target = targets[i];
    const previous = {
      boxShadow: target.style.boxShadow,
      margin: target.style.margin,
      borderRadius: target.style.borderRadius,
      minHeight: target.style.minHeight,
    };
    target.style.boxShadow = "none";
    target.style.margin = "0";
    target.style.borderRadius = "0";
    target.style.minHeight = "auto";

    const canvas = await html2canvas(target, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: "#ffffff",
      width: Math.max(target.scrollWidth, A4_WIDTH_PX),
      height: target.scrollHeight,
      windowWidth: Math.max(target.scrollWidth, A4_WIDTH_PX),
      windowHeight: target.scrollHeight,
    });

    target.style.boxShadow = previous.boxShadow;
    target.style.margin = previous.margin;
    target.style.borderRadius = previous.borderRadius;
    target.style.minHeight = previous.minHeight;

    addCanvasToPdf(pdf, canvas);
  }

  return pdf.output("blob");
}
