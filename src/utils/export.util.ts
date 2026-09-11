import type { Response } from "express";
import ExcelJS from "exceljs";

export type ExportFormat = "csv" | "xlsx";

export interface ColumnDefinition<T> {
  header: string;
  key: string;
  width?: number;
  format?: (row: T) => string | number | boolean | null | undefined;
}

/**
 * Membuat nama file export standar: <slug>-<module>-<YYYY-MM-DD>.<format>
 */
export function generateExportFileName(slug: string, moduleName: string, format: ExportFormat): string {
  const dateStr = new Date().toISOString().slice(0, 10);
  const cleanSlug = slug.replace(/[^a-zA-Z0-9_-]/g, "_");
  return `${cleanSlug}-${moduleName}-${dateStr}.${format}`;
}

/**
 * Mengatur HTTP response headers untuk download file CSV/XLSX
 */
export function setExportHeaders(res: Response, filename: string, format: ExportFormat): void {
  if (format === "csv") {
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
  } else {
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  }
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
}

/**
 * Escape string untuk format CSV (RFC 4180)
 */
function escapeCsvValue(val: unknown): string {
  if (val === null || val === undefined) {
    return "";
  }
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Menulis data sebagai file CSV streaming ke Express response
 */
export async function streamCsvExport<T>(res: Response, columns: ColumnDefinition<T>[], data: T[] | AsyncIterable<T>): Promise<void> {
  // UTF-8 BOM untuk kompatibilitas Microsoft Excel
  res.write("\uFEFF");

  // Header row
  const headerLine = columns.map((col) => escapeCsvValue(col.header)).join(",") + "\r\n";
  res.write(headerLine);

  if (Symbol.asyncIterator in Object(data)) {
    for await (const row of data as AsyncIterable<T>) {
      const line =
        columns
          .map((col) => {
            const raw = col.format ? col.format(row) : (row as Record<string, unknown>)[col.key];
            return escapeCsvValue(raw);
          })
          .join(",") + "\r\n";
      res.write(line);
    }
  } else {
    for (const row of data as T[]) {
      const line =
        columns
          .map((col) => {
            const raw = col.format ? col.format(row) : (row as Record<string, unknown>)[col.key];
            return escapeCsvValue(raw);
          })
          .join(",") + "\r\n";
      res.write(line);
    }
  }

  res.end();
}

/**
 * Menulis data sebagai file XLSX streaming ke Express response
 */
export async function streamXlsxExport<T>(res: Response, sheetName: string, columns: ColumnDefinition<T>[], data: T[] | AsyncIterable<T>): Promise<void> {
  const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
    stream: res,
    useStyles: true,
  });

  const worksheet = workbook.addWorksheet(sheetName);
  worksheet.columns = columns.map((col) => ({
    header: col.header,
    key: col.key,
    width: col.width ?? Math.max(col.header.length + 5, 12),
  }));

  if (Symbol.asyncIterator in Object(data)) {
    for await (const item of data as AsyncIterable<T>) {
      const rowData: Record<string, unknown> = {};
      for (const col of columns) {
        rowData[col.key] = col.format ? col.format(item) : (item as Record<string, unknown>)[col.key];
      }
      worksheet.addRow(rowData).commit();
    }
  } else {
    for (const item of data as T[]) {
      const rowData: Record<string, unknown> = {};
      for (const col of columns) {
        rowData[col.key] = col.format ? col.format(item) : (item as Record<string, unknown>)[col.key];
      }
      worksheet.addRow(rowData).commit();
    }
  }

  worksheet.commit();
  await workbook.commit();
}
