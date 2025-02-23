import React, { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import * as THREE from 'three'

interface ISSPosition {
  latitude: number
  longitude: number
  altitude: number
  velocity: number
  timestamp: number
}

function App() {
  const [issPosition, setIssPosition] = useState<ISSPosition | null>(null)
  
  // Load both color and normal maps
  const earthTexture = new THREE.TextureLoader().load(
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg'
  )
  const normalMap = new THREE.TextureLoader().load(
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg'
  )
  const specularMap = new THREE.TextureLoader().load(
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg'
  )

  useEffect(() => {
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

    fetchISSPosition()
    const interval = setInterval(fetchISSPosition, 3000)
    return () => clearInterval(interval)
  }, [])

  // Professional coordinate mapping for geographic to Cartesian conversion
  const getISSPosition = (lat: number, long: number) => {
    // Convert to radians and adjust for Three.js coordinate system
    const latRad = lat * (Math.PI / 180)
    const longRad = -long * (Math.PI / 180)
    
    // Standard spherical to Cartesian conversion
    const radius = 1.1
    return [
      radius * Math.cos(latRad) * Math.cos(longRad),
      radius * Math.sin(latRad),
      radius * Math.cos(latRad) * Math.sin(longRad)
    ]
  }

  // Calculate camera position to look at ISS
  const getCameraRotation = (long: number) => {
    // Convert to radians and adjust for texture orientation
    return [0, (-long * Math.PI) / 180 + Math.PI / 2, 0]
  }

  return (
    <div className="relative h-screen w-screen">
      <Canvas camera={{ position: [0, 0, 2.75], fov: 45 }}>
        <OrbitControls 
          enablePan={true} 
          enableZoom={true} 
          enableRotate={true}
          minDistance={1.5}
          maxDistance={4}
          rotateSpeed={0.5}
        />
        <Stars radius={300} depth={60} count={20000} factor={7} />
        
        {/* Lighting setup */}
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 3, 5]} intensity={1.5} />
        <directionalLight position={[-5, -3, -5]} intensity={0.5} />
        <hemisphereLight intensity={0.5} />
        
        {/* Earth with dynamic rotation to follow ISS */}
        <group rotation={issPosition ? getCameraRotation(issPosition.longitude) : [0, Math.PI / 2, 0]}>
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

      {/* Info Panel */}
      <div className="absolute top-4 right-4 bg-black/70 text-white p-4 rounded-lg">
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
    </div>
  )
}

export default App 