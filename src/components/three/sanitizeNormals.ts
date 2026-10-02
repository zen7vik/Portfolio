import * as THREE from 'three'

// drei RoundedBox and extruded text ship a few zero-length normals; on real GPUs
// normalize(vec3(0)) is NaN and those pixels flash black. Patch them once.
export function sanitizeNormals(scene: THREE.Object3D) {
  const center = new THREE.Vector3()
  const v = new THREE.Vector3()
  const seen = new Set<THREE.BufferGeometry>()
  scene.traverse((o) => {
    const g = (o as THREE.Mesh).geometry as THREE.BufferGeometry | undefined
    if (!g || seen.has(g)) return
    seen.add(g)
    const n = g.attributes.normal
    const pos = g.attributes.position
    if (!n || !pos) return
    if (!g.boundingBox) g.computeBoundingBox()
    g.boundingBox!.getCenter(center)
    let fixed = 0
    for (let i = 0; i < n.count; i++) {
      const x = n.getX(i)
      const y = n.getY(i)
      const z = n.getZ(i)
      if (Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z) && x * x + y * y + z * z > 1e-8) continue
      v.set(pos.getX(i), pos.getY(i), pos.getZ(i)).sub(center)
      if (v.lengthSq() < 1e-8) v.set(0, 1, 0)
      v.normalize()
      n.setXYZ(i, v.x, v.y, v.z)
      fixed++
    }
    if (fixed) n.needsUpdate = true
  })
}
