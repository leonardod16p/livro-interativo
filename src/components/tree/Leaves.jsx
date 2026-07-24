import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import treeData from '../../data/tree3d.json';
import { createSingleLeafTexture } from '../../utils/proceduralTextures.js';
import { CANOPY, nearestLeafIndex } from '../../utils/canopyGeometry.js';

const dummy = new THREE.Object3D();
const color = new THREE.Color();
const WITHER_COLOR = new THREE.Color('#a1887f');

// Camada 1: moita de folhas grudada em cada ponto real do tree3d.json
// (acompanha os galhos de perto).
const SUB_LEAVES = 30;
const SPREAD_FACTOR = 1.8;

// Camada 2: preenchimento de volume — pontos soltos dentro do elipsoide
// da copa inteira, pra fechar o "miolo" e formar o volume arredondado
// (em vez de só uma casca oca em volta dos galhos). Cada ponto de
// preenchimento "pertence" à folha real mais próxima pra efeito de
// revelação (só aparece quando aquele tópico é revelado).
const FILL_COUNT = 4200;

function hash(i) {
  const v = Math.sin(i * 12.9898) * 43758.5453;
  return v - Math.floor(v);
}

function buildClusterLayer(baseCount) {
  const count = baseCount * SUB_LEAVES;
  const ownerId = new Int32Array(count);
  const position = new Float32Array(count * 3);
  const scale = new Float32Array(count);
  const baseRotX = new Float32Array(count);
  const baseRotY = new Float32Array(count);
  const baseRotZ = new Float32Array(count);
  const phase = new Float32Array(count);
  const speed = new Float32Array(count);

  let k = 0;
  for (let li = 0; li < baseCount; li++) {
    const leaf = treeData.leaves[li];
    for (let s = 0; s < SUB_LEAVES; s++) {
      const h1 = hash(k * 3.1 + 0.7);
      const h2 = hash(k * 5.7 + 1.3);
      const h3 = hash(k * 7.9 + 2.1);
      const h4 = hash(k * 11.3 + 3.9);
      const h5 = hash(k * 13.7 + 4.7);

      const spread = leaf.radius * SPREAD_FACTOR;
      const theta = h1 * Math.PI * 2;
      const phi = Math.acos(2 * h2 - 1);
      const r = spread * Math.cbrt(h3);

      ownerId[k] = leaf.id;
      position[k * 3 + 0] = leaf.position[0] + r * Math.sin(phi) * Math.cos(theta);
      position[k * 3 + 1] = leaf.position[1] + r * Math.sin(phi) * Math.sin(theta) * 0.85;
      position[k * 3 + 2] = leaf.position[2] + r * Math.cos(phi);

      scale[k] = leaf.radius * (0.45 + h4 * 0.4);
      baseRotX[k] = (h1 - 0.5) * 1.4;
      baseRotY[k] = h2 * Math.PI * 2;
      baseRotZ[k] = (h3 - 0.5) * 1.4;
      phase[k] = h4 * Math.PI * 2;
      speed[k] = 0.5 + h5 * 0.6;

      k++;
    }
  }
  return { count, ownerId, position, scale, baseRotX, baseRotY, baseRotZ, phase, speed };
}

function buildFillLayer(seedOffset) {
  const count = FILL_COUNT;
  const ownerId = new Int32Array(count);
  const position = new Float32Array(count * 3);
  const scale = new Float32Array(count);
  const baseRotX = new Float32Array(count);
  const baseRotY = new Float32Array(count);
  const baseRotZ = new Float32Array(count);
  const phase = new Float32Array(count);
  const speed = new Float32Array(count);

  const avgRadius =
    treeData.leaves.reduce((sum, l) => sum + l.radius, 0) / treeData.leaves.length;

  for (let k = 0; k < count; k++) {
    const base = (k + seedOffset) * 9.173;
    const h1 = hash(base + 0.7);
    const h2 = hash(base + 1.3);
    const h3 = hash(base + 2.1);
    const h4 = hash(base + 3.9);
    const h5 = hash(base + 4.7);

    // amostragem uniforme dentro de um elipsoide (raio cúbico pra não
    // concentrar pontos no centro)
    const theta = h1 * Math.PI * 2;
    const phi = Math.acos(2 * h2 - 1);
    const rr = Math.cbrt(h3);
    const px = CANOPY.center[0] + rr * CANOPY.radii[0] * Math.sin(phi) * Math.cos(theta);
    const py = CANOPY.center[1] + rr * CANOPY.radii[1] * Math.sin(phi) * Math.sin(theta);
    const pz = CANOPY.center[2] + rr * CANOPY.radii[2] * Math.cos(phi);

    const nearest = nearestLeafIndex([px, py, pz]);
    ownerId[k] = treeData.leaves[nearest].id;
    position[k * 3 + 0] = px;
    position[k * 3 + 1] = py;
    position[k * 3 + 2] = pz;

    scale[k] = avgRadius * (0.4 + h4 * 0.45);
    baseRotX[k] = (h1 - 0.5) * 1.4;
    baseRotY[k] = h2 * Math.PI * 2;
    baseRotZ[k] = (h3 - 0.5) * 1.4;
    phase[k] = h4 * Math.PI * 2;
    speed[k] = 0.5 + h5 * 0.6;
  }
  return { count, ownerId, position, scale, baseRotX, baseRotY, baseRotZ, phase, speed };
}

