import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

const MODEL_URL = '/models/sneakers_seen.glb'

const PART_NAMES = {
  upper: ['Wamp_low', 'Superblok_low', 'Zig_low', 'Tibiae_s_low', 'Toe_low', 'Buckle_low'],
  laces: ['Shoelace_low'],
  sole: ['Sole_low', 'Cushion_low', 'Insole_low'],
  tongue: ['Tongue_low'],
  heel: ['Backside_low'],
}

function getPart(name) {
  const normalized = name.replace(/_\d+$/, '')
  return Object.entries(PART_NAMES).find(([, names]) =>
    names.includes(normalized),
  )?.[0]
}

function cloneMaterial(material) {
  const cloned = material.clone()
  if (cloned.color) {
    cloned.userData.auraOriginalColor = cloned.color.getHex()
  }
  return cloned
}

function GalleryModel({ partColors }) {
  const { scene } = useGLTF(MODEL_URL)

  const model = useMemo(() => {
    const clone = scene.clone(true)
    clone.traverse((object) => {
      if (!object.isMesh) return

      object.material = Array.isArray(object.material)
        ? object.material.map(cloneMaterial)
        : cloneMaterial(object.material)

      object.castShadow = true
      object.receiveShadow = true
    })

    const bounds = new THREE.Box3().setFromObject(clone)
    const center = bounds.getCenter(new THREE.Vector3())
    const size = bounds.getSize(new THREE.Vector3())
    const scale = 2.8 / Math.max(size.x, size.y, size.z, 0.001)

    clone.scale.setScalar(scale)
    clone.position.set(
      -center.x * scale,
      -center.y * scale,
      -center.z * scale,
    )

    return clone
  }, [scene])

  useEffect(() => {
    model.traverse((object) => {
      if (!object.isMesh) return
      const part = getPart(object.name)
      if (!part || !partColors[part]) return

      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material]

      materials.forEach((material) => {
        const original = material.userData.auraOriginalColor

        if (original !== undefined && material.color) {
          material.color.setHex(original)
        }

        if (material.color) {
          material.color.multiply(new THREE.Color(partColors[part]))
          material.needsUpdate = true
        }
      })
    })
  }, [model, partColors])

  return (
    <>
      <ambientLight intensity={1.8} />
      <directionalLight position={[3, 5, 4]} intensity={2.5} />
      <Environment preset="city" />
      <primitive object={model} />
    </>
  )
}

function GalleryTile({ view, partColors }) {
  const tileRef = useRef(null)
  const [isVisible, setIsVisible] = useState(() => typeof IntersectionObserver === 'undefined')

  useEffect(() => {
    const element = tileRef.current
    if (!element || isVisible) return

    if (typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '160px' },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [isVisible])

  return (
    <div
      ref={tileRef}
      className="relative aspect-[5/4] overflow-hidden rounded-lg border border-white/10 bg-[#181816]"
    >
      {isVisible ? (
      <Canvas
        camera={{
          position:
            view === 'Side'
              ? [3.8, 1.4, 4.5]
              : view === 'Top'
              ? [0, 5.5, 0.2]
              : view === 'Heel'
              ? [-4.5, 1.6, -0.5]
              : [0, -5.5, 0.2],
          fov: 38,
        }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <GalleryModel partColors={partColors} />
        </Suspense>
      </Canvas>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="h-5 w-5 animate-spin rounded-full border border-white/15 border-t-[#d8ff3e]" />
        </div>
      )}
      <span className="pointer-events-none absolute bottom-3 left-3 text-[9px] uppercase tracking-[0.16em] text-white/65">
        {view} view
      </span>
    </div>
  )
}

export default function SneakerGallery({ partColors }) {
  const views = ['Side', 'Top', 'Heel', 'Sole']

  return (
    <section className="mt-3">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-[0.17em] text-white/50">
          Your pair, from every angle
        </p>
        <span className="text-[9px] uppercase tracking-[0.12em] text-white/30">
          Live 3D views
        </span>
      </div>
      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3">
        {views.map((view) => (
          <div key={view} className="w-[44%] shrink-0 snap-start sm:w-[30%] lg:w-auto lg:flex-1">
            <GalleryTile view={view} partColors={partColors} />
          </div>
        ))}
      </div>
    </section>
  )
}

useGLTF.preload(MODEL_URL)
