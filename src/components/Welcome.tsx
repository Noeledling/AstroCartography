import React, { useState } from 'react';
import './Welcome.css';

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
  const [showForm, setShowForm] = useState(false);
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('12:00');
  const [location, setLocation] = useState('');
  const [coordinates, setCoordinates] = useState({ lat: 40.7128, lng: -74.0060 });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const [hours, minutes] = birthTime.split(':').map(Number);
    const date = new Date(birthDate);
    date.setHours(hours, minutes);

    onSubmit({
      date,
      location: {
        lat: coordinates.lat,
        lng: coordinates.lng,
        name: location || 'New York, USA'
      }
    });
  };

  // For demo purposes, update coordinates based on location input
  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLocation = e.target.value;
    setLocation(newLocation);
    
    // Demo: Set some example coordinates based on common cities
    const cityCoordinates: { [key: string]: { lat: number; lng: number } } = {
      'New York': { lat: 40.7128, lng: -74.0060 },
      'London': { lat: 51.5074, lng: -0.1278 },
      'Tokyo': { lat: 35.6762, lng: 139.6503 },
      'Paris': { lat: 48.8566, lng: 2.3522 },
      'Sydney': { lat: -33.8688, lng: 151.2093 }
    };

    // Check if the input starts with any of the city names
    const matchedCity = Object.keys(cityCoordinates).find(city => 
      newLocation.toLowerCase().startsWith(city.toLowerCase())
    );

    if (matchedCity) {
      setCoordinates(cityCoordinates[matchedCity]);
    }
  };

  if (!showForm) {
    return (
      <div className="welcome-container welcome-initial">
        <h1>Hi, let's explore your world</h1>
        <button onClick={() => setShowForm(true)}>Enter</button>
      </div>
    );
  }

  return (
    <div className="welcome-container">
      <h1>Tell us about yourself</h1>
      <form onSubmit={handleSubmit} className="birth-form">
        <div className="form-group">
          <label htmlFor="birthDate">Birth Date:</label>
          <input
            type="date"
            id="birthDate"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="birthTime">Birth Time:</label>
          <input
            type="time"
            id="birthTime"
            value={birthTime}
            onChange={(e) => setBirthTime(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="location">Birth Location:</label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={handleLocationChange}
            placeholder="Enter a city (e.g., New York, London, Tokyo)"
            required
          />
          <div className="coordinates">
            Coordinates: {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
          </div>
        </div>

        <button type="submit">Explore</button>
      </form>
    </div>
  );
};

export default Welcome; 