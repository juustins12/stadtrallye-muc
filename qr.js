/* ===================== Minimaler QR-Code-Encoder =====================
   Byte-Modus, Fehlerkorrektur-Level M, Versionen 1–10 (bis 216 Zeichen).
   Ohne externe Bibliothek, damit der Code auch im per document.write
   erzeugten Druckfenster und offline funktioniert.

   Ausgabe bewusst als absolut positionierte <i>-Rechtecke statt <img>/SVG:
   html2canvas (PDF-Export im Leitstand) rendert Block-Elemente zuverlässig,
   während eingebettete SVGs je nach Browser leer bleiben können. */

/* Blockaufteilung je Version für EC-Level M:
   ec = EC-Codewörter je Block, g1/d1 und g2/d2 = Blockanzahl × Datencodewörter */
const QR_EC_M = {
  1:  { ec:10, g1:1, d1:16, g2:0, d2:0  },
  2:  { ec:16, g1:1, d1:28, g2:0, d2:0  },
  3:  { ec:26, g1:1, d1:44, g2:0, d2:0  },
  4:  { ec:18, g1:2, d1:32, g2:0, d2:0  },
  5:  { ec:24, g1:2, d1:43, g2:0, d2:0  },
  6:  { ec:16, g1:4, d1:27, g2:0, d2:0  },
  7:  { ec:18, g1:4, d1:31, g2:0, d2:0  },
  8:  { ec:22, g1:2, d1:38, g2:2, d2:39 },
  9:  { ec:22, g1:3, d1:36, g2:2, d2:37 },
  10: { ec:26, g1:4, d1:43, g2:1, d2:44 }
};

const QR_ALIGN = {
  1:[], 2:[6,18], 3:[6,22], 4:[6,26], 5:[6,30],
  6:[6,34], 7:[6,22,38], 8:[6,24,42], 9:[6,26,46], 10:[6,28,50]
};

/* GF(256), Primpolynom 0x11d */
const QR_EXP = new Array(512);
const QR_LOG = new Array(256);
(function(){
  let x = 1;
  for(let i=0;i<255;i++){ QR_EXP[i]=x; QR_LOG[x]=i; x<<=1; if(x & 0x100) x ^= 0x11d; }
  for(let i=255;i<512;i++) QR_EXP[i] = QR_EXP[i-255];
})();

function qrMul(a,b){ return (a===0||b===0) ? 0 : QR_EXP[QR_LOG[a]+QR_LOG[b]]; }

function qrGenPoly(n){
  let p = [1];
  for(let i=0;i<n;i++){
    const np = new Array(p.length+1).fill(0);
    for(let j=0;j<p.length;j++){ np[j] ^= p[j]; np[j+1] ^= qrMul(p[j], QR_EXP[i]); }
    p = np;
  }
  return p;
}

function qrEcc(data, ecLen){
  const gen = qrGenPoly(ecLen);
  const res = data.concat(new Array(ecLen).fill(0));
  for(let i=0;i<data.length;i++){
    const c = res[i];
    if(c === 0) continue;
    for(let j=0;j<gen.length;j++) res[i+j] ^= qrMul(gen[j], c);
  }
  return res.slice(data.length);
}

function qrUtf8Bytes(text){
  const out = [];
  const s = encodeURIComponent(String(text));
  for(let i=0;i<s.length;i++){
    if(s[i] === "%"){ out.push(parseInt(s.substr(i+1,2),16)); i += 2; }
    else out.push(s.charCodeAt(i));
  }
  return out;
}

function qrPickVersion(byteLen){
  for(let v=1;v<=10;v++){
    const info = QR_EC_M[v];
    const dataBits = (info.g1*info.d1 + info.g2*info.d2) * 8;
    const capacity = Math.floor((dataBits - 4 - (v>=10 ? 16 : 8)) / 8);
    if(byteLen <= capacity) return v;
  }
  throw new Error("QR: Text zu lang (max. 216 Bytes)");
}

/* Daten codieren, in Blöcke teilen, EC anhängen und verschachteln */
function qrCodewords(bytes, ver){
  const info = QR_EC_M[ver];
  const totalData = info.g1*info.d1 + info.g2*info.d2;
  const bits = [];
  const push = (val,len)=>{ for(let i=len-1;i>=0;i--) bits.push((val>>i)&1); };

  push(4, 4);                          // Modus: Byte
  push(bytes.length, ver>=10 ? 16 : 8); // Zeichenzähler
  for(const b of bytes) push(b, 8);
  for(let i=0;i<4 && bits.length < totalData*8;i++) bits.push(0); // Terminator
  while(bits.length % 8) bits.push(0);

  const dc = [];
  for(let i=0;i<bits.length;i+=8){
    let v = 0;
    for(let j=0;j<8;j++) v = (v<<1) | bits[i+j];
    dc.push(v);
  }
  const pad = [0xEC, 0x11];
  for(let i=0; dc.length < totalData; i++) dc.push(pad[i%2]);

  const blocks = [], eccs = [];
  let p = 0;
  for(let i=0;i<info.g1;i++){ const b = dc.slice(p, p+info.d1); p += info.d1; blocks.push(b); eccs.push(qrEcc(b, info.ec)); }
  for(let i=0;i<info.g2;i++){ const b = dc.slice(p, p+info.d2); p += info.d2; blocks.push(b); eccs.push(qrEcc(b, info.ec)); }

  const out = [];
  const maxD = Math.max(info.d1, info.d2);
  for(let i=0;i<maxD;i++) for(const b of blocks) if(i < b.length) out.push(b[i]);
  for(let i=0;i<info.ec;i++) for(const e of eccs) out.push(e[i]);
  return out;
}

