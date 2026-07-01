/* ============================ SPIELDATEN (gemeinsam) ============================ */
/* Einzige Quelle für Stationen, Gruppen und Lösung.
   Wird sowohl von der Spiel-App (app.js) als auch vom
   Operator-Druck (print.js) genutzt – so bleiben beide synchron. */
const STATIONS = [
  { id:1, letter:"K", icon:"🥨", map:"Viktualienmarkt München", lat:48.13512, lng:11.57619,
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

  { id:2, letter:"I", icon:"🍺", map:"Hofbräuhaus München", lat:48.13746, lng:11.58062,
    name:{de:"Hofbräuhaus", ja:"ホフブロイハウス"},
    area:{de:"Wirtshaus · 5 Min. vom Marienplatz", ja:"ビアホール · マリエン広場から5分"},
    intro:{de:"Das wohl berühmteste Wirtshaus der Welt, gegründet 1589. Drinnen spielt oft eine Blaskapelle in Tracht.",
           ja:"1589年創業、世界で最も有名なビアホール。中では民族衣装のブラスバンドがよく演奏しています。"},
    tasks:[
      {photo:true, de:"Foto vor dem Hofbräuhaus-Schild: Alle stoßen an (mit Wasser/Limo) und rufen „Prost!“", ja:"ホフブロイハウスの看板の前で、みんなで乾杯のポーズ（水やジュースで）し「Prost!」と言って写真。"},
      {photo:false, de:"Fragt eine Person, wie man auf Bairisch „Hallo“ oder „Prost“ sagt.", ja:"誰かに、バイエルン方言で「こんにちは」や「乾杯」を聞いてみよう。"}
    ],
    fact:{de:"„Prost“ heißt auf Japanisch 「乾杯 (Kanpai)」.", ja:"「Prost」は日本語で「乾杯（かんぱい）」。"} },

  { id:3, letter:"Z", icon:"🏄", map:"Eisbachwelle München", lat:48.14593, lng:11.59076,
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

  { id:4, letter:"U", icon:"🦁", map:"Odeonsplatz München", lat:48.14222, lng:11.57646,
    name:{de:"Odeonsplatz & Feldherrnhalle", ja:"オデオン広場とフェルトヘルンハレ"},
    area:{de:"Platz · ~8 Min. vom Marienplatz", ja:"広場 · マリエン広場から約8分"},
    intro:{de:"Ein Platz im italienischen Stil mit der Feldherrnhalle und zwei großen steinernen Löwen.",
           ja:"イタリア風の広場。フェルトヘルンハレと、2頭の大きな石のライオンがあります。"},
    tasks:[
      {photo:true, de:"Foto bei einer der beiden Löwenstatuen.", ja:"2頭のライオン像のどちらかと一緒に写真。"},
      {photo:false, de:"Der Legende nach bringt es Glück, den Schild eines Löwen zu berühren – probiert es!", ja:"伝説では、ライオンの盾に触れると幸運が訪れるそう。触ってみよう！"}
    ],
    fact:{de:"Der Löwe ist das Wappentier Bayerns – und das Symbol von TSV 1860 München.", ja:"ライオンはバイエルンの紋章であり、TSV1860ミュンヘンの象徴でもあります。"} },

  { id:5, letter:"N", icon:"⛪", map:"Frauenkirche München", lat:48.13853, lng:11.57342,
    name:{de:"Frauenkirche", ja:"フラウエン教会"},
    area:{de:"Wahrzeichen · 3 Min. vom Marienplatz", ja:"ランドマーク · マリエン広場から3分"},
    intro:{de:"Das Wahrzeichen Münchens mit zwei Türmen und grünen „Zwiebel“-Kuppeln. Gleich im Eingang gibt es den „Teufelstritt“.",
           ja:"2本の塔と緑の玉ねぎ型ドームを持つミュンヘンのシンボル。入口には「悪魔の足跡」があります。"},
    tasks:[
      {photo:true, de:"Findet den „Teufelstritt“ (Fußabdruck im Boden), stellt euch hinein – Foto.", ja:"床の「悪魔の足跡」を見つけ、その上に立って写真。"},
      {photo:false, de:"Wie viele Türme hat die Frauenkirche?", ja:"フラウエン教会の塔は何本？"}
    ],
    fact:{de:"Die beiden Türme sind fast 99 Meter hoch.", ja:"2本の塔の高さは約99メートルです。"} },

  { id:6, letter:"A", icon:"✨", map:"Asamkirche München", lat:48.13289, lng:11.56850,
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
  { id:"loewen",  emoji:"🦁", color:"#0d57a0", name:{de:"Löwen", ja:"ライオン"},      order:[1,2,3,4,5,6], code:"1860" },
  { id:"adler",   emoji:"🦅", color:"#b23a2e", name:{de:"Adler", ja:"わし"},          order:[2,3,4,5,6,1], code:"1900" },
  { id:"eisbach", emoji:"🌊", color:"#1f8a8a", name:{de:"Eisbach", ja:"アイスバッハ"}, order:[3,4,5,6,1,2], code:"2020" },
  { id:"olympia", emoji:"🔥", color:"#3a8f4f", name:{de:"Olympia", ja:"オリンピア"},   order:[4,5,6,1,2,3], code:"1972" },
  { id:"isar",    emoji:"🚣", color:"#4b5a8a", name:{de:"Isar", ja:"イーザル"},        order:[5,6,1,2,3,4], code:"2026" }
];

const SOLUTION = "KIZUNA";
