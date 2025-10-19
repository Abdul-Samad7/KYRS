"""
Planet Image Generator for ExoExplorer
Generates 3D planet visualizations using Google Gemini 2.0 Flash with native image generation

Author: ExoExplorer Team
Date: 2025
"""

import os
from typing import Dict, Optional, List, Tuple
from google import genai
from google.genai import types
from dotenv import load_dotenv        
import base64
import json
from pathlib import Path
import hashlib
from datetime import datetime

# Load environment variables
load_dotenv()

# Try to import Streamlit for secrets (optional)
try:
    import streamlit as st
    API_KEY = st.secrets.get("GEMINI_API_KEY")
except (ImportError, FileNotFoundError, KeyError):
    API_KEY = os.getenv('GEMINI_API_KEY')

if not API_KEY:
    raise ValueError("GEMINI_API_KEY not found. Set it in .env file or Streamlit secrets")


class PlanetImageGenerator:
    """
    Generate planet visualizations using Gemini 2.0 Flash's native image generation.
    
    This class creates detailed prompts for planet visualization based on
    exoplanet characteristics and uses Gemini's imagen-3.0-generate-001 model.
    """
    
    def __init__(self, output_dir: str = "backend/static/planet_images"):
        """
        Initialize the Planet Image Generator.
        
        Args:
            output_dir: Directory to save generated images
        """
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize Gemini client
        self.client = genai.Client(api_key=API_KEY)
        
        # Image generation model
        self.image_model = "imagen-3.0-generate-001"
        
        # Cache for generated images to avoid regeneration
        self.image_cache = {}
        
        print(f"✓ Planet Image Generator initialized")
        print(f"✓ Output directory: {self.output_dir}")
        print(f"✓ Using model: {self.image_model}")
    
    def generate_planet_prompt(self, planet_data: Dict) -> str:
        """
        Generate a detailed, scientifically-accurate prompt for planet visualization.
        
        Args:
            planet_data: Dictionary containing planet characteristics
                Required keys:
                - name: str
                - equilibrium_temperature_kelvin: float
                - planet_radius_earth_radii: float
                - disposition_using_kepler_data: str
                Optional keys:
                - orbital_period_days: float
                - insolation_flux_earth_flux: float
        
        Returns:
            Detailed prompt string for image generation
        """
        # Extract planet characteristics
        name = planet_data.get('planet_name') or planet_data.get('koi_name', 'Unknown Planet')
        temp = planet_data.get('equilibrium_temperature_kelvin', 300)
        radius = planet_data.get('planet_radius_earth_radii', 1.0)
        disposition = planet_data.get('disposition_using_kepler_data', 'CANDIDATE')
        period = planet_data.get('orbital_period_days')
        
        # Determine planet type based on temperature and radius
        planet_type = self._classify_planet_type(temp, radius)
        
        # Build scientifically accurate prompt
        prompt_parts = []
        
        # Main description
        prompt_parts.append(
            f"Photorealistic 3D render of exoplanet {name}, "
        )
        
        # Size classification
        if radius < 0.5:
            prompt_parts.append("a small Mercury-sized rocky world, ")
        elif radius < 1.5:
            prompt_parts.append("an Earth-sized terrestrial planet, ")
        elif radius < 4:
            prompt_parts.append("a Super-Earth with enhanced gravity, ")
        elif radius < 10:
            prompt_parts.append("a Neptune-like ice giant, ")
        else:
            prompt_parts.append("a massive gas giant like Jupiter, ")
        
        # Temperature-based appearance
        if temp > 1500:
            # Hot Jupiter / Lava planet
            prompt_parts.append(
                "extremely hot with glowing molten surface, "
                "orange and red lava flows, vaporized metal atmosphere, "
                "bright yellow glow on day side, intense heat distortion"
            )
        elif temp > 1000:
            # Very hot planet
            prompt_parts.append(
                "scorching volcanic surface with glowing cracks, "
                "dark rocky terrain, yellow-brown hazy atmosphere, "
                "sulfur clouds, orange and brown tones"
            )
        elif temp > 700:
            # Hot rocky world
            prompt_parts.append(
                "hot arid rocky surface, dusty red deserts, "
                "minimal atmosphere, rust and orange colors, "
                "similar to a hot Mars"
            )
        elif 250 <= temp <= 350:
            # Potentially habitable zone
            if 0.8 <= radius <= 1.5:
                prompt_parts.append(
                    "potentially habitable Earth-like world, "
                    "blue liquid water oceans, green and brown continents, "
                    "white clouds, polar ice caps, Earth-like appearance"
                )
            elif radius > 1.5:
                prompt_parts.append(
                    "ocean world covered in deep blue water, "
                    "scattered islands, thick atmosphere, "
                    "blue and white colors, water vapor clouds"
                )
            else:
                prompt_parts.append(
                    "temperate rocky planet with reddish surface, "
                    "thin atmosphere, polar ice, Mars-like appearance"
                )
        elif temp > 100:
            # Cold icy world
            prompt_parts.append(
                "cold icy world with pale blue and white frozen surface, "
                "crystalline ice formations, thin atmosphere, "
                "possible subsurface ocean"
            )
        else:
            # Frozen world
            prompt_parts.append(
                "frozen world with brilliant white and cyan ice, "
                "smooth frozen plains, nitrogen frost, "
                "pristine ice crystals, minimal atmosphere"
            )
        
        # Add atmospheric features based on size
        if radius > 4:
            prompt_parts.append(
                ", thick atmospheric bands with swirling storms, "
                "Jupiter-like cloud patterns, massive hurricanes, "
                "distinct color banding"
            )
        elif 1.5 < radius <= 4:
            prompt_parts.append(
                ", substantial atmosphere with cloud formations, "
                "visible weather patterns"
            )
        
        # Rings for larger cold planets
        if radius > 6 and temp < 1000:
            prompt_parts.append(
                ", spectacular ring system like Saturn, "
                "ice and rock particles, rings casting shadows"
            )
        
        # Technical rendering specifications
        prompt_parts.append(
            ". Space background with distant stars, "
            "realistic lighting from nearby star, "
            "physically accurate shadows and highlights, "
            "8K ultra high resolution, cinematic quality, "
            "NASA-quality scientific visualization, "
            "photorealistic materials and textures, "
            "showing full sphere at slight angle"
        )
        
        return "".join(prompt_parts)
    
    def _classify_planet_type(self, temperature: float, radius: float) -> str:
        """
        Classify planet type based on temperature and radius.
        
        Args:
            temperature: Temperature in Kelvin
            radius: Radius in Earth radii
        
        Returns:
            Planet type classification string
        """
        if radius > 10:
            return "gas_giant"
        elif radius > 4:
            return "ice_giant"
        elif temperature > 1500:
            return "hot_jupiter"
        elif temperature > 700:
            return "hot_rocky"
        elif 250 <= temperature <= 350 and 0.8 <= radius <= 1.5:
            return "habitable_terrestrial"
        elif 250 <= temperature <= 350:
            return "temperate"
        elif temperature > 100:
            return "cold_icy"
        else:
            return "frozen"
    
    def generate_planet_image(
        self,
        planet_data: Dict,
        output_filename: Optional[str] = None,
        aspect_ratio: str = "1:1",
        person_generation: str = "dont_allow"
    ) -> Dict[str, any]:
        """
        Generate planet image using Gemini 2.0 Flash with native image generation.
        
        Args:
            planet_data: Planet characteristics dictionary
            output_filename: Optional custom filename (auto-generated if None)
            aspect_ratio: Image aspect ratio ("1:1", "16:9", "9:16", "4:3", "3:4")
            person_generation: Person generation policy (default: "dont_allow")
        
        Returns:
            Dictionary containing:
            - image_path: Path to saved image
            - prompt: The prompt used
            - planet_type: Classification
            - success: Boolean
            - error: Error message if failed
        """
        # Generate prompt
        prompt = self.generate_planet_prompt(planet_data)
        
        # Generate filename if not provided
        if output_filename is None:
            planet_id = planet_data.get('kepler_id') or planet_data.get('koi_name', 'unknown')
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_filename = f"planet_{planet_id}_{timestamp}.png"
        
        output_path = self.output_dir / output_filename
        
        try:
            print(f"🎨 Generating image for prompt: {prompt[:100]}...")
            
            # Generate image using Gemini 2.0 Flash
            response = self.client.models.generate_images(
                model=self.image_model,
                prompt=prompt,
                config=types.GenerateImageConfig(
                    number_of_images=1,
                    aspect_ratio=aspect_ratio,
                    person_generation=person_generation,
                    safety_filter_level="block_only_high",  # Allow scientific content
                    negative_prompt="cartoon, anime, illustration, drawing, sketch, low quality, blurry, distorted"
                )
            )
            
            # Save the generated image
            if response.images:
                image = response.images[0]
                
                # Save to file
                with open(output_path, 'wb') as f:
                    f.write(image.image.data)
                
                print(f"✓ Image saved to: {output_path}")
                
                # Also save prompt
                prompt_path = output_path.with_suffix('.txt')
                prompt_path.write_text(prompt)
                
                return {
                    'success': True,
                    'image_path': str(output_path),
                    'image_url': f"/static/planet_images/{output_filename}",
                    'prompt': prompt,
                    'planet_type': self._classify_planet_type(
                        planet_data.get('equilibrium_temperature_kelvin', 300),
                        planet_data.get('planet_radius_earth_radii', 1.0)
                    ),
                    'error': None
                }
            else:
                raise Exception("No images generated")
        
        except Exception as e:
            print(f"✗ Error generating image: {e}")
            return {
                'success': False,
                'image_path': None,
                'image_url': None,
                'prompt': prompt,
                'planet_type': self._classify_planet_type(
                    planet_data.get('equilibrium_temperature_kelvin', 300),
                    planet_data.get('planet_radius_earth_radii', 1.0)
                ),
                'error': str(e)
            }
    
    def batch_generate_images(
        self, 
        planets_list: List[Dict],
        limit: Optional[int] = None,
        delay_seconds: float = 1.0
    ) -> Dict[str, Dict]:
        """
        Generate images for multiple planets efficiently.
        
        Args:
            planets_list: List of planet data dictionaries
            limit: Maximum number of planets to process
            delay_seconds: Delay between API calls to respect rate limits
        
        Returns:
            Dictionary mapping planet IDs to their generation results
        """
        import time
        
        results = {}
        planets_to_process = planets_list[:limit] if limit else planets_list
        
        for i, planet_data in enumerate(planets_to_process):
            planet_id = planet_data.get('kepler_id') or planet_data.get('koi_name', f'planet_{i}')
            planet_name = planet_data.get('planet_name') or planet_data.get('koi_name', f'Planet {i}')
            
            print(f"\n[{i+1}/{len(planets_to_process)}] Processing: {planet_name}")
            
            try:
                result = self.generate_planet_image(planet_data)
                results[str(planet_id)] = result
                
                if result['success']:
                    print(f"✓ Success: {planet_name}")
                else:
                    print(f"✗ Failed: {planet_name} - {result['error']}")
                
            except Exception as e:
                print(f"✗ Error processing {planet_name}: {e}")
                results[str(planet_id)] = {
                    'success': False,
                    'error': str(e)
                }
            
            # Rate limiting
            if i < len(planets_to_process) - 1:
                time.sleep(delay_seconds)
        
        return results
    
    def get_visual_properties(self, planet_data: Dict) -> Dict:
        """
        Generate visual properties for frontend Three.js rendering.
        Compatible with your existing ExoplanetVisualization component.
        
        Args:
            planet_data: Planet characteristics dictionary
        
        Returns:
            Dictionary of visual properties for Three.js
        """
        temp = planet_data.get('equilibrium_temperature_kelvin', 300)
        radius = planet_data.get('planet_radius_earth_radii', 1.0)
        
        # Determine colors and properties
        if temp > 1500:
            color = "#ff4500"
            atmosphere_color = "#ff6347"
            emissive_intensity = 0.6
            roughness = 0.7
            metalness = 0.4
        elif temp > 1000:
            color = "#ff8c00"
            atmosphere_color = "#ffa500"
            emissive_intensity = 0.5
            roughness = 0.7
            metalness = 0.3
        elif temp > 700:
            color = "#ffb347"
            atmosphere_color = "#ffd700"
            emissive_intensity = 0.4
            roughness = 0.8
            metalness = 0.2
        elif 250 <= temp <= 350:
            if 0.8 <= radius <= 1.5:
                color = "#4a7c59"
                atmosphere_color = "#7ec8e3"
                emissive_intensity = 0.15
            else:
                color = "#5a8db8"
                atmosphere_color = "#89CFF0"
                emissive_intensity = 0.2
            roughness = 0.7
            metalness = 0.2
        elif temp > 100:
            color = "#b0c4de"
            atmosphere_color = "#add8e6"
            emissive_intensity = 0.1
            roughness = 0.3
            metalness = 0.4
        else:
            color = "#e0ffff"
            atmosphere_color = "#f0f8ff"
            emissive_intensity = 0.05
            roughness = 0.2
            metalness = 0.5
        
        # Adjust for gas giants
        if radius > 10:
            roughness = 0.9
            metalness = 0.1
        
        return {
            'color': color,
            'atmosphereColor': atmosphere_color,
            'emissiveIntensity': emissive_intensity,
            'roughness': roughness,
            'metalness': metalness,
            'size': min(2 + radius * 0.2, 3),
            'rotationSpeed': 0.001 + (temp / 5000) * 0.002,
        }


