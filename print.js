/* ===================== Druckbare A4-Spielanleitung pro Gruppe =====================
   Backup-Lösung: enthält Anmeldecode + komplettes Spiel (alle Stationen in der
   Reihenfolge der Gruppe, zweisprachig), falls die mobile App ausfällt.
   Nutzt STATIONS / GROUPS / SOLUTION aus game-data.js.
   Design/Farben/Fonts folgen dem Gesamtauftritt der Stadtrallye (index.html). */

function esc(s){
  return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}

/* Ziel des QR-Codes. Bewusst fest verdrahtet statt location.origin: ein
   Ausdruck soll immer auf die Live-App zeigen, auch wenn er von einer
   lokalen Vorschau oder Testumgebung aus erzeugt wurde. */
const APP_URL = "https://stadtrally-muc-26.web.app";

const PRINT_FONTS_LINK =
  `<link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,900&family=Zen+Kaku+Gothic+New:wght@400;500;700&display=swap" rel="stylesheet">`;

function buildStationBlock(s, pos){
  const tasks = s.tasks.map(t=>{
    const tag = t.photo
      ? `<span class="tag photo">📷 Foto / 写真</span>`
      : `<span class="tag">✏️ Aufgabe / 課題</span>`;
    return `
      <li>
        <span class="chk"></span>
        <div class="ttxt">
          ${tag}
          <div class="de">${esc(t.de)}</div>
          <div class="ja">${esc(t.ja)}</div>
        </div>
      </li>`;
  }).join("");

  return `
  <section class="station">
    <div class="st-head">
      <div class="st-num">${pos}</div>
      <div class="st-title">
        <h3>${s.icon} ${esc(s.name.de)} <span class="ja-inline">${esc(s.name.ja)}</span></h3>
        <div class="st-area">${esc(s.area.de)} · ${esc(s.area.ja)}</div>
      </div>
      <div class="st-stamp">
        <div class="stamp-field"></div>
        <div class="stamp-label">Stempel<br>スタンプ</div>
      </div>
    </div>

    <div class="st-loc">📍 In Karten-App suchen nach: <b>${esc(s.map)}</b> &nbsp;·&nbsp; ${s.lat.toFixed(5)}, ${s.lng.toFixed(5)}</div>

    <p class="intro de">${esc(s.intro.de)}</p>
    <p class="intro ja">${esc(s.intro.ja)}</p>

    <ul class="tasks">${tasks}</ul>

    <div class="fact">💡 ${esc(s.fact.de)} <span class="ja-inline">/ ${esc(s.fact.ja)}</span></div>
  </section>`;
}

/* Gemeinsames Stylesheet für Bildschirm-Druck & PDF-Export.
   Farb-/Font-Tokens gespiegelt aus index.html (Gesamtdesign der Rallye). */