const QR_MASKS = [
  (r,c)=> (r+c)%2 === 0,
  (r,c)=> r%2 === 0,
  (r,c)=> c%3 === 0,
  (r,c)=> (r+c)%3 === 0,
  (r,c)=> (Math.floor(r/2)+Math.floor(c/3))%2 === 0,
  (r,c)=> ((r*c)%2 + (r*c)%3) === 0,
  (r,c)=> (((r*c)%2 + (r*c)%3) % 2) === 0,
  (r,c)=> (((r+c)%2 + (r*c)%3) % 2) === 0
];

/* BCH(15,5) für die Formatinformation; EC-Level M = 0b00 */
function qrFormatBits(mask){
  const data = (0<<3) | mask;
  let v = data << 10;
  for(let i=4;i>=0;i--) if(v & (1 << (i+10))) v ^= 0x537 << i;
  return ((data<<10) | v) ^ 0x5412;
}

/* BCH(18,6) für die Versionsinformation (erst ab Version 7 vorhanden) */
function qrVersionBits(ver){
  let v = ver << 12;
  for(let i=5;i>=0;i--) if(v & (1 << (i+12))) v ^= 0x1f25 << i;
  return (ver<<12) | v;
}

/* Beide Kopien der 15-Bit-Formatinformation, jeweils vom höchstwertigen Bit an.
   Kopie 2 lässt das Dunkelmodul (size-8, 8) aus – es gehört nicht zum Format. */
function qrPlaceFormat(m, size, bits){
  const copy1 = [[8,0],[8,1],[8,2],[8,3],[8,4],[8,5],[8,7],[8,8],[7,8],[5,8],[4,8],[3,8],[2,8],[1,8],[0,8]];
  const copy2 = [];
  for(let i=0;i<7;i++) copy2.push([size-1-i, 8]);
  for(let i=0;i<8;i++) copy2.push([8, size-8+i]);

  for(let i=0;i<15;i++){
    const b = (bits >> (14-i)) & 1;
    m[copy1[i][0]][copy1[i][1]] = b;
    m[copy2[i][0]][copy2[i][1]] = b;
  }
  m[size-8][8] = 1; // Dunkelmodul
}

/* Bewertung der Maskierung nach den vier Standardregeln – kleinster Wert gewinnt */
function qrPenalty(m){
  const size = m.length;
  let score = 0;

  for(let i=0;i<size;i++){
    for(const dir of [0,1]){
      let run = 1;
      for(let j=1;j<size;j++){
        const cur  = dir ? m[j][i]   : m[i][j];
        const prev = dir ? m[j-1][i] : m[i][j-1];
        if(cur === prev){ run++; }
        else { if(run >= 5) score += 3 + (run-5); run = 1; }
      }
      if(run >= 5) score += 3 + (run-5);
    }
  }

  for(let r=0;r<size-1;r++) for(let c=0;c<size-1;c++){
    const v = m[r][c];
    if(v === m[r][c+1] && v === m[r+1][c] && v === m[r+1][c+1]) score += 3;
  }

  const pat1 = [1,0,1,1,1,0,1,0,0,0,0];
  const pat2 = [0,0,0,0,1,0,1,1,1,0,1];
  const hit = (get)=>{
    let n = 0;
    for(let i=0;i+11<=size;i++){
      let a = true, b = true;
      for(let k=0;k<11;k++){ const v = get(i+k); if(v !== pat1[k]) a = false; if(v !== pat2[k]) b = false; }
      if(a) n++;
      if(b) n++;
    }
    return n;
  };
  for(let i=0;i<size;i++){
    score += 40 * hit(j => m[i][j]);
    score += 40 * hit(j => m[j][i]);
  }

  let dark = 0;
  for(let r=0;r<size;r++) for(let c=0;c<size;c++) dark += m[r][c];
  score += Math.floor(Math.abs(dark*100/(size*size) - 50) / 5) * 10;

  return score;
}

