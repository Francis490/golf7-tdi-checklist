# ☁️ Google Sheets + Notifiche Email

Guida per usare la check-list su **Google Sheets** con **notifiche email automatiche**.

---

## 1️⃣ Importa il template

1. Apri **Google Sheets** → nuovo foglio vuoto
2. Menu **File → Importa → Carica**
3. Carica [`template-import.csv`](template-import.csv)
4. Rinomina il foglio in `Foglio1` (o aggiorna la variabile `NOME_FOGLIO` nello script)

### Aggiungi in alto (righe 1-2)

| Cella | Contenuto |
|-------|-----------|
| A1 | `Km attuali` |
| B1 | *(inserisci i km reali della tua auto)* |
| A2 | `Data odierna` |
| B2 | `=OGGI()` |

---

## 2️⃣ Aggiungi le formule (dalla riga 5 in poi)

| Cella | Formula |
|-------|---------|
| **G5** | `=IF(E5="";"";$B$1+(C5-(($B$1-E5)-MOD($B$1-E5;C5))))` |
| **H5** | `=IF(F5="";"";EDATE(F5;D5))` |
| **I5** | `=IF(H5="";"";H5-TODAY())` |
| **J5** | `=IF(E5="";"— MAI FATTO —";IF(G5-$B$1<=0;"🔴 SCADUTO";IF(G5-$B$1<=3000;"🟡 IN SCADENZA";"🟢 OK")))` |

Trascina giù fino all'ultima riga della tabella.

---

## 3️⃣ Formattazione condizionale su J5:J100

Seleziona la colonna **J** → **Formato → Formattazione condizionale** → aggiungi 3 regole:

| Testo contiene | Formato |
|----------------|---------|
| `SCADUTO` | Sfondo **rosso** · testo bianco |
| `IN SCADENZA` | Sfondo **giallo** · testo nero |
| `OK` | Sfondo **verde** · testo bianco |

---

## 4️⃣ Notifiche email automatiche

Lo script [`apps-script-notifiche.js`](apps-script-notifiche.js) ti manda una email
ogni mattina **solo se** ci sono interventi scaduti o in scadenza.

### Setup

1. Nel foglio Google → **Estensioni → Apps Script**
2. Cancella il contenuto di default
3. Incolla il contenuto di `apps-script-notifiche.js`
4. Modifica la riga:
   ```javascript
   const EMAIL_DESTINATARIO = "tua-email@gmail.com";
