import { useState } from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';

// Simplified SVG paths for Indian states - arranged to form India's shape
const INDIA_STATES_SVG = {
  // Northern States (Top portion)
  'Jammu and Kashmir': { 
    path: 'M 120 40 L 180 35 L 200 55 L 195 90 L 160 85 L 140 65 L 125 50 Z',
    centroid: { x: 160, y: 65 }
  },
  'Himachal Pradesh': { 
    path: 'M 200 50 L 240 52 L 255 75 L 245 95 L 220 90 L 210 75 Z',
    centroid: { x: 228, y: 73 }
  },
  'Punjab': { 
    path: 'M 240 52 L 290 54 L 305 72 L 295 88 L 270 85 L 255 75 Z',
    centroid: { x: 276, y: 71 }
  },
  'Haryana': { 
    path: 'M 290 54 L 340 56 L 350 72 L 340 88 L 320 85 L 305 72 Z',
    centroid: { x: 324, y: 71 }
  },
  'Delhi': { 
    path: 'M 340 68 L 348 68 L 352 76 L 348 82 L 340 82 Z',
    centroid: { x: 346, y: 75 }
  },
  'Uttar Pradesh': { 
    path: 'M 340 56 L 440 62 L 455 90 L 450 150 L 430 145 L 415 115 L 390 100 L 370 85 Z',
    centroid: { x: 401, y: 100 }
  },
  'Uttarakhand': { 
    path: 'M 290 65 L 340 68 L 350 88 L 340 108 L 315 103 L 305 85 Z',
    centroid: { x: 323, y: 86 }
  },
  'Rajasthan': { 
    path: 'M 160 95 L 330 100 L 345 195 L 300 205 L 230 200 L 200 175 L 170 140 Z',
    centroid: { x: 248, y: 158 }
  },
  
  // Eastern States
  'Bihar': { 
    path: 'M 440 105 L 490 108 L 500 130 L 490 152 L 465 148 L 455 128 Z',
    centroid: { x: 473, y: 129 }
  },
  'Jharkhand': { 
    path: 'M 440 155 L 490 158 L 500 180 L 490 202 L 465 198 L 455 178 Z',
    centroid: { x: 473, y: 179 }
  },
  'West Bengal': { 
    path: 'M 490 108 L 560 112 L 570 140 L 560 162 L 530 158 L 520 138 Z',
    centroid: { x: 538, y: 137 }
  },
  'Odisha': { 
    path: 'M 490 202 L 540 206 L 550 230 L 540 252 L 515 248 L 505 228 Z',
    centroid: { x: 523, y: 229 }
  },
  'Assam': { 
    path: 'M 560 140 L 600 143 L 610 168 L 600 188 L 580 183 L 570 163 Z',
    centroid: { x: 587, y: 164 }
  },
  'Arunachal Pradesh': { 
    path: 'M 560 112 L 600 115 L 610 140 L 600 152 L 580 147 L 570 127 Z',
    centroid: { x: 587, y: 132 }
  },
  'Manipur': { 
    path: 'M 580 188 L 600 190 L 605 202 L 600 212 L 585 208 L 580 198 Z',
    centroid: { x: 592, y: 200 }
  },
  'Meghalaya': { 
    path: 'M 540 188 L 560 190 L 565 202 L 560 212 L 545 208 L 540 198 Z',
    centroid: { x: 552, y: 200 }
  },
  'Mizoram': { 
    path: 'M 560 212 L 580 214 L 585 226 L 580 236 L 565 232 L 560 222 Z',
    centroid: { x: 572, y: 224 }
  },
  'Nagaland': { 
    path: 'M 580 178 L 600 180 L 605 192 L 600 202 L 585 198 L 580 188 Z',
    centroid: { x: 592, y: 190 }
  },
  'Tripura': { 
    path: 'M 540 218 L 560 220 L 565 232 L 560 242 L 545 238 L 540 228 Z',
    centroid: { x: 552, y: 230 }
  },
  'Sikkim': { 
    path: 'M 520 127 L 540 129 L 545 142 L 540 152 L 525 147 L 520 137 Z',
    centroid: { x: 532, y: 139 }
  },
  
  // Central States
  'Madhya Pradesh': { 
    path: 'M 330 195 L 430 200 L 440 260 L 420 270 L 360 265 L 340 235 L 320 215 Z',
    centroid: { x: 377, y: 234 }
  },
  'Chhattisgarh': { 
    path: 'M 440 252 L 490 256 L 500 280 L 490 300 L 465 296 L 455 276 Z',
    centroid: { x: 473, y: 277 }
  },
  
  // Western States
  'Gujarat': { 
    path: 'M 140 195 L 240 200 L 250 270 L 220 280 L 180 275 L 160 250 L 150 220 Z',
    centroid: { x: 192, y: 241 }
  },
  'Maharashtra': { 
    path: 'M 240 270 L 340 275 L 350 340 L 330 350 L 280 345 L 260 320 L 240 300 Z',
    centroid: { x: 292, y: 315 }
  },
  'Goa': { 
    path: 'M 240 340 L 250 340 L 255 350 L 250 358 L 240 358 Z',
    centroid: { x: 247, y: 349 }
  },
  
  // Southern States
  'Karnataka': { 
    path: 'M 340 340 L 420 345 L 430 400 L 410 410 L 370 405 L 350 380 L 340 360 Z',
    centroid: { x: 380, y: 377 }
  },
  'Kerala': { 
    path: 'M 390 400 L 420 402 L 425 420 L 420 435 L 400 430 L 395 415 Z',
    centroid: { x: 408, y: 417 }
  },
  'Tamil Nadu': { 
    path: 'M 490 400 L 550 405 L 560 450 L 540 460 L 500 455 L 490 430 Z',
    centroid: { x: 518, y: 433 }
  },
  'Andhra Pradesh': { 
    path: 'M 490 300 L 520 303 L 530 350 L 520 400 L 500 405 L 490 380 L 480 340 Z',
    centroid: { x: 504, y: 354 }
  },
  'Telangana': { 
    path: 'M 420 300 L 460 303 L 470 325 L 460 345 L 440 340 L 430 320 Z',
    centroid: { x: 450, y: 322 }
  },
  
  // Union Territories
  'Puducherry': { 
    path: 'M 510 430 L 515 430 L 517 435 L 515 438 L 510 438 Z',
    centroid: { x: 513, y: 434 }
  },
  'Andaman and Nicobar Islands': { 
    path: 'M 620 310 L 630 310 L 635 320 L 630 330 L 620 330 Z',
    centroid: { x: 627, y: 322 }
  },
  'Chandigarh': { 
    path: 'M 290 80 L 295 80 L 297 85 L 295 88 L 290 88 Z',
    centroid: { x: 293, y: 83 }
  },
};

