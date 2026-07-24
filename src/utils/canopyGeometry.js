import treeData from '../data/tree3d.json';

// Calcula o centro e o "raio" (por eixo, como um elipsoide) da copa a
// partir da nuvem de pontos de folhas do tree3d.json. Usado tanto pelas
// folhas de preenchimento de volume quanto pelos galhos radiais, pra que
// os dois "concordem" sobre o formato geral (arredondado) da copa.
function computeCanopy() {
  const leaves = treeData.leaves;
  const n = leaves.length;
  let cx = 0;
  let cy = 0;
  let cz = 0;
  leaves.forEach((l) => {
    cx += l.position[0];
    cy += l.position[1];
    cz += l.position[2];
  });
  cx /= n;
  cy /= n;
  cz /= n;

  let maxX = 0;
  let maxY = 0;
  let maxZ = 0;
  leaves.forEach((l) => {
    maxX = Math.max(maxX, Math.abs(l.position[0] - cx));
    maxY = Math.max(maxY, Math.abs(l.position[1] - cy));
    maxZ = Math.max(maxZ, Math.abs(l.position[2] - cz));
  });

  const PAD = 1.2; // folga pra copa "estourar" um pouco além dos pontos originais
  return {
    center: [cx, cy, cz],
    radii: [maxX * PAD, maxY * PAD, maxZ * PAD],
  };
}

export const CANOPY = computeCanopy();

export function nearestLeafIndex(point) {
  let best = 0;
  let bestD = Infinity;
  const leaves = treeData.leaves;
  for (let i = 0; i < leaves.length; i++) {
    const p = leaves[i].position;
    const dx = p[0] - point[0];
    const dy = p[1] - point[1];
    const dz = p[2] - point[2];
    const d = dx * dx + dy * dy + dz * dz;
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return best;
}
