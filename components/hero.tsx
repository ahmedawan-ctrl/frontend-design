"use client"

import { Suspense, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { Scene } from "@/components/scene"
import Siri from "@/components/vapi/siri"
import { AnimatedZionLogo } from "@/components/animated-zion-logo"

export function Hero() {
  const [showText, setShowText] = useState(false)

  const handleLogoAnimationComplete = () => {
    setShowText(true)
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <div className="absolute top-8 left-0 right-0 z-20 flex flex-col items-center">
        <AnimatedZionLogo onAnimationComplete={handleLogoAnimationComplete} />

        {showText && (
          <div className="mt-4 mb-8">
            <p className="text-xl md:text-2xl font-medium tracking-[0.20em] text-center text-white">
              The VOICE that Remembers
            </p>
          </div>
        )}
      </div>

      {/* Existing code */}
      <div className="absolute inset-0 z-0">
        <Canvas>
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
      </div>

      <div className="absolute bottom-16 left-0 right-0 z-20 flex justify-center">
        <Siri theme="ios9" />
      </div>
    </div>
  )
}
