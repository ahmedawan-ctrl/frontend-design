###  **Install Dependencies**

Run one of these commands (pnpm is recommended):

```shellscript
pnpm install
# OR
npm install
# OR
yarn install
```

###  **Required Additional Dependencies**

The project uses several libraries that need to be installed:

```shellscript
# 3D Animation libraries (for the particle system)
pnpm add three @react-three/fiber @react-three/drei @react-three/postprocessing
pnpm add -D @types/three

# GSAP for logo animation
pnpm add gsap

# Framer Motion for animations
pnpm add framer-motion

# Voice/Audio libraries (for Siri component)
pnpm add react-siriwave

# Additional utilities
pnpm add clsx tailwind-merge
```

###  **Start Development Server**

```shellscript
pnpm dev
# OR
npm run dev
# OR
yarn dev
```

The application will be available at `http://localhost:3000`

## **Potential Issues & Solutions**

1. **3D Animation Performance**: If the particle animation is slow, your GPU might be the bottleneck. Try reducing the particle count in `components/scene.tsx`
2. **GSAP License**: The project uses GSAP. For commercial use, you may need a GSAP license
3. **Voice Features**: The Siri component requires microphone permissions in the browser
4. **Build Errors**: The project is configured to ignore TypeScript/ESLint errors during builds for easier development


The project should run smoothly with these dependencies installed. The main components include an animated ZION logo, 3D particle background, and voice interaction features.