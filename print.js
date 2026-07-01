/* ===================== Druckbare A4-Spielanleitung pro Gruppe =====================
   Backup-Lösung: enthält Anmeldecode + komplettes Spiel (alle Stationen in der
   Reihenfolge der Gruppe, zweisprachig), falls die mobile App ausfällt.
   Nutzt STATIONS / GROUPS / SOLUTION aus game-data.js. */

function esc(s){
  return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}

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

function buildGroupPrintHTML(group){
  const idx = GROUPS.indexOf(group);
  const stations = group.order.map((sid,i)=>{
    const s = STATIONS.find(x=>x.id===sid);
    return buildStationBlock(s, i+1);
  }).join("");

  const letterBoxes = group.order.map(()=>`<span class="lbox"></span>`).join("");
  const fileTitle = `Spielanleitung_${group.name.de}_Code-${group.code}`;

  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<title>${esc(fileTitle)}</title>
<style>
  @page { size: A4; margin: 14mm 14mm 16mm; }
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:"Helvetica Neue",Arial,system-ui,sans-serif;color:#16140f;font-size:10.5pt;line-height:1.42;background:#fff}
  .ja{color:#4a4636;font-size:9.5pt}
  .ja-inline{color:#6a6450;font-weight:400;font-size:.86em}

  /* Toolbar nur am Bildschirm */
  .toolbar{position:sticky;top:0;background:#211e17;color:#f3ebdb;padding:10px 16px;display:flex;gap:12px;align-items:center;font-size:10pt}
  .toolbar b{font-size:11pt}
  .toolbar button{margin-left:auto;background:#e0664f;color:#fff;border:0;border-radius:8px;padding:9px 16px;font-size:10.5pt;font-weight:700;cursor:pointer}
  @media print { .toolbar{display:none} }

  .sheet{max-width:182mm;margin:0 auto;padding:6mm 0}

  /* Kopf */
  .head{border:2px solid #16140f;border-radius:10px;padding:12px 16px;display:flex;align-items:center;gap:14px;margin-bottom:12px}
  .head .emoji{font-size:34pt;line-height:1}
  .head .ht{flex:1}
  .head .event{font-size:9pt;letter-spacing:.04em;text-transform:uppercase;color:#7a7460}
  .head h1{font-family:Georgia,"Times New Roman",serif;font-size:22pt;line-height:1.05;margin:1px 0}
  .head h1 .ja-inline{display:block;font-size:11pt;margin-top:2px}
  .codebox{border:2px solid #e0664f;border-radius:10px;padding:8px 14px;text-align:center;min-width:118px}
  .codebox .cl{font-size:8pt;text-transform:uppercase;letter-spacing:.08em;color:#b5402c}
  .codebox .cc{font-family:Georgia,serif;font-size:24pt;font-weight:700;letter-spacing:.14em;color:#16140f}

  /* Info / Start */
  .row{display:flex;gap:10px;margin-bottom:12px}
  .box{flex:1;border:1px solid #c9bea4;border-radius:9px;padding:9px 12px;background:#faf6ec}
  .box h2{font-size:10pt;margin-bottom:4px;font-family:Georgia,serif}
  .box ol{margin:0 0 0 16px}
  .box li{margin-bottom:2px}
  .start b{font-size:11pt}

  /* Stationen */
  .station{border:1px solid #c9bea4;border-radius:10px;padding:11px 13px;margin-bottom:10px;page-break-inside:avoid;break-inside:avoid}
  .st-head{display:flex;align-items:flex-start;gap:11px;margin-bottom:6px}
  .st-num{flex:none;width:30px;height:30px;border-radius:50%;background:#16140f;color:#fff;font-family:Georgia,serif;font-weight:700;font-size:14pt;display:flex;align-items:center;justify-content:center}
  .st-title{flex:1}
  .st-title h3{font-family:Georgia,serif;font-size:13.5pt;line-height:1.1}
  .st-area{font-size:8.5pt;color:#7a7460;margin-top:1px}
  .st-stamp{flex:none;text-align:center;border:1.5px dashed #b5402c;border-radius:8px;padding:3px 8px;min-width:54px}
  .stamp-field{height:24px}
  .stamp-label{font-size:6.5pt;color:#7a7460;line-height:1.05;margin-top:2px}
  .st-loc{font-size:8.5pt;color:#56503f;margin:2px 0 6px;word-break:break-all}
  .intro{margin-bottom:3px}
  .tasks{list-style:none;margin:7px 0 6px}
  .tasks li{display:flex;gap:8px;align-items:flex-start;margin-bottom:5px}
  .chk{flex:none;width:13px;height:13px;border:1.5px solid #16140f;border-radius:3px;margin-top:2px}
  .tag{display:inline-block;font-size:7.5pt;font-weight:700;background:#16140f;color:#fff;border-radius:4px;padding:1px 6px;margin-bottom:2px}
  .tag.photo{background:#b5402c}
  .fact{font-size:9pt;background:#fdf6e3;border-left:3px solid #d6a94b;padding:5px 9px;border-radius:0 6px 6px 0;margin-top:5px}

  /* Rätsel */
  .puzzle{border:2px solid #16140f;border-radius:10px;padding:12px 15px;margin-top:4px;page-break-inside:avoid}
  .puzzle h2{font-family:Georgia,serif;font-size:14pt;margin-bottom:5px}
  .lrow{display:flex;gap:8px;margin:10px 0}
  .lbox{width:34px;height:42px;border:2px solid #16140f;border-radius:6px}
  .hint{margin-top:10px;border:1px dashed #c9bea4;border-radius:8px;padding:7px 11px;background:#faf6ec;font-size:9pt;color:#56503f}

  .foot{margin-top:10px;text-align:center;font-size:8pt;color:#9a927c}
</style>
</head>
<body>
  <div class="toolbar">
    <b>🖨️ Spielanleitung — ${esc(group.name.de)}</b>
    <span>Im Druckdialog „Als PDF speichern“ wählen.</span>
    <button onclick="window.print()">Drucken / Als PDF speichern</button>
  </div>

  <div class="sheet">
    <div class="head" style="border-color:${group.color}">
      <div class="emoji">${group.emoji}</div>
      <div class="ht">
        <div class="event">München Stadtrallye · Deutsch-Japanischer Sportjugend-Austausch</div>
        <h1>Gruppe ${idx+1}: ${esc(group.name.de)}<span class="ja-inline">グループ${idx+1}：${esc(group.name.ja)}</span></h1>
      </div>
      <div class="codebox">
        <div class="cl">Anmeldecode</div>
        <div class="cc">${esc(group.code)}</div>
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
        <div style="margin-top:5px;font-size:8.5pt;color:#56503f">📋 Backup-Ausdruck — nutzbar ohne App/Handy.</div>
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
  </div>

  <script>
    document.title = ${JSON.stringify(buildGroupPrintHTML_title(group))};
    window.addEventListener("load", function(){ setTimeout(function(){ try{ window.print(); }catch(e){} }, 350); });
  <\/script>
</body>
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
