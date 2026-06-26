/* ============================ DATA ============================ */
const STATIONS = [
  { id:1, letter:"K", icon:"🥨", map:"Viktualienmarkt München",
    name:{de:"Viktualienmarkt", ja:"ヴィクトアリエンマルクト"},
    area:{de:"Markt · 3 Min. vom Marienplatz", ja:"市場 · マリエン広場から3分"},
    intro:{de:"Münchens berühmtester Markt mitten in der Altstadt – seit über 200 Jahren. In der Mitte steht der blau-weiße Maibaum mit kleinen Zunftfiguren.",
           ja:"旧市街の真ん中にある、200年以上続くミュンヘン一有名な市場。中央には青と白の「五月の木（マイバウム）」が立ち、職人の人形が飾られています。"},
    tasks:[
      {photo:true, de:"Gruppenfoto vor dem Maibaum.", ja:"マイバウムの前でグループ写真。"},
      {photo:false, de:"Findet am Maibaum eine Figur, die einen Beruf oder Sport zeigt. Welcher?", ja:"五月の木の人形から、職業かスポーツを表す人形を1つ見つけよう。何かな？"},
      {photo:false, de:"Probiert eine bayerische oder japanische Spezialität vom Markt (optional).", ja:"市場でバイエルンか日本の名物を1つ味見しよう（任意）。"}
    ],
    fact:{de:"Die bayerischen Farben sind Blau und Weiß.", ja:"バイエルンの色は青と白です。"} },

  { id:2, letter:"I", icon:"🍺", map:"Hofbräuhaus München",
    name:{de:"Hofbräuhaus", ja:"ホフブロイハウス"},
    area:{de:"Wirtshaus · 5 Min. vom Marienplatz", ja:"ビアホール · マリエン広場から5分"},
    intro:{de:"Das wohl berühmteste Wirtshaus der Welt, gegründet 1589. Drinnen spielt oft eine Blaskapelle in Tracht.",
           ja:"1589年創業、世界で最も有名なビアホール。中では民族衣装のブラスバンドがよく演奏しています。"},
    tasks:[
      {photo:true, de:"Foto vor dem Hofbräuhaus-Schild: Alle stoßen an (mit Wasser/Limo) und rufen „Prost!“", ja:"ホフブロイハウスの看板の前で、みんなで乾杯のポーズ（水やジュースで）し「Prost!」と言って写真。"},
      {photo:false, de:"Fragt eine Person, wie man auf Bairisch „Hallo“ oder „Prost“ sagt.", ja:"誰かに、バイエルン方言で「こんにちは」や「乾杯」を聞いてみよう。"}
    ],
    fact:{de:"„Prost“ heißt auf Japanisch 「乾杯 (Kanpai)」.", ja:"「Prost」は日本語で「乾杯（かんぱい）」。"} },

  { id:3, letter:"Z", icon:"🏄", map:"Eisbachwelle München",
    name:{de:"Eisbachwelle", ja:"アイスバッハの波"},
    area:{de:"Englischer Garten · ÖPNV od. ~12 Min. Fuß", ja:"イギリス庭園 · 公共交通か徒歩約12分"},
    intro:{de:"Mitten in der Stadt surfen Menschen auf einer stehenden Flusswelle im Eisbach – das ist weltberühmt und das ganze Jahr über.",
           ja:"街の真ん中、アイスバッハ川にできる定常波で人々が一年中サーフィンをします。世界的に有名なスポットです。"},
    tasks:[
      {photo:true, de:"Macht ein Foto von einem Surfer auf der Welle.", ja:"波に乗るサーファーの写真を撮ろう。"},
      {photo:true, de:"Sport-Aufgabe: Die ganze Gruppe macht eine Surfer-Pose fürs Foto.", ja:"スポーツ課題：グループ全員でサーファーのポーズをして写真。"},
      {photo:false, de:"Schätzt: Wie viele Surfer warten gerade in der Schlange?", ja:"今、何人のサーファーが順番待ちしているか数えてみよう。"}
    ],
    fact:{de:"Surfen ist seit Tokio 2020 olympische Disziplin.", ja:"サーフィンは東京2020からオリンピック種目です。"} },

  { id:4, letter:"U", icon:"🦁", map:"Odeonsplatz München",
    name:{de:"Odeonsplatz & Feldherrnhalle", ja:"オデオン広場とフェルトヘルンハレ"},
    area:{de:"Platz · ~8 Min. vom Marienplatz", ja:"広場 · マリエン広場から約8分"},
    intro:{de:"Ein Platz im italienischen Stil mit der Feldherrnhalle und zwei großen steinernen Löwen.",
           ja:"イタリア風の広場。フェルトヘルンハレと、2頭の大きな石のライオンがあります。"},
    tasks:[
      {photo:true, de:"Foto bei einer der beiden Löwenstatuen.", ja:"2頭のライオン像のどちらかと一緒に写真。"},
      {photo:false, de:"Der Legende nach bringt es Glück, den Schild eines Löwen zu berühren – probiert es!", ja:"伝説では、ライオンの盾に触れると幸運が訪れるそう。触ってみよう！"}
    ],
    fact:{de:"Der Löwe ist das Wappentier Bayerns – und das Symbol von TSV 1860 München.", ja:"ライオンはバイエルンの紋章であり、TSV1860ミュンヘンの象徴でもあります。"} },

  { id:5, letter:"N", icon:"⛪", map:"Frauenkirche München",
    name:{de:"Frauenkirche", ja:"フラウエン教会"},
    area:{de:"Wahrzeichen · 3 Min. vom Marienplatz", ja:"ランドマーク · マリエン広場から3分"},
    intro:{de:"Das Wahrzeichen Münchens mit zwei Türmen und grünen „Zwiebel“-Kuppeln. Gleich im Eingang gibt es den „Teufelstritt“.",
           ja:"2本の塔と緑の玉ねぎ型ドームを持つミュンヘンのシンボル。入口には「悪魔の足跡」があります。"},
    tasks:[
      {photo:true, de:"Findet den „Teufelstritt“ (Fußabdruck im Boden), stellt euch hinein – Foto.", ja:"床の「悪魔の足跡」を見つけ、その上に立って写真。"},
      {photo:false, de:"Wie viele Türme hat die Frauenkirche?", ja:"フラウエン教会の塔は何本？"}
    ],
    fact:{de:"Die beiden Türme sind fast 99 Meter hoch.", ja:"2本の塔の高さは約99メートルです。"} },

  { id:6, letter:"A", icon:"✨", map:"Asamkirche München",
    name:{de:"Asamkirche", ja:"アザム教会"},
    area:{de:"Barockkirche · 6 Min. vom Marienplatz", ja:"バロック教会 · マリエン広場から6分"},
    intro:{de:"Eine winzige, überreich verzierte Barockkirche, die zwei Künstler-Brüder einst als private Kirche bauten.",
           ja:"芸術家の兄弟が個人の教会として建てた、小さくて非常に豪華なバロック教会。"},
    tasks:[
      {photo:true, de:"Foto der reich verzierten Fassade.", ja:"装飾豊かなファサードの写真。"},
      {photo:false, de:"Die Kirche ist von außen klein und versteckt. Was seht ihr über dem Eingangsportal?", ja:"外からは小さく目立たない教会。入口の門の上に何が見える？"}
    ],
    fact:{de:"Die Kirche ist nur etwa 8 Meter breit.", ja:"教会の幅はわずか約8メートルです。"} }
];

