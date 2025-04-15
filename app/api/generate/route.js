import OpenAI from 'openai';
import { z } from 'zod';

// Initialize the OpenAI client
const openai = new OpenAI({
apiKey:process.env.OPENAI_API_KEY
});

// Define the request schema
const requestSchema = z.object({
  prompt: z.string().min(1)
});

const generatePhysicsSimulation = async (prompt) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'o3-mini',
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
                "density": number (0.001-0.1),
                "restitution": number (0-1),
                "friction": number (0-1),
                "frictionAir": number (0-0.1),
                "initialVelocity": {
                  "x": number (-10 to 10),
                  "y": number (-10 to 10)
                },
                "initialAngularVelocity": number (-0.2 to 0.2),
                "force": {
                  "x": number (-0.05 to 0.05),
                  "y": number (-0.05 to 0.05)
                },
                "constraints": [
                  {
                    "type": "pin" | "spring" | "rope",
                    "pointX": number (x position of constraint point, percentage of canvas width, 0-100),
                    "pointY": number (y position of constraint point, percentage of canvas height, 0-100),
                    "stiffness": number (0-1),
                    "length": number (percentage of canvas height, 1-50),
                    "damping": number (0-0.1)
                  }
                ]
              }
            ],
            "gravity": {
              "x": number (-1 to 1),
              "y": number (-1 to 1),
              "scale": number (0 to 0.002)
            },
            "settings": {
              "timeScale": number (1.0-2.5),
              "background": string (hex color code, should be a dark purple/space theme)
            },
            "forces": [
              {
                "type": "attractor" | "repeller" | "wind" | "explosion" | "orbit" | "blackhole",
                "x": number (position x, percentage of canvas width, 0-100),
                "y": number (position y, percentage of canvas height, 0-100),
                "strength": number (0.0001-0.01),
                "radius": number (percentage of canvas width, 10-100),
                "mass": number (for orbit/blackhole, 1-100)
              }
            ],
            "behaviors": {
              "collisions": "elastic" | "inelastic" | "sticky",
              "particleEmitters": [
                {
                  "x": number (position x, percentage of canvas width, 0-100),
                  "y": number (position y, percentage of canvas height, 0-100),
                  "rate": number (0.1-2),
                  "particleSize": number (1-10),
                  "particleColor": string (hex color code),
                  "direction": number (0-360, degrees),
                  "spread": number (0-180, degrees),
                  "force": number (0.001-0.01)
                }
              ],
              "composites": [
                {
                  "type": "newtonsCradle" | "pendulum" | "solarSystem" | "chain",
                  "x": number (position x, percentage of canvas width, 0-100),
                  "y": number (position y, percentage of canvas height, 0-100),
                  "size": number (percentage of canvas height, 10-50),
                  "elements": number (2-10),
                  "options": {
                    "ballRadius": number (for newton's cradle, percentage of size, 5-20),
                    "stringLength": number (for pendulums, percentage of size, 50-90),
                    "linkLength": number (for chains, percentage of size, 5-15)
                  }
                }
              ]
            }
          }
          
          IMPORTANT GUIDELINES:
          1. Create appropriate objects based on the user's prompt
          2. Make the simulation visually appealing with colors that match a purple space theme
          3. For specific physics scenarios, use the appropriate composite types:
             - For Newton's cradle: use composites with type "newtonsCradle" and create 5 balls with the same radius and different colors, spaced evenly apart, with a constraint between each ball
             - For pendulums: use composites with type "pendulum" and create a single pendulum with a string length of 50-90% of the canvas height, and an initial angular velocity of -0.2 to 0.2
             - For planetary orbits: use composites with type "solarSystem" or create individual planets with orbit forces, with a mass of 1-100 and a radius of 10-100% of the canvas width
             - For black holes: use forces with type "blackhole" and a mass of 1-100, with a radius of 10-100% of the canvas width
          4. Set appropriate gravity for the type of simulation (e.g., lower for space simulations, standard Earth gravity for pendulums)
          5. For orbit simulations, use circular motion with appropriate forces
          6. For chain or connected systems, use constraints between objects
          
          ONLY output valid JSON. Do not include any explanation, markdown, or code blocks.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    // Get the response content
    const jsonResponse = response.choices[0].message.content;
    
    // Parse and validate the JSON
    try {
      const parsedJson = JSON.parse(jsonResponse);
      return jsonResponse;
    } catch (jsonError) {
      console.error("Error parsing JSON response:", jsonError);
      throw new Error("Failed to generate valid simulation. Please try again.");
    }
  } catch (error) {
    console.error('Error generating simulation:', error);
    throw new Error('Failed to generate simulation. Please try again.');
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
    const simulationJson = await generatePhysicsSimulation(prompt);
    
    return new Response(JSON.stringify({ simulationJson }), {
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
