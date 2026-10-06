/**
 * Check-list Tagliando VW Golf 7 1.6 TDI — Notifiche email automatiche
 * Script per Google Apps Script (Google Sheets)
 *
 * Setup:
 *  1. Importa template-import.csv in Google Sheets
 *  2. Aggiungi le formule G/H/I/J (vedi sheets/README.md)
 *  3. Estensioni → Apps Script → incolla questo file
 *  4. Modifica EMAIL_DESTINATARIO con la tua email
 *  5. Salva, esegui una volta per autorizzare
 *  6. Crea un trigger giornaliero per la funzione inviaPromemoria
 */

// ============================================================
// CONFIGURAZIONE — MODIFICA SOLO QUESTE RIGHE
// ============================================================
const EMAIL_DESTINATARIO = "tua-email@gmail.com";  // ← la tua email
const GIORNI_PREAVVISO    = 30;                     // ← giorni di preavviso
const KM_PREAVVISO        = 3000;                   // ← km di preavviso
const NOME_FOGLIO         = "Foglio1";              // ← nome del tuo foglio
const RIGA_INIZIO_DATI    = 5;                      // ← riga in cui iniziano i dati
const COL_STATO           = 10;                     // ← colonna J (Stato)
const COL_OPERAZIONE      = 2;                      // ← colonna B (Operazione)
const COL_PROSSIMO_KM     = 7;                      // ← colonna G
const COL_PROSSIMA_DATA   = 8;                      // ← colonna H
const COL_GIORNI_RESIDUI  = 9;                      // ← colonna I

// ============================================================
// FUNZIONE PRINCIPALE — invio promemoria
// ============================================================
function inviaPromemoria() {
  const foglio = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(NOME_FOGLIO);
  if (!foglio) {
    Logger.log("❌ Foglio non trovato: " + NOME_FOGLIO);
    return;
  }

  const ultimaRiga = foglio.getLastRow();
  const kmAttuali  = Number(foglio.getRange("B1").getValue());

  const scaduti    = [];
  const inScadenza = [];

  for (let r = RIGA_INIZIO_DATI; r <= ultimaRiga; r++) {
    const operazione   = foglio.getRange(r, COL_OPERAZIONE).getValue();
    const prossimoKm   = Number(foglio.getRange(r, COL_PROSSIMO_KM).getValue()) || 0;
    const prossimaData = foglio.getRange(r, COL_PROSSIMA_DATA).getValue();
    const giorniResid  = Number(foglio.getRange(r, COL_GIORNI_RESIDUI).getValue());

    if (!operazione) continue;

    const kmResidui = prossimoKm - kmAttuali;

    // Scaduto per km
    if (prossimoKm > 0 && kmResidui <= 0) {
      scaduti.push(`<li><b>${operazione}</b> — SCADUTO per km (previsto a ${prossimoKm.toLocaleString('it-IT')} km, attuali ${kmAttuali.toLocaleString('it-IT')})</li>`);
      continue;
    }
    // Scaduto per tempo
    if (prossimaData && giorniResid <= 0) {
      scaduti.push(`<li><b>${operazione}</b> — SCADUTO per tempo</li>`);
      continue;
    }
    // In scadenza per km
    if (prossimoKm > 0 && kmResidui <= KM_PREAVVISO) {
      inScadenza.push(`<li><b>${operazione}</b> — tra <b>${kmResidui.toLocaleString('it-IT')} km</b></li>`);
      continue;
    }
    // In scadenza per giorni
    if (prossimaData && giorniResid <= GIORNI_PREAVVISO && giorniResid > 0) {
      inScadenza.push(`<li><b>${operazione}</b> — tra <b>${giorniResid} giorni</b></li>`);
    }
  }

  // Nessuna scadenza → nessuna email
  if (scaduti.length === 0 && inScadenza.length === 0) {
    Logger.log("✅ Nessuna scadenza vicina — nessuna email inviata.");
    return;
  }

  const oggetto = `🚗 Golf 7 TDI — ${scaduti.length > 0 ? '⚠️ ' + scaduti.length + ' interventi SCADUTI' : '🔔 ' + inScadenza.length + ' interventi in scadenza'}`;

  let corpo = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#222;">
      <h2 style="color:#0d47a1;border-bottom:3px solid #0d47a1;padding-bottom:6px;">
        🚗 Check-list Tagliando — VW Golf 7 1.6 TDI
      </h2>
      <p><b>Km attuali:</b> ${kmAttuali.toLocaleString('it-IT')} km<br>
      <b>Data controllo:</b> ${new Date().toLocaleString('it-IT')}</p>
  `;

  if (scaduti.length > 0) {
    corpo += `
      <h3 style="background:#c62828;color:#fff;padding:8px 12px;border-radius:4px;">
        🔴 Interventi SCADUTI (${scaduti.length})
      </h3>
      <ul style="line-height:1.7;">${scaduti.join('')}</ul>
    `;
  }

  if (inScadenza.length > 0) {
    corpo += `
      <h3 style="background:#f9a825;color:#222;padding:8px 12px;border-radius:4px;">
        🟡 In scadenza entro ${KM_PREAVVISO} km / ${GIORNI_PREAVVISO} giorni (${inScadenza.length})
      </h3>
      <ul style="line-height:1.7;">${inScadenza.join('')}</ul>
    `;
  }

  corpo += `
      <hr style="margin:20px 0;border:none;border-top:1px solid #ddd;">
      <p style="font-size:12px;color:#777;">
        📄 <a href="${SpreadsheetApp.getActiveSpreadsheet().getUrl()}" style="color:#0d47a1;">Apri la check-list completa</a><br>
        <i>Email automatica generata dallo script di manutenzione Golf 7.</i>
      </p>
    </div>
  `;

  MailApp.sendEmail({
    to: EMAIL_DESTINATARIO,
    subject: oggetto,
    htmlBody: corpo
  });

  Logger.log(`✅ Email inviata a ${EMAIL_DESTINATARIO} — Scaduti: ${scaduti.length}, In scadenza: ${inScadenza.length}`);
}

// ============================================================
// UTILITY — Test manuale
// ============================================================
function testEmail() {
  inviaPromemoria();
  Logger.log("📧 Test completato — controlla la casella email.");
}
