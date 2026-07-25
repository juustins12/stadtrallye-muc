/* ===================== Operator-Dashboard ===================== */
const GROUP_META = [
  { id:"loewen",  emoji:"🦁", color:"#4d9be6", name:"Löwen",   code:"1860" },
  { id:"adler",   emoji:"🦅", color:"#e0664f", name:"Adler",   code:"1900" },
  { id:"eisbach", emoji:"🌊", color:"#3fb6b6", name:"Eisbach", code:"2020" },
  { id:"olympia", emoji:"🔥", color:"#5bbd6e", name:"Olympia", code:"1972" },
  { id:"isar",    emoji:"🚣", color:"#9aa7d6", name:"Isar",    code:"2026" }
];
const TOTAL_STAMPS = 6;
const STATION_LETTERS = ["K","I","Z","U","N","A"]; // s1..s6

/* ---------- Gate ---------- */
const gate = document.getElementById("gate");
const dash = document.getElementById("dash");
function unlock(){ gate.style.display="none"; dash.style.display="block"; initDashboard(); }
function tryCode(){
  const v = (document.getElementById("codeInput").value||"").trim();
  if(typeof OPERATOR_CODE!=="undefined" && v===OPERATOR_CODE){
    sessionStorage.setItem("op_ok","1"); unlock();
  } else {
    document.getElementById("codeErr").textContent = "Falscher Code.";
  }
}
document.getElementById("codeBtn").addEventListener("click", tryCode);
document.getElementById("codeInput").addEventListener("keydown", e=>{ if(e.key==="Enter") tryCode(); });
document.getElementById("logoutBtn").addEventListener("click", ()=>{ sessionStorage.removeItem("op_ok"); location.reload(); });
document.getElementById("zipBtn").addEventListener("click", downloadAllDocsZip);
if(sessionStorage.getItem("op_ok")==="1") unlock();

/* ---------- Alle Dokumente als PDF-ZIP ---------- */
async function downloadAllDocsZip(){
  const btn = document.getElementById("zipBtn");
  if(typeof JSZip==="undefined" || typeof html2pdf==="undefined"){
    alert("PDF-/ZIP-Bibliothek nicht geladen. Bitte Internetverbindung prüfen und Seite neu laden."); return;
  }
  if(typeof GROUPS==="undefined" || typeof buildGroupPdfHTML!=="function"){
    alert("Spieldaten/Druckmodul nicht geladen."); return;
  }
  const orig = btn.textContent;
  const set = t => { btn.textContent = t; };
  btn.disabled = true;
  try{
    const zip = new JSZip();

    // 1) Allgemeine Spielanleitung + Technische Anleitung (statische PDFs im Web-Root)
    set("Lade Spielanleitung…");
    try{
      const res = await fetch("Stadtrallye_Spielanleitung.pdf", { cache:"no-store" });
      if(res.ok) zip.file("00_Spielanleitung.pdf", await res.blob());
    }catch(e){ /* zur Not ohne allgemeine Anleitung fortfahren */ }
    try{
      const res = await fetch("Stadtrallye_Technische_Anleitung.pdf", { cache:"no-store" });
      if(res.ok) zip.file("01_Technische_Anleitung.pdf", await res.blob());
    }catch(e){ /* zur Not ohne technische Anleitung fortfahren */ }

    // 2) Gruppen-Dokumente einzeln als PDF rendern
    for(let i=0;i<GROUPS.length;i++){
      const g = GROUPS[i];
      set(`Gruppe ${i+1}/${GROUPS.length}…`);
      const blob = await groupPdfBlob(g);
      const safe = String(g.name.de)
        .replace(/ä/g,"ae").replace(/ö/g,"oe").replace(/ü/g,"ue").replace(/ß/g,"ss")
        .replace(/[^\w]+/g, "-");
      zip.file(`Gruppe-${i+1}_${safe}_Code-${g.code}.pdf`, blob);
    }

    set("Packe ZIP…");
    const out = await zip.generateAsync({ type:"blob" });
    const url = URL.createObjectURL(out);
    const a = document.createElement("a");
    a.href = url; a.download = "Muenchen-Stadtrallye_Dokumente.zip";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(url), 5000);
  }catch(e){
    alert("Fehler beim Erstellen der ZIP: " + (e && e.message ? e.message : e));
  }finally{
    btn.disabled = false;
    btn.textContent = orig;
  }
}