function groupSheetCSS(){
  return `
  @page { size: A4; margin: 16mm 15mm 18mm; }
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:"Zen Kaku Gothic New","Helvetica Neue",Arial,system-ui,sans-serif;color:#2b2620;font-size:11pt;line-height:1.55;background:#fff}
  .ja{color:#7a6f5f;font-size:9.5pt}
  .ja-inline{color:#8a7f6a;font-weight:400;font-size:.84em}

  /* Toolbar nur am Bildschirm */
  .toolbar{position:sticky;top:0;background:#2b2620;color:#f3ebdb;padding:12px 18px;display:flex;gap:14px;align-items:center;font-size:10pt}
  .toolbar b{font-size:11pt;font-family:"Fraunces",Georgia,serif}
  .toolbar button{margin-left:auto;background:#c33d2c;color:#fff;border:0;border-radius:8px;padding:10px 18px;font-size:10.5pt;font-weight:700;cursor:pointer}
  @media print { .toolbar{display:none} }

  .sheet{max-width:180mm;margin:0 auto;padding:8mm 0 4mm}

  /* Kopf */
  .head{border:2.5px solid #2b2620;border-radius:16px;padding:16px 20px;display:flex;align-items:center;gap:16px;margin-bottom:16px;background:#fbf6ec}
  .head .emoji{font-size:36pt;line-height:1}
  .head .ht{flex:1}
  .head .event{font-size:8.5pt;letter-spacing:.06em;text-transform:uppercase;color:#7a6f5f;margin-bottom:3px}
  .head h1{font-family:"Fraunces",Georgia,serif;font-weight:900;font-size:21pt;line-height:1.15;margin:1px 0}
  .head h1 .ja-inline{display:block;font-size:11pt;margin-top:4px;font-weight:400}
  /* Zugang: QR-Code und Anmeldecode gehören zusammen (scannen → Code eingeben)
     und stehen deshalb als ein Block nebeneinander – das hält den Kopf flach. */
  .access{display:flex;align-items:stretch;gap:12px;flex:none}
  .codebox{border:2px solid #c33d2c;border-radius:12px;padding:10px 16px;text-align:center;background:#fff;display:flex;flex-direction:column;justify-content:center}
  .codebox .cl{font-size:7.5pt;text-transform:uppercase;letter-spacing:.1em;color:#9c2c1f;margin-bottom:2px}
  .codebox .cc{font-family:"Fraunces",Georgia,serif;font-size:23pt;font-weight:900;letter-spacing:.13em;color:#2b2620;line-height:1.1}
  .codebox .cu{font-size:6.5pt;color:#9a927c;margin-top:4px;white-space:nowrap}

  /* QR-Code zur Web-App. Module werden als absolut positionierte Rechtecke
     in ganzen Pixeln gezeichnet (siehe qr.js), damit weder im Druck noch beim
     Canvas-Rendering des PDF Zwischenräume entstehen. */
  .qrwrap{text-align:center;flex:none}
  .qr{position:relative;background:#fff;margin:0 auto}
  .qr i{position:absolute;display:block;background:#000}
  .qrwrap .ql{font-size:7pt;line-height:1.25;color:#5a5142;margin-top:4px}

  /* Info / Start */
  .row{display:flex;gap:14px;margin-bottom:16px}
  .box{flex:1;border:1px solid #d8cab0;border-radius:14px;padding:14px 16px;background:#fbf6ec}
  .box h2{font-size:11pt;margin-bottom:8px;font-family:"Fraunces",Georgia,serif;font-weight:900;color:#2b2620}
  .box ol{margin:0 0 0 18px}
  .box li{margin-bottom:5px;padding-left:2px}
  .start b{font-size:11.5pt}

  /* Stationen */
  .station{border:1px solid #d8cab0;border-radius:14px;padding:16px 18px;margin-bottom:14px;background:#fff;page-break-inside:avoid;break-inside:avoid}
  .st-head{display:flex;align-items:flex-start;gap:13px;margin-bottom:10px}
  .st-num{flex:none;width:32px;height:32px;border-radius:50%;background:#2b2620;color:#f3ebdb;font-family:"Fraunces",Georgia,serif;font-weight:900;font-size:14pt;display:flex;align-items:center;justify-content:center}
  .st-title{flex:1}
  .st-title h3{font-family:"Fraunces",Georgia,serif;font-weight:900;font-size:14pt;line-height:1.2}
  .st-area{font-size:8.5pt;color:#7a6f5f;margin-top:3px}
  .st-stamp{flex:none;text-align:center;border:1.5px dashed #9c2c1f;border-radius:10px;padding:5px 10px;min-width:56px}
  .stamp-field{height:26px}
  .stamp-label{font-size:6.5pt;color:#7a6f5f;line-height:1.15;margin-top:3px}
  .st-loc{font-size:8.5pt;color:#5a5142;margin:4px 0 10px;word-break:break-all}
  .intro{margin-bottom:5px}
  .tasks{list-style:none;margin:10px 0 8px}
  .tasks li{display:flex;gap:9px;align-items:flex-start;margin-bottom:8px}
  .chk{flex:none;width:14px;height:14px;border:1.5px solid #2b2620;border-radius:4px;margin-top:2px}
  .tag{display:inline-block;font-size:7.5pt;font-weight:700;background:#2b2620;color:#fff;border-radius:999px;padding:2px 9px;margin-bottom:4px}
  .tag.photo{background:#9c2c1f}
  .fact{font-size:9pt;background:#fdf6e3;border-left:3px solid #b07d2b;padding:8px 12px;border-radius:0 8px 8px 0;margin-top:8px;line-height:1.5}

  /* Rätsel */
  .puzzle{border:2.5px solid #2b2620;border-radius:16px;padding:16px 20px;margin-top:8px;background:#fbf6ec;page-break-inside:avoid}
  .puzzle h2{font-family:"Fraunces",Georgia,serif;font-weight:900;font-size:15pt;margin-bottom:8px}
  .puzzle p{margin-bottom:3px}
  .lrow{display:flex;gap:10px;margin:14px 0}
  .lbox{width:36px;height:44px;border:2px solid #2b2620;border-radius:8px;background:#fff}
  .hint{margin-top:12px;border:1px dashed #d8cab0;border-radius:10px;padding:10px 14px;background:#fff;font-size:9pt;color:#5a5142;line-height:1.5}

  .foot{margin-top:16px;text-align:center;font-size:8pt;color:#9a927c}`;
}

