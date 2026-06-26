/* ===================== Operator-Dashboard ===================== */
const GROUP_META = [
  { id:"loewen",  emoji:"🦁", color:"#4d9be6", name:"Löwen" },
  { id:"adler",   emoji:"🦅", color:"#e0664f", name:"Adler" },
  { id:"eisbach", emoji:"🌊", color:"#3fb6b6", name:"Eisbach" },
  { id:"olympia", emoji:"🔥", color:"#5bbd6e", name:"Olympia" },
  { id:"isar",    emoji:"🚣", color:"#9aa7d6", name:"Isar" }
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
if(sessionStorage.getItem("op_ok")==="1") unlock();

/* ---------- Dashboard ---------- */
let map = null, markers = {}, dbInitDone = false;

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
    renderGroups({}); return;
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

    document.getElementById("wipeBtn").addEventListener("click", ()=>{
      if(confirm("Wirklich ALLE Rallye-Daten (Fortschritt + Standorte) löschen?")){
        db.ref("rallye").remove();
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
    </div>`;
  }).join("");

  if(map) updateMarkers(data);
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
