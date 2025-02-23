"use client"

import { useLoader } from "@react-three/fiber"
import { TextureLoader } from "three"
import { useEffect } from "react"
import { useTheme } from "next-themes"

export default function Earth() {
  const colorMap = useLoader(TextureLoader, "/assets/3d/texture_earth.jpg")

  const { theme } = useTheme()

  useEffect(() => {
    if (colorMap) {
      colorMap.anisotropy = 16
    }
  }, [colorMap])

  return (
    <mesh>
      <sphereGeometry args={[5, 64, 64]} />
      <meshStandardMaterial map={colorMap} metalness={0.1} roughness={0.7} />
    </mesh>
  )
}