/* Wandelt CSS aus groupSheetCSS() so um, dass sie mit html2canvas kompatibel ist:
   html2canvas klont beim Rendern eines einzelnen Elements NUR dessen Teilbaum,
   nicht seine echten Vorfahren. Selektoren, die einen externen Wrapper als
   Vorfahren voraussetzen, greifen deshalb nie. Darum werden die globalen
   Reset-Regeln (*, body) hier auf die tatsächliche Klon-Wurzel ".sheet" bezogen;
   alle anderen (bereits eindeutigen) Klassen-Selektoren bleiben unverändert. */
function groupSheetCaptureCSS(){
  let css = groupSheetCSS();
  css = css.replace(/@page[^{]*\{[^{}]*\}/g, "");
  css = css.replace(/@media print\s*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, "");
  return css.replace(/([^{}]+)\{([^{}]*)\}/g, (m, sel, decls) => {
    const scoped = sel.split(",").map(s=>{
      s = s.trim();
      if(!s) return s;
      if(s === "*") return ".sheet, .sheet *";
      if(s === "body") return ".sheet";
      return s;
    }).join(", ");
    return `${scoped}{${decls}}`;
  })
  // Im PDF liefert der html2pdf-Rand bereits den Seitenabstand; die eigene
  // Aussenpolsterung von .sheet wuerde ihn oben zusaetzlich verdoppeln.
  + `\n.sheet{max-width:none;width:100%;margin:0;padding:0}`;
}

/* Inhalt (.sheet) einer Gruppe – gemeinsam für Druck & PDF */
function groupSheetInner(group){
  const idx = GROUPS.indexOf(group);
  const stations = group.order.map((sid,i)=>{
    const s = STATIONS.find(x=>x.id===sid);
    return buildStationBlock(s, i+1);
  }).join("");
  const letterBoxes = group.order.map(()=>`<span class="lbox"></span>`).join("");

  return `
  <div class="sheet">
    <div class="head" style="border-color:${group.color}">
      <div class="emoji">${group.emoji}</div>
      <div class="ht">
        <div class="event">München Stadtrallye · Deutsch-Japanischer Sportjugend-Austausch</div>
        <h1>Gruppe ${idx+1}: ${esc(group.name.de)}<span class="ja-inline">グループ${idx+1}：${esc(group.name.ja)}</span></h1>
      </div>
      <div class="access">
        <div class="qrwrap">
          ${qrHTML(APP_URL, { module:3, quiet:4 })}
          <div class="ql">Web-App öffnen<br><span class="ja-inline">アプリを開く</span></div>
        </div>
        <div class="codebox">
          <div class="cl">Anmeldecode</div>
          <div class="cc">${esc(group.code)}</div>
          <div class="cu">${esc(APP_URL.replace(/^https:\/\//, ""))}</div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="box">
        <h2>So funktioniert's</h2>
        <ol>
          <li>Start am <b>Marienplatz</b> (Fischbrunnen). Besucht die Stationen in der unten gedruckten Reihenfolge.</li>
          <li>An jeder Station: Info lesen, Aufgaben (✏️/📷) erledigen und abhaken.</li>
          <li>Holt euch je Station einen <b>Stempel-Buchstaben</b>. Kurze ÖPNV-Fahrten erlaubt.</li>
          <li>Am Ende habt ihr 6 Buchstaben — löst das große Rätsel!</li>
        </ol>
      </div>
      <div class="box start">
        <h2>Start / スタート</h2>
        <b>Marienplatz</b><br>
        Treffpunkt aller Gruppen am Fischbrunnen.<br>
        <span class="ja">全グループの集合場所：魚の噴水のそば。</span>
        <div style="margin-top:8px;font-size:8.5pt;color:#5a5142">📋 Backup-Ausdruck — nutzbar ohne App/Handy.</div>
      </div>
    </div>

    ${stations}

    <div class="puzzle">
      <h2>🧩 Das große Rätsel / 最後の謎</h2>
      <p>Sammelt an allen 6 Stationen je einen Buchstaben. Ordnet die Buchstaben zum Lösungswort.</p>
      <p class="ja">6つのスポットで文字を集め、並べ替えて答えの言葉を作ろう。</p>
      <div class="lrow">${letterBoxes}</div>
      <div class="hint">🔎 Das Lösungswort wird <b>nur in der App</b> eingegeben &amp; geprüft — hier steht es bewusst nicht, um nicht zu spoilern.<br>
      <span class="ja">答えの言葉はアプリでのみ入力・確認します（ネタバレ防止のため紙には記載なし）。</span></div>
    </div>

    <div class="foot">München Stadtrallye · Gruppe ${esc(group.name.de)} · Anmeldecode ${esc(group.code)} · Backup-Ausdruck</div>
  </div>`;
}

/* Bildschirm-/Druckversion mit Toolbar & Auto-Print-Dialog */
function buildGroupPrintHTML(group){
  const fileTitle = `Spielanleitung_${group.name.de}_Code-${group.code}`;
  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<title>${esc(fileTitle)}</title>
${PRINT_FONTS_LINK}
<style>${groupSheetCSS()}</style>
</head>
<body>
  <div class="toolbar">
    <b>🖨️ Spielanleitung — ${esc(group.name.de)}</b>
    <span>Im Druckdialog „Als PDF speichern“ wählen.</span>
    <button onclick="window.print()">Drucken / Als PDF speichern</button>
  </div>

  ${groupSheetInner(group)}

  <script>
    document.title = ${JSON.stringify(buildGroupPrintHTML_title(group))};
    window.addEventListener("load", function(){ setTimeout(function(){ try{ window.print(); }catch(e){} }, 350); });
  <\/script>
</body>
</html>`;
}

/* Reine PDF-Version (ohne Toolbar, ohne Auto-Print) – für den ZIP-Export */
function buildGroupPdfHTML(group){
  const fileTitle = `Spielanleitung_${group.name.de}_Code-${group.code}`;
  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<title>${esc(fileTitle)}</title>
${PRINT_FONTS_LINK}
<style>${groupSheetCSS()}</style>
</head>
<body>${groupSheetInner(group)}</body>
</html>`;
}

/* Dateiname-Vorschlag fürs „Als PDF speichern“ */
function buildGroupPrintHTML_title(group){
  return `Spielanleitung – ${group.name.de} (Code ${group.code})`;
}

function openGroupPrint(groupId){
  if(typeof GROUPS === "undefined" || typeof STATIONS === "undefined"){
    alert("Spieldaten nicht geladen (game-data.js fehlt)."); return;
  }
  const group = GROUPS.find(g=>g.id===groupId);
  if(!group){ alert("Gruppe nicht gefunden: "+groupId); return; }
  const w = window.open("", "_blank");
  if(!w){ alert("Pop-up wurde blockiert. Bitte Pop-ups für diese Seite erlauben."); return; }
  w.document.open();
  w.document.write(buildGroupPrintHTML(group));
  w.document.close();
}
