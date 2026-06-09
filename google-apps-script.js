/**
 * DEPLOY THIS AS A GOOGLE APPS SCRIPT WEB APP
 * =============================================
 * 1. Go to: https://script.google.com/
 * 2. Click "New project"
 * 3. Paste ALL of this code, replacing anything in the editor
 * 4. Click "Deploy" → "New deployment"
 * 5. Type: Web app
 * 6. Execute as: Me
 * 7. Who has access: Anyone
 * 8. Click Deploy → copy the Web App URL
 * 9. Paste that URL into main.js as SHEETS_WEBHOOK_URL
 */

const SHEET_ID = '1N_PCEVke0pq9H90aU8V_UMnVG2zBqOB8MsXfL4ZynlI';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById(SHEET_ID);

    // Get or create a tab for this event type
    const tabName = data.type || 'General';
    let sheet = ss.getSheetByName(tabName);
    if (!sheet) {
      sheet = ss.insertSheet(tabName);
      // Write headers on first row
      const headers = ['Timestamp', 'Type', 'Email', 'Page', 'Extra'];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    }

    const row = [
      new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }),
      data.type || '',
      data.email || '',
      data.page || '',
      data.extra ? JSON.stringify(data.extra) : ''
    ];

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Test function — run this manually to verify the sheet connection works
function test() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  Logger.log('Connected: ' + ss.getName());
}
