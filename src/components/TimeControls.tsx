import React from 'react'
import './TimeControls.css'

interface TimeControlsProps {
  onTimeChange: (time: number) => void
  currentTime: number
}

const TimeControls: React.FC<TimeControlsProps> = ({ onTimeChange, currentTime }) => {
  const formatTime = (time: number) => {
    const hours = Math.floor(time);
    const minutes = Math.round((time % 1) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  return (
    <div className="time-controls">
      <input
        type="range"
        min="0"
        max="24"
        step="0.5"
        value={currentTime}
        onChange={(e) => onTimeChange(parseFloat(e.target.value))}
      />
      <span className="time-display">{formatTime(currentTime)}</span>
    </div>
  )
}

export default TimeControls 