/* Rendert eine Gruppe zu einem PDF-Blob.
   Wichtig: html2canvas klont beim Rendern eines einzelnen Elements nur dessen
   eigenen Teilbaum, NICHT seine echten Vorfahren (auch nicht über ein iframe
   hinweg). Ein separates Dokument (iframe) führt deshalb dazu, dass html2canvas
   nur die Stylesheets der aufrufenden Seite (operator.html, dunkles Theme)
   wiederfindet und das Layout/Farben komplett falsch rendert. Der Inhalt wird
   daher direkt im Hauptdokument aufgebaut, mit CSS, das auf ".sheet" (die
   tatsächliche Klon-Wurzel) statt auf einen externen Wrapper bezogen ist
   (siehe groupSheetCaptureCSS() in print.js). */
async function groupPdfBlob(group){
  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  // Host NICHT nach left:-10000px schieben: html2canvas rechnet die Position des
  // Elements in den Canvas ein, bei scale:2 verdoppelt. Der Bogen landet dann
  // verschoben im Canvas und wird rechts abgeschnitten. Stattdessen bleibt der
  // Host bei 0/0 und wird ueber height:0 + overflow:hidden unsichtbar gemacht;
  // die Kindelemente behalten dabei ihre korrekten Layout-Masse.
  // Breite exakt = .sheet-Breite (180mm), damit "margin:0 auto" keinen
  // horizontalen Versatz erzeugt.
  host.style.cssText = "position:fixed;left:0;top:0;width:180mm;height:0;overflow:hidden;background:#fff";
  document.body.appendChild(host);
  try{
    host.innerHTML = `<style>${groupSheetCaptureCSS()}</style>` + groupSheetInner(group);
    // Layout & (Emoji-/Web-)Fonts abwarten. Kein requestAnimationFrame: das
    // Fenster kann im Hintergrund sein (Tab nicht sichtbar), dann feuert rAF nie.
    if(document.fonts && document.fonts.ready){ try{ await document.fonts.ready; }catch(e){} }
    await new Promise(r=>setTimeout(r, 200));
    const el = host.querySelector(".sheet");
    const opt = {
      // Ränder wie im Druck-Stylesheet (@page: 16mm 15mm 18mm). Damit bleibt der
      // Inhalt innerhalb des nicht bedruckbaren Randes ueblicher Buero-Drucker
      // (meist 5-10mm, Sicherheitsreserve bis ~12,7mm/0,5"). Die Inhaltsbreite
      // betraegt so 210-15-15 = 180mm und entspricht exakt .sheet, wird also 1:1
      // uebernommen statt skaliert.
      margin:      [16, 15, 18, 15],
      image:       { type:"jpeg", quality:0.98 },
      html2canvas: { scale:2, useCORS:true, backgroundColor:"#ffffff" },
      jsPDF:       { unit:"mm", format:"a4", orientation:"portrait" },
      pagebreak:   { mode:["css","legacy"] }
    };
    return await html2pdf().set(opt).from(el).outputPdf("blob");
  }finally{
    host.remove();
  }
}

/* ---------- Dashboard ---------- */
var map = null, markers = {}, dbInitDone = false;

function initDashboard(){
  if(dbInitDone) return; dbInitDone = true;

  // Map
  map = L.map("map", { zoomControl:true }).setView([48.137, 11.576], 14); // Marienplatz
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom:19, attribution:"© OpenStreetMap"
  }).addTo(map);

  // Firebase
  const dot = document.getElementById("connDot");
  const status = document.getElementById("connStatus");
  if(typeof firebase==="undefined" || typeof FIREBASE_CONFIG==="undefined"
     || !FIREBASE_CONFIG.apiKey || FIREBASE_CONFIG.apiKey.startsWith("DEIN")){
    dot.classList.add("off"); status.textContent = "Keine Firebase-Config";
    renderGroups({}); renderGallery({}); return;
  }
  try{
    firebase.initializeApp(FIREBASE_CONFIG);
    const db = firebase.database();
    db.ref(".info/connected").on("value", snap=>{
      const ok = snap.val()===true;
      dot.classList.toggle("off", !ok);
      status.textContent = ok ? "live verbunden" : "getrennt…";
    });
    db.ref("rallye").on("value", snap=>{ renderGroups(snap.val() || {}); });

    db.ref("rallye_photos").on("value", snap=>{ renderGallery(snap.val() || {}); });

    document.getElementById("wipeBtn").addEventListener("click", ()=>{
      if(confirm("Wirklich ALLE Rallye-Daten (Fortschritt + Standorte + Fotos) löschen?")){
        db.ref("rallye").remove();
        db.ref("rallye_photos").remove();
      }
    });
  }catch(e){
    dot.classList.add("off"); status.textContent = "Fehler: "+e.message;
  }
}

