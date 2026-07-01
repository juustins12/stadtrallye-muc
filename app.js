/* ============================ STATE ============================ */
/* STATIONS, GROUPS und SOLUTION kommen aus game-data.js (vor app.js geladen). */
// Testmodus: index.html?test=1 → Geofencing aus, alle Stationen offen,
// kein Gruppen-Code, rein lokal (kein Firebase-Push). Bleibt für die
// Sitzung aktiv, damit ein Reload den Test nicht abbricht.
const TEST_MODE = (()=>{
  if(new URLSearchParams(location.search).get("test") === "1"){
    sessionStorage.setItem("rally_test","1"); return true;
  }
  return sessionStorage.getItem("rally_test") === "1";
})();

let lang = localStorage.getItem("rally_lang") || "de";
let groupId = null;
let state = {};

function storeKey(){ return "rally_state_" + groupId; }
function loadState(){
  try{ state = JSON.parse(localStorage.getItem(storeKey())) || {}; }catch(e){ state = {}; }
  if(!state.stations) state.stations = {};
  STATIONS.forEach(s=>{
    if(!state.stations[s.id]) state.stations[s.id] = {stamped:false, unlocked:false, tasks:s.tasks.map(()=>false)};
    else if(state.stations[s.id].unlocked === undefined) state.stations[s.id].unlocked = !!state.stations[s.id].stamped;
  });
  if(state.solved === undefined) state.solved = false;
}
function saveState(){ localStorage.setItem(storeKey(), JSON.stringify(state)); cloudPush(); }

/* ============================ CLOUD (Firebase, optional) ============================ */
let db = null;
function cloudReady(){ return db !== null; }
function cloudInit(){
  if(TEST_MODE){ console.log("Testmodus: Cloud deaktiviert – Fortschritt nur lokal."); return; }
  try{
    if(typeof firebase !== "undefined" && typeof FIREBASE_CONFIG !== "undefined"
       && FIREBASE_CONFIG.apiKey && !FIREBASE_CONFIG.apiKey.startsWith("DEIN")){
      firebase.initializeApp(FIREBASE_CONFIG);
      db = firebase.database();
      console.log("Cloud: verbunden.");
    } else {
      console.log("Cloud: keine Config – App läuft offline (nur lokal).");
    }
  }catch(e){ console.warn("Cloud-Init fehlgeschlagen:", e); db = null; }
}
function cloudPush(){
  if(!db || !groupId) return;
  const grp = GROUPS.find(g=>g.id===groupId);
  const stamps = STATIONS.filter(s=>state.stations[s.id].stamped).length;
  const stations = {};
  STATIONS.forEach(s=>{
    const st = state.stations[s.id];
    stations["s"+s.id] = { stamped: !!st.stamped, done: st.tasks.filter(Boolean).length, total: st.tasks.length };
  });
  db.ref("rallye/"+groupId).update({
    name: grp.name.de, emoji: grp.emoji, color: grp.color,
    stamps: stamps, solved: !!state.solved, stations: stations,
    updatedAt: firebase.database.ServerValue.TIMESTAMP
  }).catch(e=>console.warn("Cloud-Push:", e));
}

/* ============================ STANDORT-FREIGABE ============================ */
let geoWatch = null;
function isSharing(){ return localStorage.getItem("rally_geo") === "1"; }
function startGeo(){
  if(!navigator.geolocation){ toast(lang==='de'?'Standort nicht verfügbar.':'位置情報を利用できません。'); setGeoChk(false); return; }
  if(geoWatch !== null) return;
  geoWatch = navigator.geolocation.watchPosition(
    pos=>{
      if(db && groupId){
        db.ref("rallye/"+groupId+"/loc").set({
          lat: pos.coords.latitude, lng: pos.coords.longitude,
          at: firebase.database.ServerValue.TIMESTAMP
        }).catch(()=>{});
      }
    },
    err=>{ toast(lang==='de'?'Standort-Zugriff abgelehnt.':'位置情報が拒否されました。'); setGeoChk(false); stopGeoWatch(); localStorage.setItem("rally_geo","0"); },
    { enableHighAccuracy:true, maximumAge:8000, timeout:20000 }
  );
}
function stopGeoWatch(){ if(geoWatch!==null){ navigator.geolocation.clearWatch(geoWatch); geoWatch=null; } }
function setLocationSharing(on){
  localStorage.setItem("rally_geo", on?"1":"0");
  if(on){ startGeo(); toast(lang==='de'?'Standort wird geteilt.':'位置情報を共有中。'); }
  else{ stopGeoWatch(); if(db && groupId) db.ref("rallye/"+groupId+"/loc").remove().catch(()=>{}); toast(lang==='de'?'Standort-Freigabe beendet.':'位置情報の共有を停止。'); }
}
function setGeoChk(v){ const c=document.getElementById("geoChk"); if(c) c.checked=v; }

