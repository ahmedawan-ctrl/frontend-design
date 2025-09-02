"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Mic, MicOff, Square } from "lucide-react"
import ReactSiriwave, { type IReactSiriwaveProps } from "react-siriwave"
import { motion } from "framer-motion"
import useVapi from "@/hooks/use-vapi" // Adjust the import path as needed

// Define CurveStyle type
type CurveStyle = "ios" | "ios9"

interface SiriProps {
  theme: CurveStyle
}

const Siri: React.FC<SiriProps> = ({ theme }) => {
  const { volumeLevel, isSessionActive, isMuted, toggleCall, toggleMute, endCall } = useVapi()
  const [siriWaveConfig, setSiriWaveConfig] = useState<IReactSiriwaveProps>({
    theme: theme || "ios9",
    ratio: 1,
    speed: 0.2,
    amplitude: 1,
    frequency: 6,
    color: "#fff",
    cover: false,
    width: 300,
    height: 100,
    autostart: true,
    pixelDepth: 1,
    lerpSpeed: 0.1,
  })

  useEffect(() => {
    setSiriWaveConfig((prevConfig) => ({
      ...prevConfig,
      amplitude: isSessionActive ? (volumeLevel > 0.01 ? volumeLevel * 7.5 : 0) : 0,
      speed: isSessionActive ? (volumeLevel > 0.5 ? volumeLevel * 10 : 0) : 0,
      frequency: isSessionActive
        ? volumeLevel > 0.01
          ? volumeLevel * 5
          : 0
        : volumeLevel > 0.5
          ? volumeLevel * 10
          : 0,
    }))
  }, [volumeLevel, isSessionActive])

  const handleToggleCall = () => {
    if (!isSessionActive) {
      // Start the call if not active
      toggleCall()
    } else {
      // Mute/unmute if call is active
      toggleMute()
    }
  }

  const handleEndCall = () => {
    endCall()
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-full">
      <div className="flex items-center justify-center gap-2">
        <motion.button
          key="micButton"
          onClick={handleToggleCall}
          className="p-2 rounded-2xl border-2 border-black bg-white flex items-center justify-center"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
          style={{ zIndex: 10, position: "relative" }}
        >
          {isSessionActive && isMuted ? (
            <MicOff size={18} className="text-black" />
          ) : (
            <Mic size={18} className="text-black" />
          )}
        </motion.button>

        <motion.div
          className="rounded-4xl p-4 overflow-hidden"
          initial={{ width: "0px", opacity: 0 }}
          animate={{ width: "100%", opacity: 1 }}
          exit={{ width: "0px", opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ReactSiriwave {...siriWaveConfig} />
        </motion.div>

        <motion.button
          key="endCallButton"
          onClick={handleEndCall}
          className="p-2 rounded-2xl border-8 border-white bg-transparent flex items-center justify-center"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
          style={{ zIndex: 10, position: "relative" }}
        >
          <Square size={4} className="text-black fill-black" />
        </motion.button>
      </div>
    </div>
  )
}

export default Siri
