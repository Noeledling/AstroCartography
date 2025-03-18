import React, { useEffect, useState } from 'react'
import './StarryBackground.css'

const StarryBackground: React.FC = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20
      const y = (e.clientY / window.innerHeight - 0.5) * 20
      setPosition({ x, y })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="starry-background-container">
      <div 
        className="starry-background"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(1.1)`
        }}
      />
    </div>
  )
}

export default StarryBackground 