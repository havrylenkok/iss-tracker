import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import * as THREE from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'

interface ISSPosition {
  latitude: number
  longitude: number
  altitude: number
  velocity: number
  timestamp: number
}

function App() {
  const [issPosition, setIssPosition] = useState<ISSPosition | null>(null)
  const [isSceneReady, setIsSceneReady] = useState(false)
  const controlsRef = useRef<OrbitControlsImpl>(null)
  const initialViewSet = useRef(false)
  const texturesLoaded = useRef(0)
  
  // Load textures and track loading
  const earthTexture = useMemo(() => {
    const texture = new THREE.TextureLoader().load(
      'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
      () => {
        texturesLoaded.current += 1
        checkIfReady()
      }
    )
    return texture
  }, [])

  const normalMap = useMemo(() => {
    const texture = new THREE.TextureLoader().load(
      'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg',
      () => {
        texturesLoaded.current += 1
        checkIfReady()
      }
    )
    return texture
  }, [])

  const specularMap = useMemo(() => {
    const texture = new THREE.TextureLoader().load(
      'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg',
      () => {
        texturesLoaded.current += 1
        checkIfReady()
      }
    )
    return texture
  }, [])

  // Check if everything is ready to show
  const checkIfReady = useCallback(() => {
    if (texturesLoaded.current === 3 && initialViewSet.current) {
      setIsSceneReady(true)
    }
  }, [])

  // Set up initial position before first render
  const initialSetup = useCallback((issPos: ISSPosition) => {
    if (controlsRef.current) {
      const controls = controlsRef.current
      controls.enableDamping = false
      
      // Convert ISS position to camera angles
      const radius = 2.75
      const phi = (90 - issPos.latitude) * (Math.PI / 180)
      const theta = issPos.longitude * (Math.PI / 180)
      
      // Calculate camera position to look at the ISS from the correct angle
      const x = radius * Math.sin(phi) * Math.cos(theta)
      const y = radius * Math.cos(phi)
      const z = -radius * Math.sin(phi) * Math.sin(theta)
      
      // Set camera position and target
      controls.object.position.set(x, y, z)
      controls.target.set(0, 0, 0)
      controls.update()

      initialViewSet.current = true
      checkIfReady()
    }
  }, [checkIfReady])

  // Handle initial ISS position
  useEffect(() => {
    const fetchInitialPosition = async () => {
      try {
        const response = await fetch('http://api.open-notify.org/iss-now.json')
        const data = await response.json()
        const velocityResponse = await fetch('https://api.wheretheiss.at/v1/satellites/25544')
        const velocityData = await velocityResponse.json()
        
        const initialIssPosition = {
          latitude: parseFloat(data.iss_position.latitude),
          longitude: parseFloat(data.iss_position.longitude),
          altitude: velocityData.altitude,
          velocity: velocityData.velocity,
          timestamp: data.timestamp
        }

        setIssPosition(initialIssPosition)
        initialSetup(initialIssPosition)

        // Start regular updates after initial position is set
        const interval = setInterval(fetchISSPosition, 3000)
        return () => clearInterval(interval)
      } catch (error) {
        console.error('Error fetching ISS position:', error)
      }
    }

    fetchInitialPosition()
  }, [initialSetup])

  // Regular position updates
  const fetchISSPosition = async () => {
    try {
      const response = await fetch('http://api.open-notify.org/iss-now.json')
      const data = await response.json()
      const velocityResponse = await fetch('https://api.wheretheiss.at/v1/satellites/25544')
      const velocityData = await velocityResponse.json()
      
      setIssPosition({
        latitude: parseFloat(data.iss_position.latitude),
        longitude: parseFloat(data.iss_position.longitude),
        altitude: velocityData.altitude,
        velocity: velocityData.velocity,
        timestamp: data.timestamp
      })
    } catch (error) {
      console.error('Error fetching ISS position:', error)
    }
  }

  // Professional coordinate mapping for geographic to Cartesian conversion
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
    <div className="relative h-screen w-screen">
      {/* Show loading state until scene is ready */}
      {!isSceneReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black text-white">
          <p className="text-xl">Loading...</p>
        </div>
      )}

      {/* Only render Canvas when we're ready */}
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
          
          {/* Lighting setup */}
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 3, 5]} intensity={1.5} />
          <directionalLight position={[-5, -3, -5]} intensity={0.5} />
          <hemisphereLight intensity={0.5} />
          
          {/* Earth with fixed rotation */}
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

            {/* ISS marker */}
            {issPosition && (
              <mesh position={getISSPosition(issPosition.latitude, issPosition.longitude)}>
                <sphereGeometry args={[0.03, 16, 16]} />
                <meshStandardMaterial color="red" emissive="red" emissiveIntensity={3} />
              </mesh>
            )}
          </group>
        </Canvas>
      </div>

      {/* Info Panel - show only when scene is ready */}
      {isSceneReady && (
        <div className="absolute top-4 right-4 bg-black/70 text-white p-4 rounded-lg z-10">
          <h2 className="text-xl font-bold mb-2">ISS Location</h2>
          {issPosition ? (
            <>
              <p>Latitude: {issPosition.latitude.toFixed(4)}°</p>
              <p>Longitude: {issPosition.longitude.toFixed(4)}°</p>
              <p>Altitude: {issPosition.altitude.toFixed(2)} km</p>
              <p>Velocity: {issPosition.velocity.toFixed(2)} km/h</p>
              <p>Last Update: {new Date(issPosition.timestamp * 1000).toLocaleTimeString()}</p>
            </>
          ) : (
            <p>Loading ISS data...</p>
          )}
        </div>
      )}
    </div>
  )
}

export default App 