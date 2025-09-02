"use client"

import { useState } from "react"

// Mock implementation of useVapi hook
// Replace this with your actual VAPI integration
const useVapi = () => {
  const [volumeLevel, setVolumeLevel] = useState(0)
  const [isSessionActive, setIsSessionActive] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  const toggleCall = () => {
    setIsSessionActive(!isSessionActive)

    // Simulate volume level changes when session is active
    if (!isSessionActive) {
      setIsMuted(false)
      const interval = setInterval(() => {
        setVolumeLevel(Math.random() * 0.8 + 0.2) // Random volume between 0.2 and 1.0
      }, 100)

      // Clean up interval when session ends
      setTimeout(() => {
        clearInterval(interval)
        setVolumeLevel(0)
      }, 10000) // Stop after 10 seconds for demo
    } else {
      setVolumeLevel(0)
      setIsMuted(false)
    }
  }

  const toggleMute = () => {
    if (isSessionActive) {
      setIsMuted(!isMuted)
    }
  }

  const endCall = () => {
    if (isSessionActive) {
      setIsSessionActive(false)
      setVolumeLevel(0)
      setIsMuted(false)
    }
  }

  return {
    volumeLevel,
    isSessionActive,
    isMuted,
    toggleCall,
    toggleMute,
    endCall,
  }
}

export default useVapi
