import React, { useState } from 'react'
import './BirthDataForm.css'

interface BirthData {
  date: Date;
  location: {
    lat: number;
    lng: number;
    name: string;
  };
}

interface Props {
  onSubmit: (data: BirthData) => void;
}

const BirthDataForm: React.FC<Props> = ({ onSubmit }) => {
  const [date, setDate] = useState('')
  const [location, setLocation] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Here we would normally use a geocoding service to get lat/lng
      // For now, using placeholder data
      const birthData: BirthData = {
        date: new Date(date),
        location: {
          lat: 0, // Replace with actual geocoding
          lng: 0, // Replace with actual geocoding
          name: location
        }
      }
      onSubmit(birthData)
    } catch (error) {
      console.error('Error processing birth data:', error)
    }
  }

  return (
    <div className="birth-data-form-container">
      <form className="birth-data-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="birthdate">When were you born?</label>
          <input
            type="datetime-local"
            id="birthdate"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="location">Where were you born?</label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City, Country"
            required
          />
        </div>

        <button type="submit" className="submit-button">
          Explore
        </button>
      </form>
    </div>
  )
}

export default BirthDataForm 