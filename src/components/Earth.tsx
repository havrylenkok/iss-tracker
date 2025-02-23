import React from 'react'
import * as THREE from 'three'
import { ISSPosition } from '../types'

interface EarthProps {
  earthTexture: THREE.Texture
  normalMap: THREE.Texture
  specularMap: THREE.Texture
  issPosition: ISSPosition | null
}

export const Earth: React.FC<EarthProps> = ({ 
  earthTexture, 
  normalMap, 
  specularMap, 
  issPosition 
}) => {
  const getISSPosition = (lat: number, long: number): THREE.Vector3 => {
    const latRad = lat * (Math.PI / 180)
    const longRad = -long * (Math.PI / 180)
    
    const radius = 1.1
    return new THREE.Vector3(
      radius * Math.cos(latRad) * Math.cos(longRad),
      radius * Math.sin(latRad),
      radius * Math.cos(latRad) * Math.sin(longRad)
    )
  }

  return (
    <group rotation={[0, 0, 0]}>
      <mesh>
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhongMaterial 
          map={earthTexture}
          normalMap={normalMap}
          specularMap={specularMap}
          normalScale={new THREE.Vector2(0.85, 0.85)}
          shininess={5}
        />
      </mesh>

      {issPosition && (
        <mesh position={getISSPosition(issPosition.latitude, issPosition.longitude)}>
          <sphereGeometry args={[0.03, 16, 16]} />
          <meshStandardMaterial color="red" emissive="red" emissiveIntensity={3} />
        </mesh>
      )}
    </group>
  )
} 