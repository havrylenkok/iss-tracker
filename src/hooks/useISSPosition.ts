import { useState, useEffect, useCallback } from 'react'
import { ISSPosition } from '../types'

export const useISSPosition = (onInitialPosition: (position: ISSPosition) => void) => {
  const [issPosition, setIssPosition] = useState<ISSPosition | null>(null)

  const fetchISSPosition = async () => {
    try {
      const response = await fetch('https://api.wheretheiss.at/v1/satellites/25544')
      const data = await response.json()
      
      return {
        latitude: data.latitude,
        longitude: data.longitude,
        altitude: data.altitude,
        velocity: data.velocity,
        timestamp: Math.floor(new Date(data.timestamp * 1000).getTime() / 1000)
      }
    } catch (error) {
      console.error('Error fetching ISS position:', error)
      return null
    }
  }

  useEffect(() => {
    const fetchInitialPosition = async () => {
      const initialPosition = await fetchISSPosition()
      if (initialPosition) {
        setIssPosition(initialPosition)
        onInitialPosition(initialPosition)

        const interval = setInterval(async () => {
          const newPosition = await fetchISSPosition()
          if (newPosition) setIssPosition(newPosition)
        }, 3000)
        
        return () => clearInterval(interval)
      }
    }

    fetchInitialPosition()
  }, [onInitialPosition])

  return issPosition
} 