const GROUPS = [
  { id:"loewen",  emoji:"🦁", color:"#0d57a0", name:{de:"Löwen", ja:"ライオン"},      order:[1,2,3,4,5,6] },
  { id:"adler",   emoji:"🦅", color:"#b23a2e", name:{de:"Adler", ja:"わし"},          order:[2,3,4,5,6,1] },
  { id:"eisbach", emoji:"🌊", color:"#1f8a8a", name:{de:"Eisbach", ja:"アイスバッハ"}, order:[3,4,5,6,1,2] },
  { id:"olympia", emoji:"🔥", color:"#3a8f4f", name:{de:"Olympia", ja:"オリンピア"},   order:[4,5,6,1,2,3] },
  { id:"isar",    emoji:"🚣", color:"#4b5a8a", name:{de:"Isar", ja:"イーザル"},        order:[5,6,1,2,3,4] }
];

const SOLUTION = "KIZUNA";

/* ============================ STATE ============================ */
let lang = localStorage.getItem("rally_lang") || "de";
let groupId = null;
let state = {};

function storeKey(){ return "rally_state_" + groupId; }
function loadState(){
  try{ state = JSON.parse(localStorage.getItem(storeKey())) || {}; }catch(e){ state = {}; }
  if(!state.stations) state.stations = {};
  STATIONS.forEach(s=>{ if(!state.stations[s.id]) state.stations[s.id] = {stamped:false, tasks:s.tasks.map(()=>false)}; });
  if(state.solved === undefined) state.solved = false;
}
function saveState(){ localStorage.setItem(storeKey(), JSON.stringify(state)); }

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

