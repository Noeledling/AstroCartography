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
        step="0.5"
        value={currentTime}
        onChange={(e) => onTimeChange(parseFloat(e.target.value))}
      />
      <span>{currentTime.toFixed(1)}:00</span>
    </div>
  )
}

export default TimeControls 