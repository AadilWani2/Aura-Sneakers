import { Suspense, useEffect, useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import {
  ContactShadows,
  Environment,
  Float,
  Html,
  OrbitControls,
  useGLTF,
} from '@react-three/drei'
import * as THREE from 'three'

const MODEL_URL = '/models/sneakers_seen.glb'

const PART_NAMES = {
  upper: [
    'Wamp_low',
    'Superblok_low',
    'Zig_low',
    'Tibiae_s_low',
    'Toe_low',
    'Buckle_low',
  ],
  laces: ['Shoelace_low'],
  sole: ['Sole_low', 'Cushion_low', 'Insole_low'],
  tongue: ['Tongue_low'],
  heel: ['Backside_low'],
}

function normalizeMeshName(name) {
  return name.replace(/_\d+$/, '')
}

function getPartName(objectName) {
  const name = normalizeMeshName(objectName)

  for (const [part, meshNames] of Object.entries(PART_NAMES)) {
    if (meshNames.includes(name)) {
      return part
    }
  }

  return null
}

function cloneMaterial(material) {
  const cloned = material.clone()

  // Keep the original base colour for accurate restoration.
  if (cloned.color) {
    cloned.userData.auraOriginalColor = cloned.color.getHex()
  }

  return cloned
}

function SneakerModel({ partColors }) {
  const { scene } = useGLTF(MODEL_URL)

  const model = useMemo(() => {
    const clonedScene = scene.clone(true)

    clonedScene.traverse((child) => {
      if (!child.isMesh) return

      child.material = Array.isArray(child.material)
        ? child.material.map(cloneMaterial)
        : cloneMaterial(child.material)

      child.castShadow = true
      child.receiveShadow = true
    })

    // Centre the model and scale it consistently.
    const bounds = new THREE.Box3().setFromObject(clonedScene)
    const center = bounds.getCenter(new THREE.Vector3())
    const size = bounds.getSize(new THREE.Vector3())
    const largestDimension = Math.max(size.x, size.y, size.z) || 1
    const scale = 3.5 / largestDimension

    clonedScene.scale.setScalar(scale)
    clonedScene.position.set(
      -center.x * scale,
      -center.y * scale,
      -center.z * scale,
    )

    return clonedScene
  }, [scene])

  useEffect(() => {
    model.traverse((child) => {
      if (!child.isMesh) return

      const part = getPartName(child.name)
      if (!part) return

      const selectedColor = partColors[part] || '#ffffff'
      const tint = new THREE.Color(selectedColor)

      const materials = Array.isArray(child.material)
        ? child.material
        : [child.material]

      materials.forEach((material) => {
        if (!material.color) return

        const originalHex = material.userData.auraOriginalColor

        if (originalHex === undefined) return

        // Restore the original material colour first, then apply
        // the chosen tint. White (#ffffff) leaves the original
        // texture and base colour untinted.
        material.color.setHex(originalHex)
        material.color.multiply(tint)
      })
    })
  }, [model, partColors])

  return <primitive object={model} />
}

function SceneLoader() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3 whitespace-nowrap text-center">
        <span className="h-7 w-7 animate-spin rounded-full border border-white/15 border-t-[#d8ff3e]" />
        <span className="text-[9px] uppercase tracking-[0.2em] text-white/55">
          Preparing your pair
        </span>
      </div>
    </Html>
  )
}

function SceneContents({ partColors, isMobile }) {
  return (
    <>
      <ambientLight intensity={1.6} />

      <directionalLight
        position={[4, 6, 5]}
        intensity={2.5}
        castShadow={!isMobile}
      />

      <directionalLight
        position={[-4, 2, -3]}
        intensity={1.5}
      />

      <Float
        speed={1.2}
        rotationIntensity={0.08}
        floatIntensity={0.18}
      >
        <SneakerModel partColors={partColors} />
      </Float>

      {!isMobile && (
        <>
          <ContactShadows
            position={[0, -1.25, 0]}
            opacity={0.4}
            scale={7}
            blur={2.5}
            far={3}
          />
          <Environment preset="city" />
        </>
      )}

      <OrbitControls
        makeDefault
        autoRotate
        autoRotateSpeed={0.45}
        enableRotate
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.8}
      />
    </>
  )
}

export default function SneakerScene({ partColors }) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px), (pointer: coarse)')
    const updateDeviceMode = () => setIsMobile(media.matches)

    updateDeviceMode()
    media.addEventListener?.('change', updateDeviceMode)
    return () => media.removeEventListener?.('change', updateDeviceMode)
  }, [])

  return (
    <Canvas
      shadows={!isMobile}
      camera={{ position: [3.5, 2.1, 4.5], fov: 38 }}
      dpr={isMobile ? 1 : [1, 1.35]}
      gl={{
        antialias: !isMobile,
        alpha: true,
        powerPreference: 'high-performance',
      }}
      fallback={
        <div className="flex h-full w-full items-center justify-center text-xs text-white/45">
          Your browser does not support the 3D preview.
        </div>
      }
    >
      <Suspense fallback={<SceneLoader />}>
        <SceneContents partColors={partColors} isMobile={isMobile} />
      </Suspense>
    </Canvas>
  )
}

useGLTF.preload(MODEL_URL)
