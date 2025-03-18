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

interface WelcomeProps {
  onSubmit: (data: BirthData) => void;
}

const Welcome: React.FC<WelcomeProps> = ({ onSubmit }) => {
  const [birthData, setBirthData] = useState<BirthData>({
    date: new Date(),
    location: {
      lat: 40.7128,
      lng: -74.0060,
      name: "New York, USA"
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(birthData);
  };

  return (
    <div className="welcome-container">
      <h1>Astro Cartography</h1>
      <p>Explore your astrological influences across the globe</p>
      <form onSubmit={handleSubmit}>
        <button type="submit">Enter</button>
      </form>
    </div>
  );
};

export default Welcome 