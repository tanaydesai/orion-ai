import { z } from 'zod';
import { createOpenAI, openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

// Define the request schema
const requestSchema = z.object({
  prompt: z.string().min(1)
});

// Function to clean JSON response from markdown formatting
const cleanJsonResponse = (text) => {
  // Remove markdown code blocks and any other non-JSON formatting
  let cleaned = text;
  
  // Remove markdown code blocks (```json and ```)
  cleaned = cleaned.replace(/```json\s*/g, '');
  cleaned = cleaned.replace(/```\s*$/g, '');
  cleaned = cleaned.replace(/```/g, '');
  
  // Remove any leading/trailing whitespace
  cleaned = cleaned.trim();
  
  // Ensure the response is valid JSON
  try {
    // Test if it's valid JSON
    JSON.parse(cleaned);
    return cleaned;
  } catch (error) {
    console.error('Error parsing cleaned JSON:', error);
    console.log('Original text:', text);
    console.log('Cleaned text:', cleaned);
    
    // Try to extract JSON from the response if it's wrapped in other text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        JSON.parse(jsonMatch[0]);
        return jsonMatch[0];
      } catch (e) {
        console.error('Error parsing extracted JSON:', e);
      }
    }
    
    throw new Error('Failed to generate valid simulation JSON');
  }
};

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate the request
    const result = requestSchema.safeParse(body);
    if (!result.success) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const { prompt } = result.data;
    
    // Generate text using Vercel AI SDK
    const { text } = await generateText({
      model: google('gemini-2.0-flash-exp'),
      messages: [
        {
          role: 'system',
          content: `You are a physics simulation generator that creates structured JSON descriptions of physics simulations based on user prompts.
          
          Instead of generating JavaScript code, you will output a JSON object that describes the simulation.
          This JSON will be interpreted by client-side code to create a Matter.js simulation.
          
          Your JSON response should have this structure:
          {
            "objects": [
              {
                "type": "circle" | "rectangle" | "polygon",
                "x": number (position x, percentage of canvas width, 0-100),
                "y": number (position y, percentage of canvas height, 0-100),
                "width": number (for rectangles, percentage of canvas width, 1-50),
                "height": number (for rectangles, percentage of canvas height, 1-50),
                "radius": number (for circles, percentage of smaller canvas dimension, 1-25),
                "sides": number (for polygons, 3-8),
                "size": number (for polygons, percentage of smaller canvas dimension, 1-25),
                "color": string (hex color code),
                "isStatic": boolean,
                "density": number (0.001-0.1, higher values make objects heavier),
                "restitution": number (0-1.5, higher values make objects bouncier, values above 1 create more energy),
                "friction": number (0-1, higher values create more friction between objects),
                "frictionAir": number (0-0.01, VERY low values for faster animations),
                "initialVelocity": {
                  "x": number (-20 to 20, higher values create faster horizontal movement),
                  "y": number (-20 to 20, higher values create faster vertical movement)
                },
                "initialAngularVelocity": number (-0.5 to 0.5, higher values create faster rotation),
                "force": {
                  "x": number (-0.1 to 0.1, continuous force applied horizontally),
                  "y": number (-0.1 to 0.1, continuous force applied vertically)
                },
                "chamfer": number (0-10, rounds corners of rectangles),
                "constraints": [
                  {
                    "type": "pin" | "spring" | "rope" | "chain",
                    "pointX": number (x position of constraint point, percentage of canvas width, 0-100),
                    "pointY": number (y position of constraint point, percentage of canvas height, 0-100),
                    "stiffness": number (0.1-1, higher values make constraints more rigid),
                    "length": number (percentage of canvas height, 0.01-50, use very small values like 0.01 for chain links),
                    "damping": number (0-0.1, KEEP THIS VERY LOW for faster animations)
                  }
                ]
              }
            ],
            "gravity": {
              "x": 0,
              "y": 1,
              "scale": 1
            },
            "settings": {
              "timeScale": 1,
              "background": string (hex color code, should be a dark purple/space theme)
            },
            "forces": [
              {
                "type": "attractor" | "repeller" | "wind" | "explosion" | "orbit" | "blackhole",
                "x": number (position x, percentage of canvas width, 0-100),
                "y": number (position y, percentage of canvas height, 0-100),
                "strength": number (0.0001-0.05, higher values create stronger forces),
                "radius": number (percentage of canvas width, 10-100),
                "mass": number (for orbit/blackhole, 1-1000, higher values create stronger effects)
              }
            ],
            "behaviors": {
              "collisions": "elastic" | "inelastic" | "sticky",
              "particleEmitters": [
                {
                  "x": number (position x, percentage of canvas width, 0-100),
                  "y": number (position y, percentage of canvas height, 0-100),
                  "rate": number (0.1-10, higher values emit particles faster),
                  "particleSize": number (1-10),
                  "particleColor": string (hex color code),
                  "direction": number (0-360, degrees),
                  "spread": number (0-180, degrees),
                  "force": number (0.001-0.1, higher values propel particles faster)
                }
              ],
              "composites": [
                {
                  "type": "newtonsCradle" | "pendulum" | "solarSystem" | "chain" | "bridge" | "pyramid" | "stack",
                  "x": number (position x, percentage of canvas width, 0-100),
                  "y": number (position y, percentage of canvas height, 0-100),
                  "size": number (percentage of canvas height, 10-50),
                  "elements": number (2-20),
                  "options": {
                    "ballRadius": number (for newton's cradle, percentage of size, 5-20),
                    "stringLength": number (for pendulums, percentage of size, 50-90),
                    "linkLength": number (for chains, percentage of size, 0.01-15, use very small values for tighter chains),
                    "restitution": number (0-1.5, for newton's cradle, higher values create more energy),
                    "friction": number (0-1),
                    "frictionAir": number (0-0.005, KEEP THIS VERY LOW for faster animations),
                    "stiffness": number (0.8-1.0, for bridge/chain connections, higher values make more rigid connections),
                    "columns": number (2-10, for stack/pyramid, number of columns),
                    "rows": number (1-10, for stack/pyramid, number of rows)
                  }
                }
              ]
            }
          }
          
          IMPORTANT GUIDELINES:
          1. Create FAST-MOVING, dynamic simulations with minimal damping and air friction
          2. Make the simulation visually appealing with colors that match a purple space theme
          3. For specific physics scenarios, use these optimized parameters:
          
             - For Newton's Cradle: 
               * Use composites with type "newtonsCradle"
               * Set restitution to 1.0
               * Set friction to 0
               * Set frictionAir to 0.0001 (extremely low)
               * Set stiffness to 0.9-1.0
               * Give the first ball a good initial velocity (-10 to -20)
             
             - For Bridge:
               * Use composites with type "bridge"
               * Create a bridge with 10-15 elements
               * Set density to 0.005
               * Set frictionAir to 0.001-0.005 (very low)
               * Set stiffness to 0.9-0.99 (very high)
               * Set constraint length to 0.01-0.1 (very short)
               * Add some objects to fall onto the bridge
             
             - For Pendulums:
               * Use composites with type "pendulum"
               * Set string length to 50-90% of canvas height
               * Set frictionAir to 0.0001 (extremely low)
               * Give it a good initial angular velocity (-0.2 to 0.2)
             
             - For Planetary Orbits:
               * Use composites with type "solarSystem" with appropriate orbital velocities
               * Or create individual planets with orbit forces and a central mass of 100-1000
               * Set frictionAir to 0 for perfect orbits
             
             - For Black Holes:
               * Use forces with type "blackhole"
               * Set mass to 100-1000
               * Set strength to 0.001-0.01
          
          4. Set appropriate gravity for the type of simulation:
             - For space simulations: use very low gravity (0.0001-0.0005)
             - For Earth-like simulations: use standard gravity (0.001)
             - For pendulums and falling objects: use stronger gravity (0.002-0.005)
          
          5. CRITICAL SPEED SETTINGS:
             - Set timeScale to higher values (2.0-5.0) for much faster animations
             - Keep frictionAir EXTREMELY LOW (0-0.005) to prevent objects from slowing down
             - Keep damping EXTREMELY LOW (0-0.1) for constraints to prevent slowing
             - Use higher initialVelocity values (-20 to 20) for faster object movement
             - For constraints, use high stiffness (0.8-1.0) and very low length values (0.01-1.0) for tight connections
          
          6. For chain or bridge structures:
             - Use very high stiffness (0.9-0.99)
             - Use very low length values (0.01-0.1)
             - Set frictionAir to very low values (0.001-0.005)
             - Use chamfer values (1-5) to round corners
          
          7. For objects that should bounce well:
             - Set restitution to high values (0.8-1.5)
             - Set friction to low values (0-0.2)
             - Set frictionAir to extremely low values (0-0.001)
          
          ONLY output valid JSON. Do not include any explanation, markdown, or code blocks.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    // Clean the response to ensure valid JSON
    const cleanedJson = cleanJsonResponse(text);

    return new Response(JSON.stringify({ simulationJson: cleanedJson }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in generate route:', error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to generate simulation' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
