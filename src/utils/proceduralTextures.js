import * as THREE from 'three';

// ---------------------------------------------------------------------------
// Texturas geradas em <canvas>, sem depender de imagens externas (funcionam
// em qualquer build/deploy, inclusive GitHub Pages, sem requisições extras).
// ---------------------------------------------------------------------------

function makeCanvas(w, h) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  return canvas;
}

// Pseudo-random com seed simples, pra textura ficar estável entre re-renders
function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Textura de casca de árvore: sulcos verticais irregulares + variação de tom
 * + "lenticelas" horizontais, tileável verticalmente.
 */
export function createBarkTexture({
  width = 256,
  height = 512,
  base = '#8d6e63',
  dark = '#4a332c',
  light = '#a1887f',
  seed = 7,
} = {}) {
  const rand = mulberry32(seed);
  const canvas = makeCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Fundo com leve gradiente vertical
  const bg = ctx.createLinearGradient(0, 0, 0, height);
  bg.addColorStop(0, light);
  bg.addColorStop(0.5, base);
  bg.addColorStop(1, dark);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Sulcos verticais (fibras da casca)
  const grooveCount = 34;
  for (let i = 0; i < grooveCount; i++) {
    const x = (i / grooveCount) * width + (rand() - 0.5) * 10;
    const w = 2 + rand() * 5;
    const wobble = 6 + rand() * 14;
    const shade = rand() > 0.5 ? dark : light;
    ctx.strokeStyle = shade;
    ctx.globalAlpha = 0.25 + rand() * 0.35;
    ctx.lineWidth = w;
    ctx.beginPath();
    let px = x;
    for (let y = 0; y <= height; y += 16) {
      px += (rand() - 0.5) * wobble * 0.4;
      if (y === 0) ctx.moveTo(px, y);
      else ctx.lineTo(px, y);
    }
    ctx.stroke();
  }

  // Lenticelas / manchas horizontais curtas
  ctx.globalAlpha = 0.3;
  for (let i = 0; i < 90; i++) {
    const x = rand() * width;
    const y = rand() * height;
    const w = 4 + rand() * 10;
    const h = 1 + rand() * 2;
    ctx.fillStyle = rand() > 0.5 ? dark : light;
    ctx.fillRect(x, y, w, h);
  }

  ctx.globalAlpha = 1;
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Mapa de rugosidade combinando com a casca (mais escuro = mais áspero
 * nos sulcos), pra dar profundidade sem precisar de normal map.
 */
export function createBarkRoughnessTexture(seed = 7) {
  const rand = mulberry32(seed + 99);
  const size = 256;
  const canvas = makeCanvas(size, size);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#bbbbbb';
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 400; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const r = 1 + rand() * 3;
    const v = Math.floor(140 + rand() * 100);
    ctx.fillStyle = `rgb(${v},${v},${v})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/**
 * Textura de uma pequena "moita" de folhas (3-5 folhas sobrepostas) com
 * canal alfa recortando o formato — RGB fica branco pra podermos tingir
 * cada instância via instanceColor (mantém o sistema de cores/murcha atual).
 */
export function createLeafClusterTexture({ size = 256, seed = 3 } = {}) {
  const rand = mulberry32(seed);
  const canvas = makeCanvas(size, size);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, size, size);

  function drawLeaf(cx, cy, len, width, angle) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, -len / 2);
    ctx.bezierCurveTo(width / 2, -len / 4, width / 2, len / 4, 0, len / 2);
    ctx.bezierCurveTo(-width / 2, len / 4, -width / 2, -len / 4, 0, -len / 2);
    ctx.closePath();
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    // veia central
    ctx.strokeStyle = 'rgba(0,0,0,0.18)';
    ctx.lineWidth = Math.max(1, width * 0.04);
    ctx.beginPath();
    ctx.moveTo(0, -len / 2 + 2);
    ctx.lineTo(0, len / 2 - 2);
    ctx.stroke();
    ctx.restore();
  }

  const cx = size / 2;
  const cy = size / 2;
  const leafCount = 5;
  for (let i = 0; i < leafCount; i++) {
    const angle = (i / leafCount) * Math.PI * 2 + rand() * 0.6;
    const dist = size * 0.14 * rand();
    const lx = cx + Math.cos(angle) * dist;
    const ly = cy + Math.sin(angle) * dist;
    const len = size * (0.36 + rand() * 0.18);
    const width = len * (0.42 + rand() * 0.12);
    drawLeaf(lx, ly, len, width, angle + Math.PI / 2 + (rand() - 0.5) * 0.6);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Uma única folha grande e bem legível (em vez da moita de 5 folhinhas
 * pequenas), pra cada instância parecer maior e mais nítida de longe.
 * RGB branco (pra tingir via instanceColor) + alfa recortando o contorno.
 */
export function createSingleLeafTexture({ size = 256, seed = 5 } = {}) {
  const rand = mulberry32(seed);
  const canvas = makeCanvas(size, size);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, size, size);

  const cx = size / 2;
  const cy = size / 2;
  const len = size * 0.86;
  const width = len * 0.62;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  ctx.moveTo(0, -len / 2);
  ctx.bezierCurveTo(width / 2, -len / 5, width / 2, len / 5, 0, len / 2);
  ctx.bezierCurveTo(-width / 2, len / 5, -width / 2, -len / 5, 0, -len / 2);
  ctx.closePath();
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  // veia central + veias laterais, sutis
  ctx.strokeStyle = 'rgba(0,0,0,0.22)';
  ctx.lineWidth = Math.max(1.5, width * 0.03);
  ctx.beginPath();
  ctx.moveTo(0, -len / 2 + 4);
  ctx.lineTo(0, len / 2 - 4);
  ctx.stroke();
  for (let i = 1; i <= 3; i++) {
    const t = i / 4;
    const y = -len / 2 + len * t;
    const spread = width * 0.32 * (1 - Math.abs(t - 0.5));
    ctx.lineWidth = Math.max(1, width * 0.018);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(spread, y + spread * 0.5);
    ctx.moveTo(0, y);
    ctx.lineTo(-spread, y + spread * 0.5);
    ctx.stroke();
  }
  ctx.restore();
  void rand;

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Textura de grama para o chão — tufos verdes de tom variado, tileável.
 */
export function createGrassTexture(seed = 21) {
  const rand = mulberry32(seed);
  const size = 256;
  const canvas = makeCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const bg = ctx.createLinearGradient(0, 0, 0, size);
  bg.addColorStop(0, '#3f6b3a');
  bg.addColorStop(1, '#2d4f2a');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 900; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const h = 4 + rand() * 9;
    const lean = (rand() - 0.5) * 4;
    const tones = ['#4c8c3f', '#3a6b32', '#5ea24a', '#345e2c'];
    ctx.strokeStyle = tones[Math.floor(rand() * tones.length)];
    ctx.globalAlpha = 0.55 + rand() * 0.35;
    ctx.lineWidth = 1 + rand();
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + lean, y - h);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Textura de solo (terra) usada na "vitrine" translúcida que revela as
 * raízes — pontos e manchas irregulares em tons de terra.
 */
export function createSoilTexture(seed = 11) {
  const rand = mulberry32(seed);
  const size = 256;
  const canvas = makeCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const bg = ctx.createLinearGradient(0, 0, 0, size);
  bg.addColorStop(0, '#4e342e');
  bg.addColorStop(1, '#2b1d18');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 260; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const r = 1 + rand() * 3.5;
    const v = 40 + rand() * 60;
    ctx.fillStyle = `rgba(${v + 40},${v},${v - 10},0.5)`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