function relTime(ts){
  if(!ts) return "—";
  const sec = Math.max(0, Math.round((Date.now()-ts)/1000));
  if(sec<60) return "gerade eben";
  const min = Math.round(sec/60);
  if(min<60) return "vor "+min+" Min";
  return "vor "+Math.round(min/60)+" Std";
}

function renderGroups(data){
  const grid = document.getElementById("groupGrid");
  grid.innerHTML = GROUP_META.map(m=>{
    const d = data[m.id];
    const stamps = d ? (d.stamps||0) : 0;
    const pct = Math.round(stamps/TOTAL_STAMPS*100);
    const started = !!d;
    const stale = d && d.updatedAt && (Date.now()-d.updatedAt > 15*60*1000);
    const dots = STATION_LETTERS.map((L,i)=>{
      const on = d && d.stations && d.stations["s"+(i+1)] && d.stations["s"+(i+1)].stamped;
      return `<span class="${on?'on':''}">${L}</span>`;
    }).join("");
    const solved = d && d.solved;
    const hasLoc = d && d.loc && d.loc.lat;
    const geoTxt = hasLoc ? `📍 Standort live · ${relTime(d.loc.at)}` : "📍 kein Standort";
    return `
    <div class="gcard" style="--gc:${m.color}">
      <div class="top">
        <span class="emoji">${m.emoji}</span>
        <div>
          <h3>${m.name}</h3>
          <div class="seen ${stale?'stale':''}">${started?('aktiv · '+relTime(d.updatedAt)):'noch nicht gestartet'}</div>
        </div>
      </div>
      <div class="meter"><i style="width:${pct}%"></i></div>
      <div class="nums"><span>Stempel <b>${stamps}/${TOTAL_STAMPS}</b></span><span>${pct}%</span></div>
      <div class="dots">${dots}</div>
      <span class="badge ${solved?'solved':'pending'}">${solved?'🧩 Rätsel gelöst':'Rätsel offen'}</span>
      <div class="geo ${hasLoc?'live':''}">${geoTxt}</div>
      <div class="code">🔑 Zugangscode: <b>${m.code}</b></div>
      <button class="pdfbtn" data-pdf="${m.id}">📄 Spielanleitung als PDF (A4)</button>
    </div>`;
  }).join("");

  grid.querySelectorAll("[data-pdf]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      if(typeof openGroupPrint === "function") openGroupPrint(btn.getAttribute("data-pdf"));
      else alert("Druckmodul (print.js) nicht geladen.");
    });
  });

  if(map) updateMarkers(data);
}

/* ---------- Foto-Galerie ---------- */
var photoData = {};

