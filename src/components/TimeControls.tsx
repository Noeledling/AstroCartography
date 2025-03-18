import React from 'react'

interface TimeControlsProps {
  onTimeChange: (time: number) => void
  currentTime: number
}

const TimeControls: React.FC<TimeControlsProps> = ({ onTimeChange, currentTime }) => {
  return (
    <div className="time-controls">
      <input
        type="range"
        min="0"
        max="24"
        step="0.1"
        value={currentTime}
        onChange={(e) => onTimeChange(parseFloat(e.target.value))}
        className="time-slider"
      />
      <div className="time-display">
        {Math.floor(currentTime).toString().padStart(2, '0')}:
        {Math.round((currentTime % 1) * 60).toString().padStart(2, '0')}
      </div>
    </div>
  )
}

export default TimeControls 