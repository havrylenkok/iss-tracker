import React from 'react'
import { ISSPosition } from '../types'

interface ISSInfoPanelProps {
  issPosition: ISSPosition | null
}

export const ISSInfoPanel: React.FC<ISSInfoPanelProps> = ({ issPosition }) => {
  return (
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
  )
} 