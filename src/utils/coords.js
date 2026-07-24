// Mesmas constantes usadas no script de extração (extract/convert.py),
// para que qualquer coordenada calculada em tempo de execução (slots,
// âncoras de UI) fique perfeitamente alinhada com a geometria pré-calculada
// da árvore (tronco, galhos, raízes, folhas) vinda de data/tree3d.json.
export const SCALE = 1 / 45;
export const ORIGIN_X = 1000;
export const GROUND_Y = 900;

export function svgTo3D(cx, cy, zOffset = 0) {
  const x = (cx - ORIGIN_X) * SCALE;
  const y = (GROUND_Y - cy) * SCALE;
  return [x, y, zOffset];
}
