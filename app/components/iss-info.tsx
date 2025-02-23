"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"

interface ISSData {
  latitude: number
  longitude: number
  altitude: number
  velocity: number
}

interface UserLocation {
  lat: number
  lon: number
}

export default function ISSInfo({
  issData,
  userLocation,
}: {
  issData: ISSData
  userLocation: UserLocation
}) {
  const [nextPass, setNextPass] = useState<string>("")

  useEffect(() => {
    const calculateNextPass = async () => {
      try {
        const response = await fetch(
          `https://api.wheretheiss.at/v1/satellites/25544/passes?lat=${userLocation.lat}&lon=${userLocation.lon}&alt=0&n=1`,
        )
        const data = await response.json()
        if (data && data[0]) {
          const passTime = new Date(data[0].risetime * 1000)
          setNextPass(passTime.toLocaleString())
        }
      } catch (error) {
        console.error("Error fetching next pass:", error)
      }
    }

    if (userLocation.lat && userLocation.lon) {
      calculateNextPass()
    }
  }, [userLocation])

  return (
    <Card className="absolute bottom-4 left-4 bg-background/80 backdrop-blur">
      <CardHeader>
        <CardTitle>ISS Location Data</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        <div>
          <div className="text-sm font-medium">Latitude</div>
          <div className="text-2xl">{issData.latitude.toFixed(2)}°</div>
        </div>
        <div>
          <div className="text-sm font-medium">Longitude</div>
          <div className="text-2xl">{issData.longitude.toFixed(2)}°</div>
        </div>
        <div>
          <div className="text-sm font-medium">Altitude</div>
          <div className="text-2xl">{issData.altitude.toFixed(2)} km</div>
        </div>
        <div>
          <div className="text-sm font-medium">Velocity</div>
          <div className="text-2xl">{issData.velocity.toFixed(2)} km/h</div>
        </div>
        {nextPass && (
          <div>
            <div className="text-sm font-medium">Next Pass</div>
            <div className="text-2xl">{nextPass}</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

