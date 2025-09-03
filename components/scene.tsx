"use client"

import { useRef, useMemo } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { useFBO } from "@react-three/drei"
import { EffectComposer, Bloom, N8AO } from "@react-three/postprocessing"
import * as THREE from "three"

// Custom shader material for the fluid effect
const simulationMaterial = new THREE.ShaderMaterial({
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    uniform sampler2D uCurrentPosition;
    uniform sampler2D uOriginalPosition;
    uniform float uTime;
    uniform float uCurl;
    uniform float uSpeed;

    vec3 snoise(vec3 uv) {
      uv.x += uTime * 0.005;
      float s = sin(uv.z * 1.5) * 0.3 + cos(uv.y * 2.1) * 0.2 + sin(uv.x * 1.8) * 0.25;
      float c = cos(uv.z * 1.5) * 0.3 + sin(uv.y * 2.1) * 0.2 + cos(uv.x * 1.8) * 0.25;
      float s2 = sin(uv.y * 0.8) * 0.25 + cos(uv.x * 1.5) * 0.2 + sin(uv.z * 0.9) * 0.3;
      return vec3(s, c, s2) * uCurl;
    }

    void main() {
      vec3 currentPos = texture2D(uCurrentPosition, vUv).xyz;
      vec3 originalPos = texture2D(uOriginalPosition, vUv).xyz;
      
      // Add noise-based movement
      vec3 noise = snoise(currentPos * 0.15 + uTime * 0.1);
      
      // Apply movement with damping
      currentPos += noise * uSpeed;
      
      // Add slight attraction back to original position to prevent drift
      vec3 attraction = (originalPos - currentPos) * 0.002;
      currentPos += attraction;
      
      gl_FragColor = vec4(currentPos, 1.0);
    }
  `,
  uniforms: {
    uCurrentPosition: { value: null },
    uOriginalPosition: { value: null },
    uTime: { value: 0 },
    uCurl: { value: 0.8 },
    uSpeed: { value: 0.008 },
  },
})

const renderMaterial = new THREE.ShaderMaterial({
  vertexShader: `
    uniform sampler2D uPosition;
    uniform float uTime;
    varying vec3 vColor;
    varying float vAlpha;

    void main() {
      vec3 pos = texture2D(uPosition, position.xy).xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      gl_PointSize = 2.0;
      
      // Create dynamic colors based on position and time
      vColor = normalize(pos) * 0.6 + 0.4;
      vColor.r += sin(uTime * 0.5 + pos.x) * 0.2;
      vColor.g += cos(uTime * 0.3 + pos.y) * 0.2;
      vColor.b += sin(uTime * 0.7 + pos.z) * 0.2;
      
      vAlpha = 0.8;
    }
  `,
  fragmentShader: `
    varying vec3 vColor;
    varying float vAlpha;
    
    void main() {
      // Create circular points
      vec2 center = gl_PointCoord - 0.5;
      float dist = length(center);
      if (dist > 0.5) discard;
      
      float alpha = (1.0 - dist * 2.0) * vAlpha;
      gl_FragColor = vec4(vColor, alpha);
    }
  `,
  uniforms: {
    uPosition: { value: null },
    uTime: { value: 0 },
  },
  transparent: true,
  blending: THREE.AdditiveBlending,
})

export function Scene() {
  const size = 256 // Reduced size for better performance
  const pointsRef = useRef<THREE.Points>(null!)
  const { gl } = useThree()

  // Create ping-pong FBOs for simulation
  const fboA = useFBO(size, size, {
    type: THREE.FloatType,
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat,
  })
  const fboB = useFBO(size, size, {
    type: THREE.FloatType,
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat,
  })

  // Track which FBO is current
  const currentFBO = useRef(fboA)
  const nextFBO = useRef(fboB)

  // Initialize particle positions and textures
  const { originalPositionTexture, particlePositions } = useMemo(() => {
    // Initialize particle positions
    const particles = new Float32Array(size * size * 4) // RGBA format
    const geometry = new THREE.TorusKnotGeometry(1.5, 0.4, 200, 32)
    const positions = geometry.attributes.position.array as Float32Array

    for (let i = 0; i < size * size; i++) {
      const i4 = i * 4
      const p_i = (i * 3) % positions.length

      // Add some randomness to initial positions
      const randomOffset = 0.1
      particles[i4 + 0] = positions[p_i + 0] + (Math.random() - 0.5) * randomOffset
      particles[i4 + 1] = positions[p_i + 1] + (Math.random() - 0.5) * randomOffset
      particles[i4 + 2] = positions[p_i + 2] + (Math.random() - 0.5) * randomOffset
      particles[i4 + 3] = 1.0 // Alpha
    }

    // Create original position texture
    const originalPositionTexture = new THREE.DataTexture(
      particles,
      size,
      size,
      THREE.RGBAFormat,
      THREE.FloatType
    )
    originalPositionTexture.needsUpdate = true

    // Initialize both FBOs with the initial positions
    const tempScene = new THREE.Scene()
    const tempCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const tempMaterial = new THREE.MeshBasicMaterial({ map: originalPositionTexture })
    const tempMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), tempMaterial)
    tempScene.add(tempMesh)

    // Initialize both FBOs
    gl.setRenderTarget(fboA)
    gl.render(tempScene, tempCamera)
    gl.setRenderTarget(fboB)
    gl.render(tempScene, tempCamera)
    gl.setRenderTarget(null)

    // Create particle positions for rendering (UV coordinates)
    const particlePositions = new Float32Array(size * size * 3)
    for (let i = 0; i < size * size; i++) {
      const i3 = i * 3
      particlePositions[i3 + 0] = (i % size) / size
      particlePositions[i3 + 1] = Math.floor(i / size) / size
      particlePositions[i3 + 2] = 0
    }

    return { originalPositionTexture, particlePositions }
  }, [size, gl, fboA, fboB])

  // Simulation Loop
  useFrame((state) => {
    const { gl, clock } = state
    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

    // Update simulation uniforms
    simulationMaterial.uniforms.uCurrentPosition.value = currentFBO.current.texture
    simulationMaterial.uniforms.uOriginalPosition.value = originalPositionTexture
    simulationMaterial.uniforms.uTime.value = clock.elapsedTime

    const simulationMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), simulationMaterial)
    scene.add(simulationMesh)

    // Render simulation to next FBO
    gl.setRenderTarget(nextFBO.current)
    gl.render(scene, camera)
    gl.setRenderTarget(null)

    // Swap FBOs properly
    const temp = currentFBO.current
    currentFBO.current = nextFBO.current
    nextFBO.current = temp

    // Update render material
    renderMaterial.uniforms.uPosition.value = currentFBO.current.texture
    renderMaterial.uniforms.uTime.value = clock.elapsedTime

    // Smooth rotation
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.002
      pointsRef.current.rotation.x += 0.001
      pointsRef.current.rotation.z += 0.0005
    }
  })

  return (
    <>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particlePositions, 3]}
          />
        </bufferGeometry>
        <primitive object={renderMaterial} attach="material" />
      </points>
      <EffectComposer>
        <Bloom intensity={0.4} luminanceThreshold={0.2} luminanceSmoothing={0.8} height={512} />
        <N8AO quality="medium" aoRadius={0.3} intensity={1.2} color="black" />
      </EffectComposer>
    </>
  )
}