/* ============================ STANDORT-FREISCHALTUNG (200 m) ============================ */
const UNLOCK_RADIUS_M = 200;
let proximityWatch = null;

function haversine(lat1,lng1,lat2,lng2){
  const R = 6371000, toRad = d=>d*Math.PI/180;
  const dLat = toRad(lat2-lat1), dLng = toRad(lng2-lng1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLng/2)**2;
  return 2*R*Math.asin(Math.sqrt(a));
}
function openStationIds(){
  return [...document.querySelectorAll(".station.open")].map(el=>+el.id.replace("station-",""));
}
function reopenStations(ids){ ids.forEach(id=>{ const el=document.getElementById("station-"+id); if(el) el.classList.add("open"); }); }
function anyLockedOpenStation(){
  return STATIONS.some(s=>{
    const st = state.stations[s.id];
    const el = document.getElementById("station-"+s.id);
    return st && !st.unlocked && el && el.classList.contains("open");
  });
}
function ensureProximityWatch(){
  if(proximityWatch !== null) return;
  if(!navigator.geolocation){
    STATIONS.forEach(s=>{ const d=document.getElementById("dist-"+s.id); if(d) d.innerHTML = lang==='de'?'Standort nicht verfügbar.':'位置情報が利用できません。'; });
    return;
  }
  proximityWatch = navigator.geolocation.watchPosition(onProximityPos, onProximityErr, { enableHighAccuracy:true, maximumAge:5000, timeout:20000 });
}
function stopProximityWatch(){ if(proximityWatch!==null){ navigator.geolocation.clearWatch(proximityWatch); proximityWatch=null; } }

function onProximityPos(pos){
  let stillLocked = false;
  const justUnlocked = [];
  STATIONS.forEach(s=>{
    const st = state.stations[s.id];
    if(!st || st.unlocked) return;
    const el = document.getElementById("station-"+s.id);
    if(!el || !el.classList.contains("open")){ stillLocked = true; return; }
    const dist = haversine(pos.coords.latitude, pos.coords.longitude, s.lat, s.lng);
    const buffer = Math.min(pos.coords.accuracy || 0, 50);
    if((dist - buffer) <= UNLOCK_RADIUS_M){
      st.unlocked = true;
      justUnlocked.push(s.id);
    } else {
      stillLocked = true;
      const distEl = document.getElementById("dist-"+s.id);
      if(distEl){
        const m = Math.round(dist);
        distEl.innerHTML = (lang==='de' ? `📡 noch ca. ${m} m entfernt` : `📡 残り約 ${m} m`);
      }
    }
  });
  if(justUnlocked.length){
    saveState();
    const openIds = openStationIds();
    renderRoute();
    reopenStations(openIds);
    justUnlocked.forEach(sid=>{
      const s = STATIONS.find(x=>x.id===sid);
      toast(lang==='de' ? `Station „${s.name.de}“ freigeschaltet!` : `「${s.name.ja}」のロックが解除されました！`);
    });
  }
  if(!stillLocked) stopProximityWatch();
}
function onProximityErr(){
  STATIONS.forEach(s=>{
    const st = state.stations[s.id];
    const el = document.getElementById("station-"+s.id);
    if(st && !st.unlocked && el && el.classList.contains("open")){
      const distEl = document.getElementById("dist-"+s.id);
      if(distEl) distEl.innerHTML = lang==='de' ? '⚠ Standort-Zugriff nötig – bitte erlauben.' : '⚠ 位置情報へのアクセスを許可してください。';
    }
  });
}