function pickGroup(id){
  groupId = id;
  loadState();
  renderRoute();
  show("screen-route");
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
    const tasks = s.tasks.map((t,ti)=>`
      <li class="${st.tasks[ti]?'checked':''}" data-act="task" data-sid="${sid}" data-ti="${ti}">
        <span class="box">${st.tasks[ti]?'✓':''}</span>
        ${t.photo?'<span class="tag photo">📷 Foto</span>':''}
        <span>${t[lang]}</span>
      </li>`).join("");
    const stampLabel = complete
      ? (lang==='de'?'✓ Stempel erhalten':'✓ スタンプ取得')
      : (lang==='de'?('Stempel holen ('+s.letter+')'):('スタンプを押す ('+s.letter+')'));
    return `
    <div class="station ${complete?'complete':''}" id="station-${sid}">
      <div class="st-head" data-act="toggle-station" data-id="${sid}">
        <div class="st-num">${complete?'✓':pos+1}</div>
        <div class="st-titles">
          <h3>${s.icon} ${s.name[lang]}</h3>
          <div class="meta"><span>${s.area[lang]}</span></div>
        </div>
        <div class="chev">▾</div>
      </div>
      <div class="st-body">
        <p class="intro">${s.intro[lang]}</p>
        <span class="why" data-de>Aufgaben</span><span class="why" data-ja>課題</span>
        <ul class="tasks">${tasks}</ul>
        <div class="fact-mini">💡 ${s.fact[lang]}</div>
        <div class="st-actions">
          <a class="maplink" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.map)}"><span data-de>Karte öffnen</span><span data-ja>地図を開く</span></a>
          <button class="stampbtn ${complete?'done':''}" data-act="stamp" data-id="${sid}">${stampLabel}</button>
        </div>
      </div>
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
  document.getElementById("station-"+sid).classList.toggle("open");
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

  if(act==="group"){ pickGroup(actEl.getAttribute("data-id")); }
  else if(act==="toggle-station"){ toggleStation(+actEl.getAttribute("data-id")); }
  else if(act==="task"){ toggleTask(+actEl.getAttribute("data-sid"), +actEl.getAttribute("data-ti")); }
  else if(act==="stamp"){ stamp(+actEl.getAttribute("data-id")); }
  else if(act==="check"){ checkAnswer(); }
  else if(act==="reset"){ resetGroup(); }
});

document.addEventListener("keydown", (e)=>{
  if(e.key==="Enter" && e.target.id==="answerInput"){ checkAnswer(); }
});

/* ============================ INIT ============================ */
setLang(lang);
renderGroups();
