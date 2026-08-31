"use client"

/**
 * Client-side "Download PDF" that produces a REAL .pdf file (not a browser
 * print dialog). It rasterizes DOM content and paginates it into a
 * Letter-size document.
 *
 * Why html2canvas-pro instead of html2canvas:
 *   The app's theme is defined with oklch() color tokens (globals.css). The
 *   original html2canvas cannot parse oklch/lab/color() and throws at capture
 *   time. html2canvas-pro is a drop-in fork that understands modern CSS color
 *   spaces, so the report renders faithfully.
 *
 * Why section-by-section capture:
 *   Browsers cap the maximum <canvas> size (Chrome ~268M px² / 16384px per
 *   side). A long report (e.g. all 21 KPIs) exceeds that, so a single
 *   full-element capture yields a blank/failed canvas whose toDataURL() is
 *   empty -> jsPDF throws "addImage does not support files of type 'UNKNOWN'".
 *   To stay within limits we capture each `[data-pdf-section]` block on its
 *   own, so no single canvas is ever too large. Targets without sections
 *   (short pages) are captured whole.
 *
 * Both heavy libraries are dynamically imported inside the call so they are
 * code-split out of the initial page bundle and only fetched when a user
 * actually exports.
 */

export type ExportPdfOptions = {
  /** Downloaded file name. ".pdf" is appended if missing. */
  fileName?: string
  /** Page orientation. Defaults to portrait. */
  orientation?: "portrait" | "landscape"
}

type Html2Canvas = (typeof import("html2canvas-pro"))["default"]

// Browsers cap a single <canvas> to ~16384px per side (and a total area).
// Staying comfortably under that keeps tall KPI sections renderable.
const MAX_CANVAS_PX = 15000

async function captureToCanvas(
  html2canvas: Html2Canvas,
  element: HTMLElement,
): Promise<HTMLCanvasElement> {
  // Prefer 2x for crisp text, but scale DOWN when the element is so large that
  // 2x would blow past the browser's per-side canvas limit (which yields a
  // blank canvas whose toDataURL() is empty -> jsPDF "UNKNOWN" errors).
  const width = element.scrollWidth || element.offsetWidth || 1
  const height = element.scrollHeight || element.offsetHeight || 1
  // Cap always wins over quality: a section taller than the limit scales below
  // 1x rather than producing an unusable (blank) canvas.
  const scale = Math.min(2, MAX_CANVAS_PX / width, MAX_CANVAS_PX / height)

  const canvas = await html2canvas(element, {
    scale,
    backgroundColor: "#ffffff",
    useCORS: true,
    logging: false,
    // Skip anything explicitly marked screen-only (e.g. the toolbar).
    ignoreElements: (el) => el.classList?.contains("no-print") ?? false,
  })
  if (!canvas.width || !canvas.height) {
    throw new Error("Captured canvas is empty (element not visible or too large).")
  }
  return canvas
}

/**
 * Render `element` to a multi-page PDF and trigger a download.
 * Throws on failure so callers can surface an error state / fall back.
 */
export async function exportElementToPdf(
  element: HTMLElement,
  options: ExportPdfOptions = {},
): Promise<void> {
  const { fileName = "report.pdf", orientation = "portrait" } = options

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas-pro"),
    import("jspdf"),
  ])

  const pdf = new jsPDF({
    orientation,
    unit: "pt",
    format: "letter",
    compress: true,
  })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()

  // Reveal print/PDF-only chrome (e.g. a cover sheet marked
  // `[.pdf-capture_&]:block`) for the whole export by tagging the CONTAINER,
  // so those descendants are visible both when we query and when we capture.
  element.classList.add("pdf-capture")
  try {
    // Prefer per-section capture to stay under the browser canvas size cap.
    const sections = Array.from(
      element.querySelectorAll<HTMLElement>("[data-pdf-section]"),
    ).filter((el) => el.offsetParent !== null)

    const blocks = sections.length > 0 ? sections : [element]

    let isFirstPage = true

    for (const block of blocks) {
      const canvas = await captureToCanvas(html2canvas, block)
      // JPEG (not PNG) + dimensions taken straight from the canvas. This
      // avoids jsPDF.getImageProperties(), which unreliably throws
      // "UNKNOWN" on large PNG data URLs, and produces a much smaller file.
      const imgData = canvas.toDataURL("image/jpeg", 0.92)

      // Fit the capture to the full page width; height scales proportionally.
      const renderWidth = pageWidth
      const renderHeight = (canvas.height * renderWidth) / canvas.width

      // Each block begins on a fresh page (except the very first).
      if (!isFirstPage) pdf.addPage()
      isFirstPage = false

      // Place the (possibly tall) block, shifting up one page height at a time
      // until the whole block has been emitted across as many pages as needed.
      let heightRemaining = renderHeight
      let position = 0

      pdf.addImage(imgData, "JPEG", 0, position, renderWidth, renderHeight)
      heightRemaining -= pageHeight

      while (heightRemaining > 0) {
        position -= pageHeight
        pdf.addPage()
        pdf.addImage(imgData, "JPEG", 0, position, renderWidth, renderHeight)
        heightRemaining -= pageHeight
      }
    }
  } finally {
    element.classList.remove("pdf-capture")
  }

  const safeName = fileName.toLowerCase().endsWith(".pdf") ? fileName : `${fileName}.pdf`
  console.log("[kpi] PDFMARK saving", safeName, "pages =", pdf.getNumberOfPages())
  pdf.save(safeName)
}