/* Erzeugt die Modul-Matrix (1 = dunkel) für den übergebenen Text */
function qrMatrix(text){
  const bytes = qrUtf8Bytes(text);
  const ver   = qrPickVersion(bytes.length);
  const cw    = qrCodewords(bytes, ver);
  const size  = ver*4 + 17;

  const base = [], fixed = [];
  for(let i=0;i<size;i++){ base.push(new Array(size).fill(0)); fixed.push(new Array(size).fill(false)); }
  const setF = (r,c,v)=>{ base[r][c] = v; fixed[r][c] = true; };

  const finder = (fr,fc)=>{
    for(let r=-1;r<=7;r++) for(let c=-1;c<=7;c++){
      const rr = fr+r, cc = fc+c;
      if(rr<0 || cc<0 || rr>=size || cc>=size) continue;
      const ring = (r>=0 && r<=6 && (c===0 || c===6)) || (c>=0 && c<=6 && (r===0 || r===6));
      const core = r>=2 && r<=4 && c>=2 && c<=4;
      setF(rr, cc, (ring||core) ? 1 : 0);
    }
  };
  finder(0,0); finder(0,size-7); finder(size-7,0);

  for(let i=8;i<size-8;i++){ const v = (i%2===0) ? 1 : 0; setF(6,i,v); setF(i,6,v); }

  for(const r of QR_ALIGN[ver]) for(const c of QR_ALIGN[ver]){
    if((r<=8 && c<=8) || (r<=8 && c>=size-9) || (r>=size-9 && c<=8)) continue;
    for(let dr=-2;dr<=2;dr++) for(let dc=-2;dc<=2;dc++){
      setF(r+dr, c+dc, Math.max(Math.abs(dr), Math.abs(dc)) !== 1 ? 1 : 0);
    }
  }

  setF(size-8, 8, 1);

  // Bereiche für Format- und Versionsinformation belegen (Werte folgen später)
  for(let i=0;i<9;i++){
    if(!fixed[8][i]) setF(8,i,0);
    if(!fixed[i][8]) setF(i,8,0);
  }
  for(let i=0;i<8;i++){
    if(!fixed[8][size-1-i]) setF(8, size-1-i, 0);
    if(!fixed[size-1-i][8]) setF(size-1-i, 8, 0);
  }
  if(ver >= 7){
    for(let i=0;i<6;i++) for(let j=0;j<3;j++){ setF(i, size-11+j, 0); setF(size-11+j, i, 0); }
  }

  // Datenbits im Zickzack von rechts unten nach links oben
  let bitIdx = 0;
  const nextBit = ()=>{
    const byteIdx = bitIdx >> 3;
    const bit = byteIdx < cw.length ? (cw[byteIdx] >> (7-(bitIdx & 7))) & 1 : 0;
    bitIdx++;
    return bit;
  };
  let up = true;
  for(let col=size-1; col>0; col-=2){
    if(col === 6) col--; // Timing-Spalte überspringen
    for(let i=0;i<size;i++){
      const row = up ? size-1-i : i;
      for(let k=0;k<2;k++){
        const c = col-k;
        if(!fixed[row][c]) base[row][c] = nextBit();
      }
    }
    up = !up;
  }

  let best = null, bestScore = Infinity;
  for(let mask=0; mask<8; mask++){
    const m = base.map(row => row.slice());
    for(let r=0;r<size;r++) for(let c=0;c<size;c++){
      if(!fixed[r][c] && QR_MASKS[mask](r,c)) m[r][c] ^= 1;
    }
    qrPlaceFormat(m, size, qrFormatBits(mask));
    if(ver >= 7){
      const vb = qrVersionBits(ver);
      for(let i=0;i<18;i++){
        const b = (vb>>i)&1;
        m[Math.floor(i/3)][size-11+(i%3)] = b;
        m[size-11+(i%3)][Math.floor(i/3)] = b;
      }
    }
    const score = qrPenalty(m);
    if(score < bestScore){ bestScore = score; best = m; }
  }
  return best;
}

/* HTML-Schnipsel des QR-Codes. module/quiet in ganzen Pixeln, damit beim
   Druck und beim Canvas-Rendering keine Zwischenräume entstehen.
   Benötigt die Regeln .qr / .qr i aus dem jeweiligen Stylesheet. */
function qrHTML(text, opts){
  const o     = opts || {};
  const mod   = o.module || 3;
  const quiet = o.quiet === undefined ? 4 : o.quiet;
  const m     = qrMatrix(text);
  const size  = m.length;
  const dim   = (size + quiet*2) * mod;

  let rects = "";
  for(let r=0;r<size;r++){
    let c = 0;
    while(c < size){
      if(!m[r][c]){ c++; continue; }
      const start = c;
      while(c < size && m[r][c]) c++;
      rects += `<i style="left:${(start+quiet)*mod}px;top:${(r+quiet)*mod}px;width:${(c-start)*mod}px;height:${mod}px"></i>`;
    }
  }
  return `<div class="qr" style="width:${dim}px;height:${dim}px">${rects}</div>`;
}

if(typeof module !== "undefined" && module.exports){
  module.exports = { qrMatrix, qrHTML };
}
