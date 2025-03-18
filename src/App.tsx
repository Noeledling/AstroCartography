import { useEffect, useRef, useState } from 'react'
import Globe from 'globe.gl'
import * as THREE from 'three'
import TimeControls from './components/TimeControls'
import Welcome from './components/Welcome'
import StarryBackground from './components/StarryBackground'
import './App.css'

interface BirthData {
  date: Date;
  location: {
    lat: number;
    lng: number;
    name: string;
  };
}

function App() {
  // Temporary default birth data for development
  const defaultBirthData: BirthData = {
    date: new Date('1990-01-01T00:00:00'),
    location: {
      lat: 40.7128,  // New York coordinates as example
      lng: -74.0060,
      name: "New York"
    }
  }

  const [birthData, setBirthData] = useState<BirthData | null>(defaultBirthData)
  const globeEl = useRef<HTMLDivElement>(null)
  const globeInstance = useRef<any>(null)
  const [currentTime, setCurrentTime] = useState(12) // Start at noon

  const handleBirthDataSubmit = (data: BirthData) => {
    setBirthData(data)
  }

  // Only initialize globe after birth data is submitted
  useEffect(() => {
    if (!birthData || !globeEl.current) return

    // Create custom material for day/night cycle
    const dayTexture = new THREE.TextureLoader().load('//unpkg.com/three-globe/example/img/earth-day.jpg')
    const nightTexture = new THREE.TextureLoader().load('//unpkg.com/three-globe/example/img/earth-night.jpg')

    const customMaterial = new THREE.ShaderMaterial({
      uniforms: {
        dayTexture: { value: dayTexture },
        nightTexture: { value: nightTexture },
        sunDirection: { value: new THREE.Vector3(1, 0, 0) }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        void main() {
          vUv = uv;
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D dayTexture;
        uniform sampler2D nightTexture;
        uniform vec3 sunDirection;
        varying vec2 vUv;
        varying vec3 vPosition;
        void main() {
          vec3 normalizedPosition = normalize(vPosition);
          float cosAngle = dot(normalizedPosition, normalize(sunDirection));
          float mixValue = smoothstep(-0.2, 0.2, cosAngle);
          vec4 dayColor = texture2D(dayTexture, vUv);
          vec4 nightColor = texture2D(nightTexture, vUv);
          gl_FragColor = mix(nightColor, dayColor, mixValue);
        }
      `
    })

    const globe = new Globe(globeEl.current)
      .globeMaterial(customMaterial)
      .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
      .width(window.innerWidth)
      .height(window.innerHeight)
      .atmosphereColor('#3a228a')
      .atmosphereAltitude(0.25)

    // Store globe instance for later use
    globeInstance.current = globe

    // Set initial camera position to birth location
    globe.pointOfView({
      lat: birthData.location.lat,
      lng: birthData.location.lng,
      altitude: 2.5
    })

    // Configure controls
    globe.controls().autoRotate = false
    globe.controls().enableZoom = true
    globe.controls().minDistance = 200
    globe.controls().maxDistance = 400
    globe.controls().enablePan = false

    // Add ambient light for base illumination
    const ambientLight = new THREE.AmbientLight(0x222222)
    globe.scene().add(ambientLight)

    // Add directional light for sun
    const sunLight = new THREE.DirectionalLight(0xffffff, 0.65)
    globe.scene().add(sunLight)

    // Update sun position based on time
    const updateSunPosition = (time: number) => {
      const angle = ((time - 12) * 15) * (Math.PI / 180)
      const radius = 10
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      sunLight.position.set(x, 0, z)
      sunLight.lookAt(0, 0, 0)
      
      // Update shader uniform
      customMaterial.uniforms.sunDirection.value.set(x, 0, z)
    }

    // Initial sun position
    updateSunPosition(currentTime)

    // Handle window resize
    const handleResize = () => {
      globe.width(window.innerWidth)
      globe.height(window.innerHeight)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      globe._destructor()
    }
  }, [birthData]) // Only run when birth data changes

  const handleTimeChange = (time: number) => {
    setCurrentTime(time)
    // Update sun position without recreating the globe
    if (!globeInstance.current) return
    
    const angle = ((time - 12) * 15) * (Math.PI / 180)
    const radius = 10
    const x = Math.cos(angle) * radius
    const z = Math.sin(angle) * radius
    
    // Update directional light
    const sunLight = globeInstance.current.scene().children.find(
      (child: THREE.Object3D) => child instanceof THREE.DirectionalLight
    )
    if (sunLight) {
      sunLight.position.set(x, 0, z)
      sunLight.lookAt(0, 0, 0)
    }

    // Update shader uniform
    const material = globeInstance.current.globeMaterial()
    if (material.uniforms) {
      material.uniforms.sunDirection.value.set(x, 0, z)
    }
  }

  return (
    <div className="app-container">
      {!birthData ? (
        <>
          <StarryBackground />
          <Welcome onSubmit={handleBirthDataSubmit} />
        </>
      ) : (
        <>
          <div ref={globeEl} className="globe-container" />
          <TimeControls currentTime={currentTime} onTimeChange={handleTimeChange} />
        </>
      )}
    </div>
  )
}

export default App
