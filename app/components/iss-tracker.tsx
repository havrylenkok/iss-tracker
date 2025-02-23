"use client"

import { useEffect, useRef, useState, Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Stars } from "@react-three/drei"
import useSWR from "swr"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import Earth from "./earth"
import ISSMarker from "./iss-marker"
import ISSInfo from "./iss-info"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function ISSTracker() {
  const { theme, setTheme } = useTheme()
  const controlsRef = useRef()
  const [userLocation, setUserLocation] = useState({ lat: 0, lon: 0 })

  const { data: issData, error } = useSWR("https://api.wheretheiss.at/v1/satellites/25544", fetcher, {
    refreshInterval: 3000,
  })

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        })
      })
    }
  }, [])

  if (error) return <div>Failed to load ISS data</div>

  return (
    <div className="relative w-full h-screen">
      <Canvas
        camera={{
          position: [0, 0, 12],
          fov: 45,
        }}
      >
        <color attach="background" args={[0x000000]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <directionalLight position={[-5, 5, 5]} intensity={1} />
        <Stars radius={300} depth={60} count={20000} factor={7} saturation={0} />

        <Suspense fallback={null}>
          <Earth />
          {issData && <ISSMarker position={[issData.latitude, issData.longitude, issData.altitude / 1000]} />}
        </Suspense>

        <OrbitControls ref={controlsRef} enablePan={false} minDistance={5.5} maxDistance={20} />
      </Canvas>

      <Card className="absolute top-4 right-4 bg-background/80 backdrop-blur">
        <CardContent className="p-4">
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </CardContent>
      </Card>

      {issData && <ISSInfo issData={issData} userLocation={userLocation} />}
    </div>
  )
}

