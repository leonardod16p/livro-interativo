import React, { useMemo } from 'react';
import * as THREE from 'three';
import treeData from '../../data/tree3d.json';
import { CANOPY } from '../../utils/canopyGeometry.js';

function useTubeGeometry(points, radius) {
  return useMemo(() => {
    const vecs = points.map((p) => new THREE.Vector3(p[0], p[1], p[2]));
    const curve = new THREE.CatmullRomCurve3(vecs);
    return new THREE.TubeGeometry(curve, Math.max(8, vecs.length * 4), Math.max(radius, 0.04), 6, false);
  }, [points, radius]);
}

function BranchTube({ curveData, withering }) {
  const geometry = useTubeGeometry(curveData.points, curveData.width / 2);
  const color = withering ? '#6d4c41' : curveData.color;
  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial color={color} roughness={0.9} metalness={0} />
    </mesh>
  );
}

function dist3(a, b) {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  const dz = a[2] - b[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function hash(i) {
  const v = Math.sin(i * 12.9898) * 43758.5453;
  return v - Math.floor(v);
}

// Gera galhos finos extras a partir das pontas dos galhos principais:
// (1) "gravetos" alcançando folhas próximas que não tinham galho nenhum
//     chegando perto, e
// (2) "galhos radiais" que apontam em direções variadas (pra cima, pros
//     lados, um pouco pra baixo) até a borda do elipsoide da copa —
//     isso é o que dá volume/formato de bola ao esqueleto de galhos,
//     em vez de só um leque plano.
const TOP_FRACTION = 0.85; // % dos galhos (por altura da ponta) que ganham extensões
const TWIGS_PER_TIP = 4;
const RADIAL_TWIGS_PER_TIP = 4;
const MAX_REACH = 4.2;
const MIN_REACH = 0.6;

function useTwigCurves() {
  return useMemo(() => {
    const tips = treeData.branchCurves
      .map((b, i) => ({ point: b.points[b.points.length - 1], color: b.color, i }))
      .sort((a, b) => b.point[1] - a.point[1]);
    const topTips = tips.slice(0, Math.ceil(tips.length * TOP_FRACTION));
    const leaves = treeData.leaves;

    const twigs = [];

    topTips.forEach((tip, ti) => {
      // (1) gravetos até folhas próximas desguarnecidas
      const nearby = leaves
        .map((l) => ({ l, d: dist3(tip.point, l.position) }))
        .filter((o) => o.d < MAX_REACH && o.d > MIN_REACH)
        .sort((a, b) => a.d - b.d)
        .slice(0, TWIGS_PER_TIP);

      nearby.forEach((o, ni) => {
        const seed = ti * 19 + ni * 7;
        const jitter = [
          (hash(seed + 1) - 0.5) * 0.8,
          (hash(seed + 2) - 0.5) * 0.5,
          (hash(seed + 3) - 0.5) * 0.8,
        ];
        const mid = [
          (tip.point[0] + o.l.position[0]) / 2 + jitter[0],
          (tip.point[1] + o.l.position[1]) / 2 + jitter[1],
          (tip.point[2] + o.l.position[2]) / 2 + jitter[2],
        ];
        const end = [
          tip.point[0] + (o.l.position[0] - tip.point[0]) * (0.75 + hash(seed + 4) * 0.2),
          tip.point[1] + (o.l.position[1] - tip.point[1]) * (0.75 + hash(seed + 4) * 0.2),
          tip.point[2] + (o.l.position[2] - tip.point[2]) * (0.75 + hash(seed + 4) * 0.2),
        ];
        twigs.push({
          points: [tip.point, mid, end],
          width: 0.09 + hash(seed + 5) * 0.05,
          color: tip.color,
        });
      });

      // (2) galhos radiais, em direções variadas, esticando até perto da
      // borda do elipsoide da copa — constroem o formato arredondado
      for (let ri = 0; ri < RADIAL_TWIGS_PER_TIP; ri++) {
        const seed = ti * 131 + ri * 31 + 500;
        const h1 = hash(seed + 1);
        const h2 = hash(seed + 2);
        const h3 = hash(seed + 3);
        const h4 = hash(seed + 4);

        // direção pseudo-aleatória com leve preferência pra fora do centro
        // da copa (soma o vetor tip->centro invertido com um vetor aleatório)
        const toCenter = [
          CANOPY.center[0] - tip.point[0],
          CANOPY.center[1] - tip.point[1],
          CANOPY.center[2] - tip.point[2],
        ];
        const outward = [-toCenter[0], -toCenter[1] * 0.4, -toCenter[2]];
        const theta = h1 * Math.PI * 2;
        const phi = Math.acos(2 * h2 - 1);
        const rand = [Math.sin(phi) * Math.cos(theta), Math.sin(phi) * Math.sin(theta), Math.cos(phi)];

        const dir = [outward[0] * 0.5 + rand[0], outward[1] * 0.5 + rand[1], outward[2] * 0.5 + rand[2]];
        const dirLen = Math.hypot(dir[0], dir[1], dir[2]) || 1;
        const length = 1.4 + h3 * 2.4;
        const end = [
          tip.point[0] + (dir[0] / dirLen) * length,
          tip.point[1] + (dir[1] / dirLen) * length * 0.8,
          tip.point[2] + (dir[2] / dirLen) * length,
        ];
        const mid = [
          (tip.point[0] + end[0]) / 2 + (h4 - 0.5) * 0.6,
          (tip.point[1] + end[1]) / 2 + (h4 - 0.5) * 0.4,
          (tip.point[2] + end[2]) / 2 + (h4 - 0.5) * 0.6,
        ];

        twigs.push({
          points: [tip.point, mid, end],
          width: 0.06 + h4 * 0.04,
          color: tip.color,
        });
      }
    });
    return twigs;
  }, []);
}

function TwigTube({ twig, withering }) {
  const geometry = useTubeGeometry(twig.points, twig.width / 2);
  const color = withering ? '#6d4c41' : twig.color;
  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial color={color} roughness={0.95} metalness={0} />
    </mesh>
  );
}

export default function Branches({ withering }) {
  const twigs = useTwigCurves();

  return (
    <group>
      {treeData.branchCurves.map((curveData) => (
        <BranchTube key={curveData.id} curveData={curveData} withering={withering} />
      ))}
      {twigs.map((twig, i) => (
        <TwigTube key={`twig-${i}`} twig={twig} withering={withering} />
      ))}
    </group>
  );
}