function esc(s){
  return String(s).replace(/[&<>"]/g, c=>({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[c]));
}

/* "s3_1" -> { sid:3, ti:1, station, letter, stationName, taskText } */
function photoMeta(key){
  const m = /^s(\d+)_(\d+)$/.exec(key);
  const sid = m ? +m[1] : 0, ti = m ? +m[2] : 0;
  const st = (typeof STATIONS!=="undefined") ? STATIONS.find(s=>s.id===sid) : null;
  return {
    sid, ti,
    letter: st ? st.letter : "?",
    stationName: st ? st.name.de : ("Station "+sid),
    taskText: st && st.tasks && st.tasks[ti] ? st.tasks[ti].de : ("Aufgabe "+(ti+1))
  };
}

/* Sortierte Foto-Liste einer Gruppe */
function groupPhotos(gid){
  const raw = photoData[gid] || {};
  return Object.keys(raw)
    .map(k => Object.assign({ key:k, img:raw[k].img, at:raw[k].at }, photoMeta(k)))
    .filter(p => p.img)
    .sort((a,b)=> a.sid-b.sid || a.ti-b.ti);
}

function renderGallery(data){
  photoData = data || {};
  const box = document.getElementById("gallery");
  let total = 0;

  const html = GROUP_META.map(m=>{
    const list = groupPhotos(m.id);
    total += list.length;
    if(!list.length) return "";
    const thumbs = list.map(p=>`
      <button class="thumb" data-gid="${m.id}" data-key="${p.key}">
        <img src="${p.img}" alt="${esc(p.stationName)} – Aufgabe ${p.ti+1}" loading="lazy">
        <div class="cap"><b>${p.letter} · ${esc(p.stationName)}</b>Aufgabe ${p.ti+1} · ${relTime(p.at)}</div>
      </button>`).join("");
    return `
    <div class="galgroup" style="--gc:${m.color}">
      <h3>${m.emoji} ${m.name} <small>${list.length} Foto${list.length>1?'s':''}</small></h3>
      <div class="thumbs">${thumbs}</div>
    </div>`;
  }).join("");

  box.innerHTML = html || `<div class="galempty">Noch keine Fotos hochgeladen.</div>`;
  document.getElementById("photoCount").textContent = total ? `(${total} insgesamt)` : "";
  document.getElementById("photoZipBtn").disabled = total === 0;

  box.querySelectorAll(".thumb").forEach(btn=>{
    btn.addEventListener("click", ()=> openLightbox(btn.getAttribute("data-gid"), btn.getAttribute("data-key")));
  });
}

function openLightbox(gid, key){
  const p = groupPhotos(gid).find(x=>x.key===key);
  if(!p) return;
  const m = GROUP_META.find(g=>g.id===gid);
  document.getElementById("lbImg").src = p.img;
  document.getElementById("lbCap").innerHTML =
    `<b>${m.emoji} ${m.name} · ${p.letter} ${esc(p.stationName)}</b><br>${esc(p.taskText)}<br>` +
    (p.at ? new Date(p.at).toLocaleString("de-DE") : "—");
  document.getElementById("lightbox").classList.add("on");
}
function closeLightbox(){
  document.getElementById("lightbox").classList.remove("on");
  document.getElementById("lbImg").src = "";
}
document.getElementById("lbClose").addEventListener("click", closeLightbox);
document.getElementById("lightbox").addEventListener("click", e=>{ if(e.target.id==="lightbox") closeLightbox(); });
document.addEventListener("keydown", e=>{ if(e.key==="Escape") closeLightbox(); });

/* ---------- Fotos als ZIP ---------- */
function safeName(s){
  return String(s)
    .replace(/ä/g,"ae").replace(/ö/g,"oe").replace(/ü/g,"ue").replace(/ß/g,"ss")
    .replace(/Ä/g,"Ae").replace(/Ö/g,"Oe").replace(/Ü/g,"Ue")
    .replace(/[^\w]+/g,"-").replace(/^-|-$/g,"");
}

document.getElementById("photoZipBtn").addEventListener("click", downloadPhotosZip);

async function downloadPhotosZip(){
  const btn = document.getElementById("photoZipBtn");
  if(typeof JSZip==="undefined"){
    alert("ZIP-Bibliothek nicht geladen. Bitte Internetverbindung prüfen und Seite neu laden."); return;
  }
  const orig = btn.textContent;
  btn.disabled = true; btn.textContent = "Packe ZIP…";
  try{
    const zip = new JSZip();
    let n = 0;
    GROUP_META.forEach(m=>{
      groupPhotos(m.id).forEach(p=>{
        // data:image/jpeg;base64,XXXX  ->  reiner Base64-Teil für JSZip
        const b64 = String(p.img).split(",")[1];
        if(!b64) return;
        const name = `${safeName(m.name)}/S${p.sid}-${p.letter}_${safeName(p.stationName)}_Aufgabe-${p.ti+1}.jpg`;
        zip.file(name, b64, { base64:true });
        n++;
      });
    });
    if(!n){ alert("Keine Fotos vorhanden."); return; }
    const out = await zip.generateAsync({ type:"blob" });
    const url = URL.createObjectURL(out);
    const a = document.createElement("a");
    a.href = url; a.download = "Muenchen-Stadtrallye_Fotos.zip";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(url), 5000);
  }catch(e){
    alert("Fehler beim Erstellen der ZIP: " + (e && e.message ? e.message : e));
  }finally{
    btn.disabled = false; btn.textContent = orig;
  }
}

function updateMarkers(data){
  const bounds = [];
  let count = 0;
  GROUP_META.forEach(m=>{
    const d = data[m.id];
    const hasLoc = d && d.loc && d.loc.lat;
    if(hasLoc){
      count++;
      const ll = [d.loc.lat, d.loc.lng];
      bounds.push(ll);
      const html = `<div class="pin" style="background:${m.color}"><span>${m.emoji}</span></div>`;
      const icon = L.divIcon({ html, className:"", iconSize:[30,30], iconAnchor:[15,30], popupAnchor:[0,-28] });
      if(markers[m.id]){
        markers[m.id].setLatLng(ll).setIcon(icon);
      } else {
        markers[m.id] = L.marker(ll, {icon}).addTo(map);
      }
      markers[m.id].bindPopup(`<b>${m.name}</b><br>${relTime(d.loc.at)}`);
    } else if(markers[m.id]){
      map.removeLayer(markers[m.id]); delete markers[m.id];
    }
  });
  document.getElementById("locCount").textContent = count ? `(${count} Gruppe${count>1?'n':''} sichtbar)` : "(noch keine Freigabe)";
  if(bounds.length) map.fitBounds(bounds, { padding:[60,60], maxZoom:16 });
}
