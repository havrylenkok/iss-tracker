import React, { useState, useRef, useMemo, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import * as THREE from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { Earth } from './components/Earth'
import { ISSInfoPanel } from './components/ISSInfoPanel'
import { useISSPosition } from './hooks/useISSPosition'
import type { ISSPosition } from './types'

function App() {
  const [isSceneReady, setIsSceneReady] = useState(false)
  const controlsRef = useRef<OrbitControlsImpl>(null)
  const initialViewSet = useRef(false)
  const texturesLoaded = useRef(0)
  
  const checkIfReady = useCallback(() => {
    if (texturesLoaded.current === 3 && initialViewSet.current) {
      setIsSceneReady(true)
    }
  }, [])

  const initialSetup = useCallback((issPos: ISSPosition) => {
    if (controlsRef.current) {
      const controls = controlsRef.current
      controls.enableDamping = false
      
      const radius = 2.75
      const phi = (90 - issPos.latitude) * (Math.PI / 180)
      const theta = issPos.longitude * (Math.PI / 180)
      
      const x = radius * Math.sin(phi) * Math.cos(theta)
      const y = radius * Math.cos(phi)
      const z = -radius * Math.sin(phi) * Math.sin(theta)
      
      controls.object.position.set(x, y, z)
      controls.target.set(0, 0, 0)
      controls.update()

      initialViewSet.current = true
      checkIfReady()
    }
  }, [checkIfReady])

  const issPosition = useISSPosition(initialSetup)

  const [earthTexture, normalMap, specularMap] = useMemo(() => {
    const loadTexture = (url: string) => {
      return new THREE.TextureLoader().load(url, () => {
        texturesLoaded.current += 1
        checkIfReady()
      })
    }

    return [
      loadTexture('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg'),
      loadTexture('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg'),
      loadTexture('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg')
    ]
  }, [checkIfReady])

  return (
    <div className="relative h-screen w-screen">
      {!isSceneReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black text-white">
          <p className="text-xl">Loading...</p>
        </div>
      )}

      <div className={`absolute inset-0 ${isSceneReady ? "opacity-100" : "opacity-0"}`}>
        <Canvas camera={{ position: [0, 0, 2.75], fov: 45 }}>
          <OrbitControls 
            ref={controlsRef}
            enablePan={true} 
            enableZoom={true} 
            enableRotate={true}
            minDistance={1.5}
            maxDistance={4}
            rotateSpeed={0.5}
            enableDamping={false}
          />
          <Stars radius={300} depth={60} count={20000} factor={7} />
          
          <ambientLight intensity={1.2} />
          <directionalLight position={[5, 3, 5]} intensity={2} />
          <directionalLight position={[-5, -3, -5]} intensity={0.8} />
          <hemisphereLight intensity={0.8} />
          
          <Earth 
            earthTexture={earthTexture}
            normalMap={normalMap}
            specularMap={specularMap}
            issPosition={issPosition}
          />
        </Canvas>
      </div>

      {isSceneReady && <ISSInfoPanel issPosition={issPosition} />}
    </div>
  )
}

export default App 