# Example usage and testing
if __name__ == "__main__":
    # Initialize generator
    generator = PlanetImageGenerator()
    
    # Example planet data (matches your Kepler dataset structure)
    example_planets = [
        {
            'kepler_id': 10797460,
            'koi_name': 'K00752.01',
            'planet_name': 'Kepler-22 b',
            'disposition_using_kepler_data': 'CONFIRMED',
            'equilibrium_temperature_kelvin': 295.0,
            'planet_radius_earth_radii': 2.38,
            'orbital_period_days': 289.86,
        },
        {
            'koi_name': 'K00755.01',
            'disposition_using_kepler_data': 'CANDIDATE',
            'equilibrium_temperature_kelvin': 1850.0,
            'planet_radius_earth_radii': 1.05,
            'orbital_period_days': 2.47,
        },
        {
            'koi_name': 'K00123.01',
            'disposition_using_kepler_data': 'CONFIRMED',
            'equilibrium_temperature_kelvin': 150.0,
            'planet_radius_earth_radii': 3.8,
            'orbital_period_days': 450.2,
        },
    ]
    
    print("=" * 80)
    print("PLANET IMAGE GENERATOR - GEMINI 2.0 FLASH WITH IMAGE GENERATION")
    print("=" * 80)
    
    # Test: Generate prompt only (fast, no API cost)
    print("\n📝 Testing prompt generation...")
    for planet in example_planets[:1]:  # Test with first planet
        name = planet.get('planet_name') or planet.get('koi_name')
        print(f"\n🪐 Planet: {name}")
        print("-" * 80)
        
        prompt = generator.generate_planet_prompt(planet)
        print(f"Prompt: {prompt}")
        
        visual_props = generator.get_visual_properties(planet)
        print(f"\nVisual Properties for Three.js:")
        for key, value in visual_props.items():
            print(f"  - {key}: {value}")
    
    # Test: Generate actual images (costs API credits)
    print("\n" + "=" * 80)
    print("🎨 Ready to generate actual images?")
    print("This will use Gemini API credits (imagen-3.0-generate-001)")
    print("=" * 80)
    
    user_input = input("\nGenerate images? (yes/no): ").strip().lower()
    
    if user_input == 'yes':
        print("\n🚀 Generating images...")
        results = generator.batch_generate_images(
            example_planets,
            limit=3,  # Limit to 3 for testing
            delay_seconds=2.0  # Rate limiting
        )
        
        print("\n" + "=" * 80)
        print("📊 GENERATION SUMMARY")
        print("=" * 80)
        
        successful = sum(1 for r in results.values() if r.get('success'))
        failed = len(results) - successful
        
        print(f"✓ Successful: {successful}/{len(results)}")
        print(f"✗ Failed: {failed}/{len(results)}")
        
        for planet_id, result in results.items():
            if result.get('success'):
                print(f"\n✓ {planet_id}: {result['image_path']}")
            else:
                print(f"\n✗ {planet_id}: {result.get('error')}")
    else:
        print("\n⏭️  Skipping image generation. Run again with 'yes' to generate.")
    
    print("\n" + "=" * 80)
    print("✓ Test completed!")
    print("=" * 80)