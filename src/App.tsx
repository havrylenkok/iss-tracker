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

  // Corrected coordinate mapping
  const getISSPosition = (lat: number, long: number) => {
    const phi = (90 - lat) * (Math.PI / 180)
    const theta = (long + 180) * (Math.PI / 180)
    const x = Math.sin(phi) * Math.cos(theta)
    const z = -Math.sin(phi) * Math.sin(theta)
    const y = Math.cos(phi)
    return [x * 1.1, y * 1.1, z * 1.1]
  }

  return (
    <div className="relative h-screen w-screen">
      <Canvas>
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
        <Stars radius={300} depth={60} count={20000} factor={7} />
        
        {/* Increased ambient light and adjusted directional lights */}
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 3, 5]} intensity={1.5} />
        <directionalLight position={[-5, -3, -5]} intensity={0.5} />
        <hemisphereLight intensity={0.5} />
        
        {/* Earth */}
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <sphereGeometry args={[1, 64, 64]} />
          <meshPhongMaterial 
            map={earthTexture}
            normalMap={normalMap}
            specularMap={specularMap}
            normalScale={new THREE.Vector2(0.85, 0.85)}
            shininess={5}
          />
        </mesh>

        {/* ISS - made it slightly larger and brighter */}
        {issPosition && (
          <mesh position={getISSPosition(issPosition.latitude, issPosition.longitude)}>
            <sphereGeometry args={[0.03, 16, 16]} />
            <meshStandardMaterial color="red" emissive="red" emissiveIntensity={3} />
          </mesh>
        )}
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