const IndiaMap = ({ violationData = [], onStateClick }) => {
  const [hoveredState, setHoveredState] = useState(null);

  // Create a map of state to violation data
  const violationMap = {};
  violationData.forEach(item => {
    violationMap[item.state] = item;
  });

  const getStateFillColor = (stateName) => {
    const data = violationMap[stateName];
    if (!data || !data.totalTests || data.totalTests === 0) {
      return '#d1d5db'; // Gray - No data
    }
    
    const rate = parseFloat(data.violationRate);
    if (rate > 10) {
      return '#f97316'; // Orange-500 - High violation
    } else if (rate > 5) {
      return '#fb923c'; // Orange-300 - Medium violation
    } else if (rate > 0) {
      return '#86efac'; // Green-300 - Low violation
    } else {
      return '#22c55e'; // Green-500 - No violations
    }
  };

  const getStateStrokeColor = (stateName) => {
    if (hoveredState === stateName) {
      return '#3b82f6'; // Blue-500
    }
    return '#6b7280'; // Gray-500
  };

  const getStateStrokeWidth = (stateName) => {
    if (hoveredState === stateName) {
      return '2.5';
    }
    return '1';
  };

  const getTooltipContent = (stateName) => {
    const data = violationMap[stateName];
    if (!data) {
      return { title: stateName, subtitle: 'No test data available' };
    }
    
    return {
      title: stateName,
      subtitle: `${data.failedTests} violations out of ${data.totalTests} tests`,
      violationRate: `${data.violationRate}% violation rate`,
      riskLevel: data.riskLevel === 'high' ? 'High Risk' : data.riskLevel === 'medium' ? 'Medium Risk' : 'Low Risk',
    };
  };

  const tooltipData = hoveredState ? getTooltipContent(hoveredState) : null;
  const stateEntries = Object.entries(INDIA_STATES_SVG);

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* SVG Map Container */}
      <div className="relative w-full flex justify-center items-center bg-white dark:bg-gray-800 rounded-lg p-4">
        <svg
          viewBox="100 0 550 470"
          className="w-full h-auto max-w-[900px]"
          style={{ maxHeight: '500px', minHeight: '450px' }}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Background - Light gray for India outline */}
          <rect x="100" y="0" width="550" height="470" fill="#f9fafb" className="dark:fill-gray-800" rx="8" />
          
          {/* Render all states */}
          {stateEntries.map(([stateName, stateData]) => {
            const fillColor = getStateFillColor(stateName);
            const strokeColor = getStateStrokeColor(stateName);
            const strokeWidth = getStateStrokeWidth(stateName);
            const data = violationMap[stateName];
            const hasData = data && data.totalTests > 0;
            const rate = data ? parseFloat(data.violationRate || 0) : 0;

            return (
              <g key={stateName}>
                <path
                  d={stateData.path}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  className="transition-all duration-200 cursor-pointer"
                  onMouseEnter={() => setHoveredState(stateName)}
                  onMouseLeave={() => setHoveredState(null)}
                  onClick={() => onStateClick && onStateClick(stateName, data)}
                  style={{
                    filter: hoveredState === stateName ? 'brightness(1.15) drop-shadow(0 4px 8px rgba(0,0,0,0.25))' : 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))',
                    transform: hoveredState === stateName ? 'scale(1.02)' : 'scale(1)',
                    transformOrigin: `${stateData.centroid.x}px ${stateData.centroid.y}px`,
                  }}
                />
                {/* State label */}
                <text
                  x={stateData.centroid.x}
                  y={stateData.centroid.y}
                  textAnchor="middle"
                  className="pointer-events-none"
                  fill={hasData && rate > 0 ? '#1f2937' : '#4b5563'}
                  style={{
                    fontSize: stateName.length > 18 ? '9px' : stateName.length > 12 ? '10px' : '11px',
                    fontWeight: '600',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                  }}
                >
                  {stateName.length > 20 
                    ? stateName.split(' ')[0] 
                    : stateName.split(' ').slice(0, 2).join(' ')
                  }
                </text>
                {/* Violation count - only show if there are violations */}
                {hasData && rate > 0 && (
                  <text
                    x={stateData.centroid.x}
                    y={stateData.centroid.y + 14}
                    textAnchor="middle"
                    className="pointer-events-none"
                    fill="#dc2626"
                    style={{
                      fontSize: '10px',
                      fontWeight: '700',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                    }}
                  >
                    {data.failedTests} violations
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-orange-500 rounded border border-gray-400 shadow-sm"></div>
          <span className="text-gray-700 dark:text-gray-300 font-medium">High Risk (&gt;10%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-orange-300 rounded border border-gray-400 shadow-sm"></div>
          <span className="text-gray-700 dark:text-gray-300 font-medium">Medium Risk (5-10%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-green-300 rounded border border-gray-400 shadow-sm"></div>
          <span className="text-gray-700 dark:text-gray-300 font-medium">Low Risk (0-5%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-green-500 rounded border border-gray-400 shadow-sm"></div>
          <span className="text-gray-700 dark:text-gray-300 font-medium">No Violations</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded border border-gray-400 shadow-sm"></div>
          <span className="text-gray-700 dark:text-gray-300 font-medium">No Data</span>
        </div>
      </div>

      {/* Tooltip - Fixed Position */}
      {tooltipData && hoveredState && (
        <div className="fixed bg-gray-900 text-white px-4 py-3 rounded-lg shadow-xl z-50 text-sm min-w-[220px] border border-gray-700" style={{ top: '20%', right: '20px' }}>
          <div className="font-bold mb-2 text-base">{tooltipData.title}</div>
          <div className="text-gray-300 text-xs mb-2 border-b border-gray-700 pb-2">{tooltipData.subtitle}</div>
          {tooltipData.violationRate && (
            <div className="flex items-center gap-2">
              {tooltipData.riskLevel === 'High Risk' ? (
                <AlertTriangle className="w-5 h-5 text-red-400" />
              ) : tooltipData.riskLevel === 'Medium Risk' ? (
                <AlertTriangle className="w-5 h-5 text-orange-400" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-400" />
              )}
              <div>
                <div className="text-xs font-semibold">{tooltipData.violationRate}</div>
                <div className="text-xs text-gray-400">{tooltipData.riskLevel}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default IndiaMap;