/* ============================ FOTO-UPLOAD ============================ */
function handlePhotoFile(sid, ti, file){
  if(!file) return;
  const statusEl = document.getElementById(`phstatus-${sid}-${ti}`);
  if(statusEl) statusEl.textContent = lang==='de' ? 'Lade hoch…' : 'アップロード中…';
  const reader = new FileReader();
  reader.onload = ()=>{
    const img = new Image();
    img.onload = ()=>{
      const maxDim = 900;
      const scale = Math.min(1, maxDim/Math.max(img.width, img.height));
      const w = Math.round(img.width*scale), h = Math.round(img.height*scale);
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
      savePhoto(sid, ti, dataUrl, statusEl);
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}
function savePhoto(sid, ti, dataUrl, statusEl){
  state.stations[sid].tasks[ti] = true;
  saveState();
  const li = document.querySelector(`li[data-sid="${sid}"][data-ti="${ti}"]`);
  if(li){ li.classList.add("checked"); const box=li.querySelector(".box"); if(box) box.textContent="✓"; }
  if(db && groupId){
    db.ref(`rallye_photos/${groupId}/s${sid}_${ti}`).set({
      img: dataUrl, at: firebase.database.ServerValue.TIMESTAMP
    }).then(()=>{ if(statusEl) statusEl.textContent = lang==='de'?'✓ hochgeladen':'✓ アップロード済み'; })
      .catch(e=>{ if(statusEl) statusEl.textContent = lang==='de'?'Fehler beim Hochladen':'アップロード失敗'; console.warn("Foto-Upload:", e); });
  } else if(statusEl){
    statusEl.textContent = lang==='de'?'✓ gespeichert (offline)':'✓ 保存済み（オフライン）';
  }
}

/* ============================ GRUPPEN-ZUGANGSCODE ============================ */
let pendingGroupId = null;
function openCodeModal(id){
  pendingGroupId = id;
  const grp = GROUPS.find(g=>g.id===id);
  document.getElementById("ccEmoji").textContent = grp.emoji;
  document.getElementById("ccTitle").textContent = grp.name[lang];
  document.getElementById("codeAnswer").value = "";
  document.getElementById("codeAnswerErr").textContent = "";
  document.getElementById("codeModal").classList.add("show");
  setTimeout(()=>document.getElementById("codeAnswer").focus(), 50);
}
function closeCodeModal(){ document.getElementById("codeModal").classList.remove("show"); pendingGroupId = null; }
function confirmCode(){
  if(!pendingGroupId) return;
  const grp = GROUPS.find(g=>g.id===pendingGroupId);
  const val = (document.getElementById("codeAnswer").value || "").trim();
  if(val === grp.code){
    localStorage.setItem("rally_code_ok_"+grp.id, "1");
    closeCodeModal();
    pickGroup(grp.id);
  } else {
    document.getElementById("codeAnswerErr").textContent = lang==='de' ? "Falscher Code für diese Gruppe." : "このグループのコードと違います。";
  }
}

/* ============================ NAV ============================ */
function show(id){
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  document.getElementById("homeBtn").hidden = (id === "screen-welcome");
  window.scrollTo({top:0, behavior:"smooth"});
}

function setLang(l){
  lang = l;
  document.body.classList.toggle("ja", l === "ja");
  document.getElementById("btn-de").classList.toggle("active", l === "de");
  document.getElementById("btn-ja").classList.toggle("active", l === "ja");
  localStorage.setItem("rally_lang", l);
  if(groupId) renderRoute();
}

/* ============================ RENDER: groups ============================ */
function renderGroups(){
  const g = document.getElementById("groupGrid");
  g.innerHTML = GROUPS.map((grp,i)=>`
    <button class="gcard" style="--gc:${grp.color}" data-act="group" data-id="${grp.id}">
      <span class="bar"></span>
      <div class="emoji">${grp.emoji}</div>
      <div class="gnum"><span data-de>Gruppe ${i+1}</span><span data-ja>グループ${i+1}</span></div>
      <h3>${grp.name[lang]}</h3>
      <div class="go"><span data-de>Route starten</span><span data-ja>ルート開始</span> →</div>
    </button>`).join("");
}

function selectGroup(id){
  if(TEST_MODE || localStorage.getItem("rally_code_ok_"+id) === "1"){ pickGroup(id); }
  else { openCodeModal(id); }
}

function pickGroup(id){
  groupId = id;
  loadState();
  cloudPush();                 // Gruppe sofort im Operator-Dashboard sichtbar machen
  renderRoute();
  show("screen-route");
  setGeoChk(isSharing());
  if(isSharing()) startGeo();  // Standort-Freigabe nach Neuladen fortsetzen
}

/* ============================ RENDER: route ============================ */
function renderRoute(){
  const grp = GROUPS.find(g=>g.id===groupId);
  const idx = GROUPS.indexOf(grp);
  const ghead = document.getElementById("ghead");
  ghead.style.setProperty("--gc", grp.color);
  ghead.innerHTML = `
    <div class="emoji">${grp.emoji}</div>
    <div>
      <div class="sub"><span data-de>Gruppe ${idx+1}</span><span data-ja>グループ${idx+1}</span></div>
      <h2>${grp.name[lang]}</h2>
    </div>`;

  const list = document.getElementById("stationList");
  list.innerHTML = grp.order.map((sid,pos)=>{
    const s = STATIONS.find(x=>x.id===sid);
    const st = state.stations[sid];
    const complete = st.stamped;
    const locked = !st.unlocked && !TEST_MODE;
    const tasks = s.tasks.map((t,ti)=>{
      const done = st.tasks[ti];
      if(t.photo){
        return `
        <li class="phototask ${done?'checked':''}" data-sid="${sid}" data-ti="${ti}">
          <div class="toprow">
            <span class="box">${done?'✓':''}</span>
            <span class="tag photo">📷 Foto</span>
            <span>${t[lang]}</span>
          </div>
          <div class="photoUp">
            <input type="file" accept="image/*" capture="environment" id="ph-${sid}-${ti}" data-photo-input data-sid="${sid}" data-ti="${ti}" hidden>
            <label class="photoBtn" for="ph-${sid}-${ti}">
              <span data-de>${done?'Foto ersetzen':'Foto hochladen'}</span>
              <span data-ja>${done?'写真を変更':'写真をアップロード'}</span>
            </label>
            <span class="photoStatus" id="phstatus-${sid}-${ti}">${done?(lang==='de'?'✓ hochgeladen':'✓ アップロード済み'):''}</span>
          </div>
        </li>`;
      }
      return `
      <li class="${done?'checked':''}" data-act="task" data-sid="${sid}" data-ti="${ti}">
        <span class="box">${done?'✓':''}</span>
        <span>${t[lang]}</span>
      </li>`;
    }).join("");
    const stampLabel = complete
      ? (lang==='de'?'✓ Stempel erhalten':'✓ スタンプ取得')
      : (lang==='de'?('Stempel holen ('+s.letter+')'):('スタンプを押す ('+s.letter+')'));
    const body = locked ? `
        <div class="lockbox" id="lock-${sid}">
          <div class="lockicon">🔒</div>
          <p data-de>Kommt auf ca. 200 m an „${s.name.de}“ heran, um die Aufgaben freizuschalten.</p>
          <p data-ja>「${s.name.ja}」の半径約200m以内に来ると、課題が表示されます。</p>
          <div class="distinfo" id="dist-${sid}">
            <span data-de>📡 Standort wird geprüft…</span><span data-ja>📡 位置情報を確認中…</span>
          </div>
          <a class="maplink" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.map)}"><span data-de>Karte öffnen</span><span data-ja>地図を開く</span></a>
        </div>` : `
        <p class="intro">${s.intro[lang]}</p>
        <span class="why" data-de>Aufgaben</span><span class="why" data-ja>課題</span>
        <ul class="tasks">${tasks}</ul>
        <div class="fact-mini">💡 ${s.fact[lang]}</div>
        <div class="st-actions">
          <a class="maplink" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.map)}"><span data-de>Karte öffnen</span><span data-ja>地図を開く</span></a>
          <button class="stampbtn ${complete?'done':''}" data-act="stamp" data-id="${sid}">${stampLabel}</button>
        </div>`;
    return `
    <div class="station ${complete?'complete':''} ${locked?'locked':''}" id="station-${sid}">
      <div class="st-head" data-act="toggle-station" data-id="${sid}">
        <div class="st-num">${complete?'✓':(locked?'🔒':pos+1)}</div>
        <div class="st-titles">
          <h3>${s.icon} ${s.name[lang]}</h3>
          <div class="meta"><span>${s.area[lang]}</span></div>
        </div>
        <div class="chev">▾</div>
      </div>
      <div class="st-body">${body}</div>
    </div>`;
  }).join("");

  renderStamps();
  renderLetters();
  document.getElementById("solvedBox").classList.toggle("show", !!state.solved);
}

function renderStamps(){
  const row = document.getElementById("stamprow");
  row.innerHTML = STATIONS.map(s=>{
    const on = state.stations[s.id].stamped;
    return `<div class="stamp ${on?'got':''}">${on?s.letter:'?'}</div>`;
  }).join("");
}

function renderLetters(){
  const box = document.getElementById("letters");
  box.innerHTML = STATIONS.map(s=>{
    const on = state.stations[s.id].stamped;
    return `<span class="${on?'':'empty'}">${on?s.letter:'?'}</span>`;
  }).join("");
}

/* ============================ ACTIONS ============================ */
function toggleStation(sid){
  const el = document.getElementById("station-"+sid);
  el.classList.toggle("open");
  if(el.classList.contains("open")){
    const st = state.stations[sid];
    if(st && !st.unlocked && !TEST_MODE) ensureProximityWatch();
  } else if(!anyLockedOpenStation()){
    stopProximityWatch();
  }
}
function toggleTask(sid,ti){
  state.stations[sid].tasks[ti] = !state.stations[sid].tasks[ti];
  saveState();
  const li = document.querySelectorAll(`#station-${sid} .tasks li`)[ti];
  const on = state.stations[sid].tasks[ti];
  li.classList.toggle("checked", on);
  li.querySelector(".box").textContent = on ? "✓" : "";
}
function stamp(sid){
  if(state.stations[sid].stamped) return;
  state.stations[sid].stamped = true;
  saveState();
  const s = STATIONS.find(x=>x.id===sid);
  toast(lang==='de' ? ('Stempel „'+s.letter+'“ erhalten!') : ('スタンプ「'+s.letter+'」をゲット！'));
  renderRoute();
  document.getElementById("station-"+sid).classList.add("open");
}
function checkAnswer(){
  const val = (document.getElementById("answerInput").value || "").trim().toUpperCase().replace(/\s/g,"");
  if(val === SOLUTION){
    state.solved = true; saveState();
    document.getElementById("solvedBox").classList.add("show");
    toast(lang==='de'?'Richtig! 🎉':'正解！🎉');
    document.getElementById("solvedBox").scrollIntoView({behavior:"smooth", block:"center"});
  }else{
    toast(lang==='de'?'Noch nicht ganz… 🤔':'おしい…もう一度！🤔');
  }
}
function resetGroup(){
  if(!confirm(lang==='de'?'Fortschritt dieser Gruppe wirklich zurücksetzen?':'このグループの進捗をリセットしますか？')) return;
  localStorage.removeItem(storeKey());
  loadState();
  document.getElementById("answerInput").value = "";
  renderRoute();
}

let toastT;
function toast(msg){
  const t = document.getElementById("toast");
  t.textContent = msg; t.classList.add("show");
  clearTimeout(toastT); toastT = setTimeout(()=>t.classList.remove("show"), 2200);
}

/* ============================ EVENT DELEGATION ============================ */
document.addEventListener("click", (e)=>{
  const langBtn = e.target.closest("[data-lang]");
  if(langBtn){ setLang(langBtn.getAttribute("data-lang")); return; }

  const navBtn = e.target.closest("[data-nav]");
  if(navBtn){ show(navBtn.getAttribute("data-nav")); return; }

  const actEl = e.target.closest("[data-act]");
  if(!actEl) return;
  const act = actEl.getAttribute("data-act");

  if(act==="group"){ selectGroup(actEl.getAttribute("data-id")); }
  else if(act==="toggle-station"){ toggleStation(+actEl.getAttribute("data-id")); }
  else if(act==="task"){ toggleTask(+actEl.getAttribute("data-sid"), +actEl.getAttribute("data-ti")); }
  else if(act==="stamp"){ stamp(+actEl.getAttribute("data-id")); }
  else if(act==="check"){ checkAnswer(); }
  else if(act==="reset"){ resetGroup(); }
  else if(act==="code-confirm"){ confirmCode(); }
  else if(act==="code-cancel"){ closeCodeModal(); }
});

document.addEventListener("keydown", (e)=>{
  if(e.key==="Enter" && e.target.id==="answerInput"){ checkAnswer(); }
  if(e.key==="Enter" && e.target.id==="codeAnswer"){ confirmCode(); }
});

document.addEventListener("change", (e)=>{
  if(e.target.id==="geoChk"){ setLocationSharing(e.target.checked); }
  else if(e.target.matches("[data-photo-input]")){
    handlePhotoFile(+e.target.getAttribute("data-sid"), +e.target.getAttribute("data-ti"), e.target.files[0]);
  }
});

/* ============================ INIT ============================ */
cloudInit();
setLang(lang);
renderGroups();

if(TEST_MODE){
  const badge = document.getElementById("testBadge"); if(badge) badge.hidden = false;
  const banner = document.getElementById("testBanner"); if(banner) banner.hidden = false;
  // Standort-Freigabe ist im Testmodus ohne Funktion (kein Cloud-Push) → ausblenden.
  const geoCard = document.querySelector(".geo-card"); if(geoCard) geoCard.style.display = "none";
}
