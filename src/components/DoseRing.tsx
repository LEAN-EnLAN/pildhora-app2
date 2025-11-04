import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

// Types
type PeriodLabel = 'Mañana' | 'Tarde' | 'Noche';
type DoseStatus = 'pending' | 'taken' | 'missed';

interface DoseRingProps {
  size?: number;
  strokeWidth?: number;
  // Estado por período: pendiente, tomada o omitida
  states?: Partial<Record<PeriodLabel, DoseStatus>>;
}

// Secciones: mañana (6-12), tarde (12-18), noche se divide en dos arcos (18-24 y 0-6)
const sections: { start: number; end: number; label: PeriodLabel }[] = [
  { start: 6, end: 12, label: 'Mañana' },
  { start: 12, end: 18, label: 'Tarde' },
  { start: 18, end: 24, label: 'Noche' },
  { start: 0, end: 6, label: 'Noche' },
];

const statusColors: Record<DoseStatus, string> = {
  pending: '#6C7086', // gray (Catppuccin Mocha text-muted)
  taken: '#34C759',   // green
  missed: '#FF3B30',  // red
};

const DEFAULT_SECTION_COLOR = '#6C7086';

const DoseRing: React.FC<DoseRingProps> = ({ size = 200, strokeWidth = 20, states }) => {
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;

  const getArcPath = (startAngle: number, endAngle: number): string => {
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);
    const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {/* Pista base */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#1E1E2E" // Base oscura Catppuccin
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Arcos por sección */}
        {sections.map((section, index) => {
          const totalHours = 24;
          const startAngle = (section.start / totalHours) * 360;
          const endAngle = (section.end / totalHours) * 360;
          const status = states?.[section.label];
          const color = status ? statusColors[status] : DEFAULT_SECTION_COLOR;
          return (
            <Path
              key={index}
              d={getArcPath(startAngle, endAngle)}
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              fill="none"
            />
          );
        })}
      </Svg>
    </View>
  );
};

export default DoseRing;