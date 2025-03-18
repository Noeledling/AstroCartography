import React, { useEffect, useRef } from 'react'
import './StarField.css'

interface Star {
  x: number
  y: number
  z: number
  size: number
  brightness: number
  twinkleSpeed: number
  phase: number
}

const StarField: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<Star[]>([])
  const mouseRef = useRef({ x: 0, y: 0 })
  const frameRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size with pixel ratio for sharp rendering
    const setCanvasSize = () => {
      const pixelRatio = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * pixelRatio
      canvas.height = window.innerHeight * pixelRatio
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.scale(pixelRatio, pixelRatio)
    }
    setCanvasSize()
    window.addEventListener('resize', setCanvasSize)

    // Initialize stars
    const initStars = () => {
      const stars: Star[] = []
      for (let i = 0; i < 800; i++) {
        stars.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          z: Math.random() * 1000,
          size: Math.random() * 2 + 0.5, // Minimum size of 0.5
          brightness: Math.random() * 0.5 + 0.5, // Between 0.5 and 1
          twinkleSpeed: Math.random() * 0.02 + 0.01,
          phase: Math.random() * Math.PI * 2
        })
      }
      starsRef.current = stars
    }
    initStars()

    // Handle mouse movement
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: (e.clientX - window.innerWidth / 2) * 0.008,
        y: (e.clientY - window.innerHeight / 2) * 0.008
      }
    }
    window.addEventListener('mousemove', handleMouseMove)

    // Animation loop
    const draw = (timestamp: number) => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)

      starsRef.current.forEach(star => {
        // Calculate parallax position
        const x = star.x - mouseRef.current.x * (star.z / 100)
        const y = star.y - mouseRef.current.y * (star.z / 100)

        // Calculate twinkling
        const twinkle = Math.sin(timestamp * star.twinkleSpeed + star.phase)
        const alpha = star.brightness * (0.5 + 0.5 * twinkle)

        // Draw star with gradient for glow effect
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, star.size * 2)
        gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`)
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(x, y, star.size * 2, 0, Math.PI * 2)
        ctx.fill()
      })

      frameRef.current = requestAnimationFrame(draw)
    }
    frameRef.current = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('resize', setCanvasSize)
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(frameRef.current)
    }
  }, [])

  return <canvas ref={canvasRef} className="star-field" />
}

export default StarField 