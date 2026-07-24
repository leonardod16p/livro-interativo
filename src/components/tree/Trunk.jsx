import React, { useMemo } from 'react';
import * as THREE from 'three';
import { svgTo3D } from '../../utils/coords.js';
import { createBarkTexture, createBarkRoughnessTexture } from '../../utils/proceduralTextures.js';

export default function Trunk({ withering }) {
  const { height, radiusBottom, radiusTop } = useMemo(() => {
    const [, topY] = svgTo3D(1000, 100); // topo do tronco no SVG original
    const [, baseY] = svgTo3D(1000, 900); // base do tronco (nível do chão)
    return {
      height: topY - baseY,
      radiusBottom: 40 / 45,
      radiusTop: 22 / 45,
    };
  }, []);

  const { barkMap, roughnessMap } = useMemo(() => {
    const map = createBarkTexture({ base: '#8d6e63', dark: '#3e2723', light: '#a1887f' });
    const rough = createBarkRoughnessTexture();
    // Repete a textura ao longo da altura e da circunferência do tronco
    const repeatY = Math.max(1, Math.round(height / 3));
    map.repeat.set(3, repeatY);
    rough.repeat.set(3, repeatY);
    map.needsUpdate = true;
    rough.needsUpdate = true;
    return { barkMap: map, roughnessMap: rough };
  }, [height]);

  return (
    <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[radiusTop, radiusBottom, height, 16, 6]} />
      <meshStandardMaterial
        map={barkMap}
        roughnessMap={roughnessMap}
        roughness={withering ? 1 : 0.85}
        metalness={0}
        color={withering ? '#8d7266' : '#ffffff'}
      />
    </mesh>
  );
}
