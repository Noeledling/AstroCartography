import React, { useState } from 'react'
import './Welcome.css'
import BirthDataForm from './BirthDataForm'

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

const Welcome: React.FC<Props> = ({ onSubmit }) => {
  const [showForm, setShowForm] = useState(false)

  if (showForm) {
    return <BirthDataForm onSubmit={onSubmit} />
  }

  return (
    <div className="welcome-container">
      <h1 className="welcome-title">Hi,</h1>
      <p className="welcome-text">let's explore the world together</p>
      <button 
        className="enter-button"
        onClick={() => setShowForm(true)}
        aria-label="Enter"
      >
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M12 4L10.59 5.41L16.17 11H4V13H16.17L10.59 18.59L12 20L20 12L12 4Z" 
            fill="currentColor"
          />
        </svg>
      </button>
    </div>
  )
}

export default Welcome 