export default function Leaves({ revealedLeafIds, withering }) {
  const meshRef = useRef();
  const baseCount = treeData.leaves.length;

  const layers = useMemo(() => {
    const cluster = buildClusterLayer(baseCount);
    const fill = buildFillLayer(1000);
    const total = cluster.count + fill.count;

    const ownerId = new Int32Array(total);
    const position = new Float32Array(total * 3);
    const scale = new Float32Array(total);
    const baseRotX = new Float32Array(total);
    const baseRotY = new Float32Array(total);
    const baseRotZ = new Float32Array(total);
    const phase = new Float32Array(total);
    const speed = new Float32Array(total);

    ownerId.set(cluster.ownerId, 0);
    ownerId.set(fill.ownerId, cluster.count);
    position.set(cluster.position, 0);
    position.set(fill.position, cluster.count * 3);
    scale.set(cluster.scale, 0);
    scale.set(fill.scale, cluster.count);
    baseRotX.set(cluster.baseRotX, 0);
    baseRotX.set(fill.baseRotX, cluster.count);
    baseRotY.set(cluster.baseRotY, 0);
    baseRotY.set(fill.baseRotY, cluster.count);
    baseRotZ.set(cluster.baseRotZ, 0);
    baseRotZ.set(fill.baseRotZ, cluster.count);
    phase.set(cluster.phase, 0);
    phase.set(fill.phase, cluster.count);
    speed.set(cluster.speed, 0);
    speed.set(fill.speed, cluster.count);

    return { total, ownerId, position, scale, baseRotX, baseRotY, baseRotZ, phase, speed };
  }, [baseCount]);

  const scaleState = useRef(new Float32Array(layers.total));

  const geometry = useMemo(() => new THREE.PlaneGeometry(1.6, 1.6), []);
  const leafTexture = useMemo(() => createSingleLeafTexture(), []);
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: leafTexture,
        alphaMap: leafTexture,
        transparent: true,
        alphaTest: 0.4,
        side: THREE.DoubleSide,
        roughness: 0.7,
        metalness: 0,
        vertexColors: true,
      }),
    [leafTexture]
  );

  const leafColorById = useMemo(() => {
    const map = new Map();
    treeData.leaves.forEach((l) => map.set(l.id, l.color));
    return map;
  }, []);

  // Cor por instância — segue a cor da folha "dona" mais próxima (ou tom de murcha)
  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    for (let k = 0; k < layers.total; k++) {
      if (withering) {
        color.copy(WITHER_COLOR);
      } else {
        color.set(leafColorById.get(layers.ownerId[k]) || '#4caf50');
      }
      mesh.setColorAt(k, color);
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [withering, layers, leafColorById]);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = state.clock.elapsedTime;
    const targetBase = withering ? 0.8 : 1;

    // Rajadas: combina duas ondas lentas de frequências diferentes pra
    // simular vento que varia de intensidade (calmaria -> rajada -> calmaria)
    // em vez de um balanço uniforme e repetitivo.
    const gust =
      0.55 +
      0.3 * Math.sin(t * 0.12) +
      0.15 * Math.sin(t * 0.31 + 1.7);
    const windAmount = (withering ? 0.05 : 0.16) * Math.max(0.2, gust);
    // leve deslocamento na direção do vento, acompanhando a rajada
    const driftX = Math.sin(t * 0.09) * 0.05 * gust;
    const driftZ = Math.cos(t * 0.07 + 0.6) * 0.05 * gust;

    let anyVisible = false;

    for (let k = 0; k < layers.total; k++) {
      const isRevealed = revealedLeafIds.has(layers.ownerId[k]);
      const target = isRevealed ? targetBase : 0;
      const current = scaleState.current[k];
      const next = THREE.MathUtils.lerp(current, target, 0.12);
      scaleState.current[k] = next;
      if (next < 0.001) continue;

      anyVisible = true;
      const sc = Math.max(next, 0.0001) * layers.scale[k];

      const sway = Math.sin(t * layers.speed[k] + layers.phase[k]) * windAmount;
      const swaySecondary = Math.cos(t * layers.speed[k] * 0.7 + layers.phase[k]) * windAmount * 0.6;

      dummy.position.set(
        layers.position[k * 3 + 0] + driftX,
        layers.position[k * 3 + 1],
        layers.position[k * 3 + 2] + driftZ
      );
      dummy.rotation.set(
        layers.baseRotX[k] + sway,
        layers.baseRotY[k] + swaySecondary * 0.5,
        layers.baseRotZ[k] + swaySecondary
      );
      dummy.scale.set(sc, sc, sc);
      dummy.updateMatrix();
      mesh.setMatrixAt(k, dummy.matrix);
    }

    if (anyVisible) mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, layers.total]}
      castShadow
      receiveShadow
      frustumCulled={false}
    />
  );
}
