import "server-only";

import { readFile } from "node:fs/promises";
import { join } from "node:path";

import {
  downloadSiteFile,
  isSharePointConfigured,
} from "@/lib/sharepoint/graph-client";

/**
 * Returns the drive-relative path of a KPI workbook.
 *
 * Examples:
 *   {id}.xlsx      -> kpi-01.xlsx
 *   {id}/{id}.xlsx -> kpi-01/kpi-01.xlsx
 */
function kpiDrivePath(kpiId: string): string {
  const template = process.env.SHAREPOINT_FILE_TEMPLATE?.trim() || "{id}.xlsx";

  return template.replace(/\{id\}/g, kpiId).replace(/^\/+/, "");
}

/**
 * Returns the absolute path to the bundled local fallback workbook.
 */
function localWorkbookPath(kpiId: string): string {
  return join(process.cwd(), "data", kpiId, `${kpiId}.xlsx`);
}

/**
 * Returns the KPI workbook as an ArrayBuffer.
 *
 * Resolution order:
 *   1. SharePoint, when configured
 *   2. Local workbook fallback
 */
export async function getKpiWorkbookBuffer(
  kpiId: string,
): Promise<ArrayBuffer> {
  if (isSharePointConfigured()) {
    try {
      return await downloadSiteFile(kpiDrivePath(kpiId));
    } catch (error: unknown) {
      console.error(
        `[CNS HIAA] SharePoint fetch failed for ${kpiId}:`,
        error instanceof Error ? error.message : error,
      );

      throw error;
    }
  }

  const buffer = await readFile(localWorkbookPath(kpiId));

  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer;
}

/**
 * Downloads the latest available KPI workbook.
 */
export async function getKpiWorkbookForDownload(
  kpiId: string,
): Promise<ArrayBuffer> {
  return getKpiWorkbookBuffer(kpiId);
}
