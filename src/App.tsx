import { useEffect, useRef, useState } from 'react'
import Globe from 'globe.gl'
import * as THREE from 'three'
import TimeControls from './components/TimeControls'
import Welcome from './components/Welcome'
import StarryBackground from './components/StarryBackground'
import './App.css'

// Update the type for the globe instance to include renderer
declare module 'globe.gl' {
  export interface Globe {
    renderer(): THREE.WebGLRenderer;
    camera(): THREE.Camera;
    scene(): THREE.Scene;
  }
}

interface BirthData {
  date: Date;
  location: {
    lat: number;
    lng: number;
    name: string;
  };
}

interface LocationPoint {
  lat: number;
  lng: number;
  name: string;
  astroReading: {
    type: 'beneficial' | 'challenging' | 'neutral';
    summary: string;
    details: {
      planets: string[];
      aspects: string[];
      interpretation: string;
    };
  };
}

interface AstroLine {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  type: 'major' | 'minor';
  color: string;
  label?: string;
  effect?: string;
  intensity?: number;
  gradientStart?: string;
  gradientEnd?: string;
}

function App() {
  // Remove default birth data
  const [birthData, setBirthData] = useState<BirthData | null>(null)
  const globeEl = useRef<HTMLDivElement>(null)
  const globeInstance = useRef<any>(null)
  const [currentTime, setCurrentTime] = useState(12) // Start at noon
  const [selectedPoint, setSelectedPoint] = useState<LocationPoint | null>(null)
  const [selectedLine, setSelectedLine] = useState<AstroLine | null>(null)

  // Test data points
  const testPoints: LocationPoint[] = [
    {
      lat: 48.8566,
      lng: 2.3522,
      name: "Paris, France",
      astroReading: {
        type: 'beneficial',
        summary: "Strong Venus-Jupiter conjunction",
        details: {
          planets: ["Venus", "Jupiter"],
          aspects: ["Conjunction in 10th house"],
          interpretation: "This location amplifies your career potential and brings opportunities for growth and recognition. The Venus-Jupiter conjunction suggests favorable conditions for both professional success and personal relationships."
        }
      }
    },
    {
      lat: 34.0522,
      lng: -118.2437,
      name: "Los Angeles, USA",
      astroReading: {
        type: 'beneficial',
        summary: "Sun-Mercury alignment with MC",
        details: {
          planets: ["Sun", "Mercury"],
          aspects: ["Conjunction with Midheaven"],
          interpretation: "Your creative and communicative abilities are heightened here. This location supports self-expression, artistic endeavors, and intellectual pursuits. Excellent for media, entertainment, or educational careers."
        }
      }
    },
    {
      lat: -33.8688,
      lng: 151.2093,
      name: "Sydney, Australia",
      astroReading: {
        type: 'challenging',
        summary: "Mars-Saturn square",
        details: {
          planets: ["Mars", "Saturn"],
          aspects: ["Square to Ascendant"],
          interpretation: "This location may present obstacles and require extra effort to achieve your goals. While challenging, it offers opportunities for building resilience and discipline. Consider carefully before making long-term commitments here."
        }
      }
    },
    {
      lat: 35.6762,
      lng: 139.6503,
      name: "Tokyo, Japan",
      astroReading: {
        type: 'neutral',
        summary: "Moon-Neptune trine",
        details: {
          planets: ["Moon", "Neptune"],
          aspects: ["Trine to IC"],
          interpretation: "A location that enhances your intuitive and creative abilities. While not strongly beneficial or challenging, it offers a unique environment for spiritual growth and artistic inspiration."
        }
      }
    },
    {
      lat: -22.9068,
      lng: -43.1729,
      name: "Rio de Janeiro, Brazil",
      astroReading: {
        type: 'beneficial',
        summary: "Venus-Moon harmonious aspect",
        details: {
          planets: ["Venus", "Moon"],
          aspects: ["Trine to Ascendant", "Sextile to MC"],
          interpretation: "This location brings out your natural charm and emotional well-being. Excellent for social connections, relationships, and finding a sense of belonging. The energy here supports both personal and professional growth."
        }
      }
    }
  ]

  // Update test lines with gradient colors
  const testLines: AstroLine[] = [
    {
      startLat: 48.8566,
      startLng: 2.3522,
      endLat: -22.9068,
      endLng: -43.1729,
      type: 'major',
      color: '#34D399',
      gradientStart: '#34D399',
      gradientEnd: '#059669',
      label: 'Venus-Jupiter Harmony Line',
      effect: "This line represents a powerful Venus-Jupiter connection, bringing opportunities for growth, abundance, and social harmony. The influence is strongest near the line and gradually diminishes within about 500 miles on either side.",
      intensity: 0.9
    },
    {
      startLat: 34.0522,
      startLng: -118.2437,
      endLat: 35.6762,
      endLng: 139.6503,
      type: 'minor',
      color: '#9CA3AF',
      gradientStart: '#9CA3AF',
      gradientEnd: '#6B7280',
      label: 'Sun-Mercury Communication Line',
      effect: "A Sun-Mercury alignment that enhances communication, learning, and intellectual pursuits. The effect is moderate and extends approximately 300 miles from the line.",
      intensity: 0.6
    },
    {
      startLat: -33.8688,
      startLng: 151.2093,
      endLat: 35.6762,
      endLng: 139.6503,
      type: 'major',
      color: '#EF4444',
      gradientStart: '#EF4444',
      gradientEnd: '#B91C1C',
      label: 'Mars-Saturn Tension Line',
      effect: "A challenging Mars-Saturn square that can bring obstacles and require extra effort. While the influence is strong near the line, it can be channeled constructively with awareness and preparation.",
      intensity: 0.8
    }
  ];

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
      .pointsData(testPoints)
      .pointColor(point => {
        const p = point as LocationPoint;
        switch (p.astroReading.type) {
          case 'beneficial':
            return '#34D399';
          case 'challenging':
            return '#EF4444';
          case 'neutral':
            return '#9CA3AF';
          default:
            return '#ffffff';
        }
      })
      .pointAltitude(point => {
        const p = point as LocationPoint;
        return p.astroReading.type === 'beneficial' ? 0.02 : 0.01;
      })
      .pointRadius(point => {
        const p = point as LocationPoint;
        return p.astroReading.type === 'beneficial' ? 1 : 0.5;
      })
      .onPointClick((point: any) => {
        setSelectedPoint(point as LocationPoint)
      })
      // Add lines configuration
      .arcsData(testLines)
      .arcColor((line: any) => {
        const l = line as AstroLine;
        return `rgba(${hexToRgb(l.color)},${l.intensity || 0.7})`;
      })
      .arcStroke((line: any) => (line as AstroLine).type === 'major' ? 0.8 : 0.4)
      .arcDashLength((line: any) => (line as AstroLine).type === 'major' ? 0.9 : 0.6)
      .arcDashGap(0.1)
      .arcDashAnimateTime(4000)
      .arcAltitude((line: any) => {
        const l = line as AstroLine;
        return l.type === 'major' ? 0.2 : 0.15;
      })
      .arcLabel('label')
      .labelSize(1)
      .labelColor(() => 'white')
      .labelAltitude(0.2)
      .onArcClick((line: any) => {
        setSelectedLine(line as AstroLine);
      })
      .onArcHover((line: any) => {
        if (globeEl.current) {
          globeEl.current.style.cursor = line ? 'pointer' : 'default';
        }
      });

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

  // Helper function to convert hex to rgb
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '255, 255, 255';
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    return `${r}, ${g}, ${b}`;
  };

  return (
    <div className="app-container">
      {!birthData ? (
        <>
          <StarryBackground />
          <Welcome onSubmit={handleBirthDataSubmit} />
        </>
      ) : (
        <>
          <div className="locations-sidebar">
            <div className="locations-header">
              <h2>Astrological Locations</h2>
            </div>
            <div className="locations-content">
              <div className="location-group">
                <h3>Beneficial Places</h3>
                {testPoints
                  .filter(point => point.astroReading.type === 'beneficial')
                  .map((point, index) => (
                    <div 
                      key={index} 
                      className="location-card"
                      onClick={() => {
                        setSelectedPoint(point);
                        // Move globe view to this location
                        if (globeInstance.current) {
                          globeInstance.current.pointOfView({
                            lat: point.lat,
                            lng: point.lng,
                            altitude: 2.5
                          }, 1000); // 1000ms animation
                        }
                      }}
                    >
                      <h4>{point.name}</h4>
                      <p className="summary">{point.astroReading.summary}</p>
                      <div className="planets">
                        {point.astroReading.details.planets.map((planet, i) => (
                          <span key={i} className="planet-tag">{planet}</span>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
              
              <div className="location-group">
                <h3>Challenging Places</h3>
                {testPoints
                  .filter(point => point.astroReading.type === 'challenging')
                  .map((point, index) => (
                    <div 
                      key={index} 
                      className="location-card"
                      onClick={() => {
                        setSelectedPoint(point);
                        if (globeInstance.current) {
                          globeInstance.current.pointOfView({
                            lat: point.lat,
                            lng: point.lng,
                            altitude: 2.5
                          }, 1000);
                        }
                      }}
                    >
                      <h4>{point.name}</h4>
                      <p className="summary">{point.astroReading.summary}</p>
                      <div className="planets">
                        {point.astroReading.details.planets.map((planet, i) => (
                          <span key={i} className="planet-tag">{planet}</span>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>

              <div className="location-group">
                <h3>Neutral Places</h3>
                {testPoints
                  .filter(point => point.astroReading.type === 'neutral')
                  .map((point, index) => (
                    <div 
                      key={index} 
                      className="location-card"
                      onClick={() => {
                        setSelectedPoint(point);
                        if (globeInstance.current) {
                          globeInstance.current.pointOfView({
                            lat: point.lat,
                            lng: point.lng,
                            altitude: 2.5
                          }, 1000);
                        }
                      }}
                    >
                      <h4>{point.name}</h4>
                      <p className="summary">{point.astroReading.summary}</p>
                      <div className="planets">
                        {point.astroReading.details.planets.map((planet, i) => (
                          <span key={i} className="planet-tag">{planet}</span>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
          <div ref={globeEl} className="globe-container" />
          <TimeControls currentTime={currentTime} onTimeChange={handleTimeChange} />
          {selectedLine && (
            <div className="astro-popup">
              <h3>{selectedLine.label}</h3>
              <div className={`astro-type ${selectedLine.type === 'major' ? 'beneficial' : 'neutral'}`}>
                {selectedLine.type.toUpperCase()}
              </div>
              <p className="interpretation">
                {selectedLine.effect}
              </p>
              <button onClick={() => setSelectedLine(null)}>Close</button>
            </div>
          )}
          {selectedPoint && (
            <div className="astro-popup">
              <h3>{selectedPoint.name}</h3>
              <div className={`astro-type ${selectedPoint.astroReading.type}`}>
                {selectedPoint.astroReading.type.toUpperCase()}
              </div>
              <p className="summary">{selectedPoint.astroReading.summary}</p>
              <div className="details">
                <h4>Planetary Influences</h4>
                <ul>
                  {selectedPoint.astroReading.details.planets.map((planet, i) => (
                    <li key={i}>{planet}</li>
                  ))}
                </ul>
                <h4>Aspects</h4>
                <ul>
                  {selectedPoint.astroReading.details.aspects.map((aspect, i) => (
                    <li key={i}>{aspect}</li>
                  ))}
                </ul>
                <p className="interpretation">
                  {selectedPoint.astroReading.details.interpretation}
                </p>
              </div>
              <button onClick={() => setSelectedPoint(null)}>Close</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default App
