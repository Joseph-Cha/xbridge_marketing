import { google, sheets_v4 } from "googleapis";

let _sheets: sheets_v4.Sheets | null = null;

function getSheets(): sheets_v4.Sheets {
  if (!_sheets) {
    const credentials = JSON.parse(
      process.env.GOOGLE_SERVICE_ACCOUNT_KEY || "{}"
    );
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    _sheets = google.sheets({ version: "v4", auth });
  }
  return _sheets;
}

function getSpreadsheetId(): string {
  const id = process.env.GOOGLE_SPREADSHEET_ID;
  if (!id) throw new Error("Missing GOOGLE_SPREADSHEET_ID");
  return id;
}

// Sheet column definitions
const SHEET_COLUMNS = {
  leads: [
    "id",
    "created_at",
    "session_id",
    "company_name",
    "business_number",
    "industry",
    "annual_revenue",
    "contact_name",
    "position",
    "email",
    "phone",
    "target_countries",
    "export_experience",
    "additional_notes",
    "privacy_consent",
    "marketing_consent",
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "status",
  ],
  utm_sessions: [
    "id",
    "created_at",
    "session_id",
    "visitor_id",
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "referrer",
    "landing_page",
    "user_agent",
    "device_type",
    "browser",
    "os",
    "screen_resolution",
    "page_view_count",
    "is_converted",
  ],
  page_views: [
    "id",
    "created_at",
    "session_id",
    "page_path",
    "sections_reached",
    "max_scroll_depth",
    "time_on_page",
    "cta_clicks",
    "faq_opens",
  ],
  form_events: [
    "id",
    "created_at",
    "session_id",
    "event_type",
    "field_name",
    "error_message",
    "fields_filled",
    "completion_rate",
    "time_spent",
  ],
} as const;

type SheetName = keyof typeof SHEET_COLUMNS;

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Append a row to a sheet. Returns the generated id.
 */
export async function appendRow(
  sheetName: SheetName,
  data: Record<string, unknown>
): Promise<string> {
  const sheets = getSheets();
  const columns = SHEET_COLUMNS[sheetName];
  const id = generateId();
  const now = new Date().toISOString();

  const row = columns.map((col) => {
    if (col === "id") return id;
    if (col === "created_at") return now;
    const val = data[col];
    if (val === undefined || val === null) return "";
    if (Array.isArray(val)) return JSON.stringify(val);
    if (typeof val === "boolean") return val ? "TRUE" : "FALSE";
    return String(val);
  });

  await sheets.spreadsheets.values.append({
    spreadsheetId: getSpreadsheetId(),
    range: `${sheetName}!A:${String.fromCharCode(64 + columns.length)}`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [row] },
  });

  return id;
}

/**
 * Find rows where a column matches a value. Returns array of row objects.
 */
export async function findRows(
  sheetName: SheetName,
  filterColumn: string,
  filterValue: string
): Promise<Array<Record<string, string>>> {
  const sheets = getSheets();
  const columns = SHEET_COLUMNS[sheetName] as readonly string[];
  const colIndex = columns.indexOf(filterColumn);
  if (colIndex === -1) return [];

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: getSpreadsheetId(),
    range: sheetName,
  });

  const rows = res.data.values || [];
  // Skip header row (index 0)
  const results: Array<Record<string, string>> = [];
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][colIndex] === filterValue) {
      const obj: Record<string, string> = {};
      columns.forEach((col, idx) => {
        obj[col] = rows[i][idx] || "";
      });
      results.push(obj);
    }
  }
  return results;
}

/**
 * Update a row by id with partial data.
 */
export async function updateRowById(
  sheetName: SheetName,
  id: string,
  data: Record<string, unknown>
): Promise<boolean> {
  const sheets = getSheets();
  const columns = SHEET_COLUMNS[sheetName];

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: getSpreadsheetId(),
    range: sheetName,
  });

  const rows = res.data.values || [];
  const idColIndex = 0; // id is always first column
  let rowIndex = -1;

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][idColIndex] === id) {
      rowIndex = i;
      break;
    }
  }

  if (rowIndex === -1) return false;

  const existingRow = rows[rowIndex];
  const updatedRow = columns.map((col, idx) => {
    if (col in data) {
      const val = data[col];
      if (val === undefined || val === null) return "";
      if (Array.isArray(val)) return JSON.stringify(val);
      if (typeof val === "boolean") return val ? "TRUE" : "FALSE";
      return String(val);
    }
    return existingRow[idx] || "";
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId: getSpreadsheetId(),
    range: `${sheetName}!A${rowIndex + 1}`,
    valueInputOption: "RAW",
    requestBody: { values: [updatedRow] },
  });

  return true;
}

/**
 * Update a row found by a column match.
 */
export async function updateRowByColumn(
  sheetName: SheetName,
  filterColumn: string,
  filterValue: string,
  data: Record<string, unknown>
): Promise<boolean> {
  const sheets = getSheets();
  const columns = SHEET_COLUMNS[sheetName] as readonly string[];
  const colIndex = columns.indexOf(filterColumn);
  if (colIndex === -1) return false;

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: getSpreadsheetId(),
    range: sheetName,
  });

  const rows = res.data.values || [];
  let rowIndex = -1;

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][colIndex] === filterValue) {
      rowIndex = i;
      break;
    }
  }

  if (rowIndex === -1) return false;

  const existingRow = rows[rowIndex];
  const updatedRow = columns.map((col, idx) => {
    if (col in data) {
      const val = data[col];
      if (val === undefined || val === null) return "";
      if (Array.isArray(val)) return JSON.stringify(val);
      if (typeof val === "boolean") return val ? "TRUE" : "FALSE";
      return String(val);
    }
    return existingRow[idx] || "";
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId: getSpreadsheetId(),
    range: `${sheetName}!A${rowIndex + 1}`,
    valueInputOption: "RAW",
    requestBody: { values: [updatedRow] },
  });

  return true;
}

/**
 * Count rows in a sheet (excluding header).
 */
export async function countRows(sheetName: SheetName): Promise<number> {
  const sheets = getSheets();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: getSpreadsheetId(),
    range: `${sheetName}!A:A`,
  });

  const rows = res.data.values || [];
  return Math.max(0, rows.length - 1); // exclude header
}

/**
 * Initialize sheets with header rows if they don't exist.
 */
export async function initializeSheets(): Promise<void> {
  const sheets = getSheets();
  const spreadsheetId = getSpreadsheetId();

  for (const [sheetName, columns] of Object.entries(SHEET_COLUMNS)) {
    try {
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!1:1`,
      });

      if (!res.data.values || res.data.values.length === 0) {
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `${sheetName}!A1`,
          valueInputOption: "RAW",
          requestBody: { values: [columns as unknown as string[]] },
        });
      }
    } catch {
      // Sheet may not exist yet - user needs to create it manually
      console.warn(
        `Sheet "${sheetName}" not found. Please create it in the spreadsheet.`
      );
    }
  }
}
