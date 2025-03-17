import React, { useState, useEffect, useRef } from 'react';

const SpecialRelativitySimulation = () => {
  // State for simulation parameters
  const [velocity, setVelocity] = useState(0.5); // As a fraction of c
  const [sliderValue, setSliderValue] = useState(0.5); // Raw slider value
  const [viewMode, setViewMode] = useState('length'); // 'length' or 'time'
  const [isRunning, setIsRunning] = useState(false);
  const [useLogarithmic, setUseLogarithmic] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Animation frame reference
  const animationRef = useRef(null);
  const lastTimeRef = useRef(0);
  
  // Calculate relativistic effects based on velocity
  const gamma = 1 / Math.sqrt(1 - velocity * velocity);
  const lengthContraction = 1 / gamma;
  const timeDilation = gamma;
  
  // Convert between slider value and velocity with enhanced logarithmic scaling
  useEffect(() => {
    if (useLogarithmic) {
      // For logarithmic scale, use a more extreme mapping function
      // This gives extremely fine control as we approach c
      const minVelocity = 0.9; // Start at 0.9c for logarithmic scale
      const maxVelocity = 0.9999; // Go up to 0.9999c
      
      // Enhanced logarithmic mapping using negative exponent
      // This creates much finer granularity at higher values
      const exponent = 4;
      const mappedValue = 1 - Math.pow(1 - sliderValue, exponent);
      const newVelocity = minVelocity + (maxVelocity - minVelocity) * mappedValue;
      
      setVelocity(newVelocity);
    } else {
      // Linear scale: slider value directly maps to velocity (0.1c-0.9c)
      const minVelocity = 0.1;
      const maxVelocity = 0.9;
      const newVelocity = minVelocity + (maxVelocity - minVelocity) * sliderValue;
      setVelocity(newVelocity);
    }
  }, [sliderValue, useLogarithmic]);
  
  // Handle slider change
  const handleSliderChange = (e) => {
    // Always keep slider value between 0-1
    const newValue = parseFloat(e.target.value);
    setSliderValue(newValue);
  };
  
  // Toggle between linear and logarithmic scale
  const toggleScale = () => {
    // When toggling scale, maintain approximate position on slider
    // but reset to midpoint if velocity would be outside new range
    setUseLogarithmic(!useLogarithmic);
    setSliderValue(0.5); // Reset to middle of slider for better UX when switching scales
  };
  
  // Animation loop for time dilation visualization
  useEffect(() => {
    if (!isRunning) return;
    
    const animate = (timestamp) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;
      
      // Update time differently for stationary and moving observers
      setElapsedTime(prev => prev + deltaTime / 1000);
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning]);
  
  // Start/stop animation
  const toggleAnimation = () => {
    if (isRunning) {
      cancelAnimationFrame(animationRef.current);
      lastTimeRef.current = 0;
    } 
    setIsRunning(!isRunning);
  };
  
  // Reset simulation
  const resetSimulation = () => {
    setIsRunning(false);
    cancelAnimationFrame(animationRef.current);
    setElapsedTime(0);
    lastTimeRef.current = 0;
  };
  
  // Format velocity for display
  const velocityPercent = (velocity * 100).toFixed(useLogarithmic ? 4 : 1);
  
  // Calculate clock times
  const stationaryTime = elapsedTime.toFixed(2);
  const movingTime = (elapsedTime / timeDilation).toFixed(2);
  
  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-gray-100 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-center mb-6">Special Relativity Simulation</h1>
      
      {/* View mode toggle */}
      <div className="flex justify-center mb-6">
        <div className="bg-gray-200 rounded-lg p-1 flex">
          <button style={{ cursor: "pointer" }}
            className={`px-4 py-2 rounded-md ${viewMode === 'length' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setViewMode('length')}
          >
            Length Contraction
          </button>
          <button style={{ cursor: "pointer" }}
            className={`px-4 py-2 rounded-md ${viewMode === 'time' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setViewMode('time')}
          >
            Time Dilation
          </button>
        </div>
      </div>
      
      {/* Velocity controls */}
      <div className="mb-8 p-4 bg-white rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">Observer Velocity: {velocityPercent}% of c</h2>
          <div className="flex items-center">
            <span className={`mr-2 ${useLogarithmic ? 'text-gray-400' : 'font-semibold'}`}>Linear</span>
            <button style={{ cursor: "pointer" }}
              onClick={toggleScale}
              className="relative inline-flex items-center h-6 rounded-full w-11 bg-gray-300"
            >
              <span 
                className={`${
                  useLogarithmic ? 'translate-x-6 bg-blue-500' : 'translate-x-1 bg-white'
                } inline-block w-4 h-4 transform rounded-full transition-transform duration-200 ease-in-out`}
              />
            </button>
            <span className={`ml-2 ${useLogarithmic ? 'font-semibold' : 'text-gray-400'}`}>Logarithmic</span>
          </div>
        </div>
        
        {/* Use a consistent slider from 0-1 */}
        <input
          type="range"
          min="0"
          max="1"
          step="0.001" // Finer step for more precise control
          value={sliderValue}
          onChange={handleSliderChange}
          className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
        />
        
        <div className="flex justify-between text-sm mt-1">
          <span>{useLogarithmic ? "0.9c" : "0.1c"}</span>
          <span>{useLogarithmic ? "0.9999c" : "0.9c"}</span>
        </div>
        
        {/* Display exact velocity value */}
        <div className="text-center mt-2 text-sm">
          Current velocity: {velocity.toFixed(useLogarithmic ? 6 : 4)}c
          {velocity > 0.6 && velocity < 0.7 && !useLogarithmic && (
            <span className="ml-2 text-blue-600 font-semibold">
              (Effects becoming noticeable)
            </span>
          )}
          {velocity > 0.99 && (
            <span className="ml-2 text-red-600 font-semibold">
              (Extreme relativistic effects)
            </span>
          )}
        </div>
        
        {/* Gamma value indicator */}
        <div className="text-center mt-1 text-sm">
          Lorentz factor (γ): {gamma.toFixed(2)}
        </div>
      </div>
      
      {/* Simulation display */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6 h-75 flex flex-col justify-center">
        {viewMode === 'length' ? (
          <div className="w-full">
            <h3 className="text-center mb-4 font-semibold">Length Contraction Demo</h3>
            <div className="flex flex-col space-y-6">
              <div>
                <p className="mb-2">Stationary observer's ruler:</p>
                <div className="h-12 bg-blue-100 border border-blue-500 relative w-full">
                  <div className="absolute inset-y-0 left-0 border-r border-blue-500"></div>
                  <div className="absolute inset-y-0 right-0 border-l border-blue-500"></div>
                  <div className="flex justify-between px-2 h-full items-center">
                    <span>0</span>
                    <span>1</span>
                    <span>2</span>
                    <span>3</span>
                    <span>4</span>
                    <span>5</span>
                    <span>6</span>
                    <span>7</span>
                    <span>8</span>
                    <span>9</span>
                    <span>10</span>
                  </div>
                </div>
              </div>
              
              <div>
                <p className="mb-2">Moving observer's ruler (at {velocityPercent}% of c):</p>
                <div className="h-12 bg-red-100 border border-red-500 relative" style={{ width: `${lengthContraction * 100}%` }}>
                  <div className="absolute inset-y-0 left-0 border-r border-red-500"></div>
                  <div className="absolute inset-y-0 right-0 border-l border-red-500"></div>
                  <div className="flex justify-between px-2 h-full items-center overflow-hidden">
                    <span>0</span>
                    <span>1</span>
                    <span>2</span>
                    <span>3</span>
                    <span>4</span>
                    <span>5</span>
                    <span>6</span>
                    <span>7</span>
                    <span>8</span>
                    <span>9</span>
                    <span>10</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-center mt-4 text-sm">
              Length contraction factor: {lengthContraction.toFixed(6)} 
              (A 10m object appears as {(10 * lengthContraction).toFixed(3)}m)
            </p>
          </div>
        ) : (
          <div className="w-full">
            <h3 className="text-center mb-4 font-semibold">Time Dilation Demo</h3>
            <div className="flex justify-around mb-6">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto bg-blue-100 border-4 border-blue-500 rounded-full flex items-center justify-center text-2xl font-bold mb-2">
                  {stationaryTime}s
                </div>
                <p>Stationary Observer</p>
              </div>
              
              <div className="text-center">
                <div className="w-24 h-24 mx-auto bg-red-100 border-4 border-red-500 rounded-full flex items-center justify-center text-2xl font-bold mb-2">
                  {movingTime}s
                </div>
                <p>Moving Observer (at {velocityPercent}% of c)</p>
              </div>
            </div>
            <div className="flex justify-center space-x-4">
              <button style={{ cursor: "pointer" }}
                onClick={toggleAnimation}
                className={`px-4 py-2 rounded-md ${isRunning ? 'bg-red-500' : 'bg-green-500'} text-white`}
              >
                {isRunning ? 'Pause' : 'Start'}
              </button>
              <button style={{ cursor: "pointer" }}
                onClick={resetSimulation}
                className="px-4 py-2 rounded-md bg-gray-500 text-white"
              >
                Reset
              </button>
            </div>
            <p className="text-center mt-4 text-sm">
              Time dilation factor: {timeDilation.toFixed(3)}
              (1 second for the moving observer is {timeDilation.toFixed(3)} seconds for the stationary observer)
            </p>
          </div>
        )}
      </div>
      
      {/* Formula display */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <h3 className="text-center font-semibold mb-2">Special Relativity Formulas</h3>
        <div className="flex flex-col md:flex-row justify-around items-center">
          <div className="text-center mb-2 md:mb-0">
            <p className="mb-1">Lorentz Factor (γ):</p>
            <p className="font-mono text-lg">γ = 1/√(1-v²/c²) = {gamma.toFixed(3)}</p>
          </div>
          <div className="text-center mb-2 md:mb-0">
            <p className="mb-1">Length Contraction:</p>
            <p className="font-mono text-lg">L = L₀/γ = L₀ × {lengthContraction.toFixed(3)}</p>
          </div>
          <div className="text-center">
            <p className="mb-1">Time Dilation:</p>
            <p className="font-mono text-lg">Δt = γ × Δt₀ = Δt₀ × {timeDilation.toFixed(3)}</p>
          </div>
        </div>
      </div>
      
      {/* Instructions */}
      <div className="bg-white p-4 rounded-lg shadow-sm text-sm">
        <h3 className="font-semibold mb-2">How to use this simulation:</h3>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Use the slider to adjust the velocity of the moving observer (as a fraction of the speed of light)</li>
          <li>Toggle between "Linear" and "Logarithmic" scales to explore different velocity ranges</li>
          <li>Switch between "Length Contraction" and "Time Dilation" views using the buttons at the top</li>
          <li>In Time Dilation view, use the Start/Pause and Reset buttons to control the stopwatch simulation</li>
          <li>Notice how relativistic effects become more prominent at speeds above 0.6c</li>
        </ol>
      </div>
    </div>
  );
};

export default SpecialRelativitySimulation;