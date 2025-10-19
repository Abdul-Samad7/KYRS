// Generate planet visual properties based on actual exoplanet data

export interface PlanetVisuals {
  color: string;
  atmosphereColor: string;
  emissiveIntensity: number;
  roughness: number;
  metalness: number;
  description: string;
}

export function generatePlanetVisuals(
  temperature?: number,
  radius?: number,
  disposition?: string
): PlanetVisuals {
  // Default values
  let color = '#4a90e2'; // Default blue
  let atmosphereColor = '#6bb6ff';
  let emissiveIntensity = 0.2;
  let roughness = 0.7;
  let metalness = 0.2;
  let description = 'Unknown type';

  if (!temperature) {
    return { color, atmosphereColor, emissiveIntensity, roughness, metalness, description };
  }

  // Temperature-based classification (Kelvin)
  if (temperature > 1500) {
    // Hot Jupiter / Lava Planet
    color = '#ff4500'; // Orange-red
    atmosphereColor = '#ff6347';
    emissiveIntensity = 0.6;
    metalness = 0.4;
    description = 'Hot Jupiter - Scorching gas giant';
  } else if (temperature > 1000) {
    // Very Hot Planet
    color = '#ff8c00'; // Dark orange
    atmosphereColor = '#ffa500';
    emissiveIntensity = 0.5;
    metalness = 0.3;
    description = 'Super-heated world';
  } else if (temperature > 700) {
    // Hot Planet
    color = '#ffb347'; // Light orange
    atmosphereColor = '#ffd700';
    emissiveIntensity = 0.4;
    description = 'Hot rocky world';
  } else if (temperature >= 250 && temperature <= 350) {
    // Habitable Zone! (Earth-like)
    if (radius && radius >= 0.8 && radius <= 1.5) {
      color = '#4a7c59'; // Green-blue (Earth-like)
      atmosphereColor = '#7ec8e3';
      emissiveIntensity = 0.15;
      description = 'Potentially habitable world';
    } else if (radius && radius > 1.5) {
      color = '#5a8db8'; // Blue (Water world)
      atmosphereColor = '#89CFF0';
      emissiveIntensity = 0.2;
      description = 'Ocean world candidate';
    } else {
      color = '#8b7355'; // Brown (Mars-like)
      atmosphereColor = '#d4a574';
      emissiveIntensity = 0.15;
      description = 'Temperate rocky planet';
    }
  } else if (temperature > 100 && temperature < 250) {
    // Cold Planet
    color = '#b0c4de'; // Light steel blue
    atmosphereColor = '#add8e6';
    emissiveIntensity = 0.1;
    roughness = 0.3; // More icy
    description = 'Cold icy world';
  } else {
    // Frozen / Very Cold
    color = '#e0ffff'; // Light cyan (icy)
    atmosphereColor = '#f0f8ff';
    emissiveIntensity = 0.05;
    roughness = 0.2; // Very icy/smooth
    metalness = 0.5; // Reflective ice
    description = 'Frozen ice world';
  }

  // Adjust based on radius if available
  if (radius) {
    if (radius > 10) {
      // Gas Giant
      description = description.includes('Jupiter') ? description : 'Gas giant';
      metalness = 0.1;
      roughness = 0.9;
    } else if (radius > 4) {
      // Neptune-like
      color = '#4169e1'; // Royal blue
      atmosphereColor = '#6495ed';
      description = 'Neptune-like ice giant';
      roughness = 0.8;
    }
  }

  // Adjust for confirmed vs candidate
  if (disposition?.includes('CONFIRMED')) {
    emissiveIntensity *= 1.2; // Confirmed planets glow more
  } else if (disposition?.includes('FALSE')) {
    emissiveIntensity *= 0.5; // False positives are dimmer
    color = '#696969'; // Gray
    atmosphereColor = '#808080';
  }

  return {
    color,
    atmosphereColor,
    emissiveIntensity,
    roughness,
    metalness,
    description
  };
}

// Get a simple color for 2D visualizations (cards, badges)
export function getPlanetColor(temperature?: number): string {
  if (!temperature) return '#4a90e2';
  
  if (temperature > 1500) return '#ff4500';
  if (temperature > 1000) return '#ff8c00';
  if (temperature > 700) return '#ffb347';
  if (temperature >= 250 && temperature <= 350) return '#4a7c59';
  if (temperature > 100) return '#b0c4de';
  return '#e0ffff';
}