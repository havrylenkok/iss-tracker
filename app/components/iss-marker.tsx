"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

export default function ISSMarker({ position }: { position: [number, number, number] }) {
  const markerRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)

  // Convert lat/lon to 3D coordinates
  const phi = (90 - position[0]) * (Math.PI / 180)
  const theta = (position[1] + 180) * (Math.PI / 180)
  const radius = 5 + position[2] / 100

  const x = -(radius * Math.sin(phi) * Math.cos(theta))
  const y = radius * Math.cos(phi)
  const z = radius * Math.sin(phi) * Math.sin(theta)

  useFrame((state) => {
    if (glowRef.current) {
      glowRef.current.rotation.z += 0.01
      glowRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime) * 0.1)
    }
  })

  return (
    <group position={[x, y, z]}>
      <mesh ref={markerRef}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color={0xff0000} />
      </mesh>
      <mesh ref={glowRef}>
        <ringGeometry args={[0.15, 0.2, 32]} />
        <meshBasicMaterial color={0xff0000} transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

