import React, { useMemo } from 'react';
import * as THREE from 'three';
import treeData from '../../data/tree3d.json';
import { createBarkTexture } from '../../utils/proceduralTextures.js';

function useTubeGeometry(points, radius) {
  return useMemo(() => {
    const vecs = points.map((p) => new THREE.Vector3(p[0], p[1], p[2]));
    const curve = new THREE.CatmullRomCurve3(vecs);
    return new THREE.TubeGeometry(curve, Math.max(8, vecs.length * 4), Math.max(radius, 0.03), 8, false);
  }, [points, radius]);
}

function useRootTexture() {
  return useMemo(
    () => createBarkTexture({ base: '#6d4c41', dark: '#3e2723', light: '#8d6e63', seed: 42 }),
    []
  );
}

function RootTube({ curveData, withering, map, length }) {
  const geometry = useTubeGeometry(curveData.points, curveData.width / 2);
  const color = withering ? '#6d4c41' : '#ffffff';

  useMemo(() => {
    map.repeat.set(2, Math.max(1, Math.round(length)));
    map.needsUpdate = true;
  }, [map, length]);

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial
        map={map}
        color={color}
        roughness={0.95}
        metalness={0}
        opacity={withering ? 0.8 : 1}
        transparent={withering}
      />
    </mesh>
  );
}

export default function Roots({ withering }) {
  const barkMap = useRootTexture();

  return (
    <group>
      {treeData.rootCurves.map((curveData, i) => {
        // uma textura por tubo (repeat próprio), clonada da base gerada uma única vez
        const map = i === 0 ? barkMap : barkMap.clone();
        const length = curveData.points.length * 0.5;
        return <RootTube key={i} curveData={curveData} withering={withering} map={map} length={length} />;
      })}
    </group>
  );
}
