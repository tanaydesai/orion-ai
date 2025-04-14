"use client";

import { SimulationCard } from "./SimulationCard";

const sampleSimulations = [
  {
    title: "Newton's Cradle",
    description: "A classic demonstration of conservation of momentum and energy",
    simulationJson: JSON.stringify({
      behaviors: {
        composites: [
          {
            type: "newtonsCradle",
            x: 50,
            y: 30,
            size: 40,
            elements: 5,
            options: {
              ballRadius: 12
            }
          }
        ]
      },
      settings: {
        timeScale: 2.0,
        background: "#0F0A1F"
      },
      gravity: {
        x: 0,
        y: 1,
        scale: 0.001
      }
    })
  },
  {
    title: "Planetary Orbit",
    description: "Simulation of planets orbiting around a central star",
    simulationJson: JSON.stringify({
      behaviors: {
        composites: [
          {
            type: "solarSystem",
            x: 50,
            y: 50,
            size: 45,
            elements: 5
          }
        ]
      },
      objects: [
        {
          type: "circle",
          x: 50,
          y: 50,
          radius: 10,
          color: "#FFEB3B",
          isStatic: true,
          render: {
            lineWidth: 0
          }
        }
      ],
      settings: {
        timeScale: 3.0,
        background: "#0F0A1F"
      },
      gravity: {
        x: 0,
        y: 0,
        scale: 0
      }
    })
  },
  {
    title: "Pendulum Physics",
    description: "Multiple pendulums demonstrating harmonic motion",
    simulationJson: JSON.stringify({
      behaviors: {
        composites: [
          {
            type: "pendulum",
            x: 50,
            y: 20,
            size: 50,
            elements: 3,
            options: {
              stringLength: 70
            }
          }
        ]
      },
      settings: {
        timeScale: 2.0,
        background: "#0F0A1F"
      },
      gravity: {
        x: 0,
        y: 1,
        scale: 0.001
      }
    })
  },
  {
    title: "Black Hole Effect",
    description: "Objects being pulled into a gravitational singularity",
    simulationJson: JSON.stringify({
      objects: [
        // Add a central black hole
        {
          type: "circle",
          x: 50,
          y: 50,
          radius: 8,
          color: "#000000",
          isStatic: true
        },
        // Add an accretion disk
        ...Array(15).fill().map((_, i) => {
          const angle = (i / 15) * Math.PI * 2;
          const distance = 15 + Math.random() * 5;
          return {
            type: "circle",
            x: 50 + Math.cos(angle) * distance,
            y: 50 + Math.sin(angle) * distance,
            radius: 1 + Math.random() * 2,
            color: ["#E91E63", "#FF9800", "#FFEB3B"][Math.floor(Math.random() * 3)],
            isStatic: false,
            frictionAir: 0
          };
        }),
        // Add particles to be sucked in
        ...Array(30).fill().map((_, i) => ({
          type: "circle",
          x: 15 + Math.random() * 70,
          y: 15 + Math.random() * 70,
          radius: 1 + Math.random() * 2,
          color: ["#9C27B0", "#3F51B5", "#2196F3", "#4CAF50"][Math.floor(Math.random() * 4)],
          isStatic: false,
          frictionAir: 0,
          density: 0.0005
        }))
      ],
      forces: [
        {
          type: "blackhole",
          x: 50,
          y: 50,
          strength: 0.01,
          radius: 80,
          mass: 100
        }
      ],
      settings: {
        timeScale: 2.5,
        background: "#0F0A1F"
      },
      gravity: {
        x: 0,
        y: 0,
        scale: 0
      }
    })
  }
];

export const GallerySection = () => <section className="py-20 px-4 bg-gradient-to-b from-purple-900/30 to-purple-900/10"><div className="container mx-auto"><div className="text-center mb-16"><h2 className="text-3xl font-bold mb-4">Featured Simulations</h2><p className="text-gray-300 max-w-2xl mx-auto">Explore our gallery of physics simulations or create your own with a simple text prompt.</p></div><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">{sampleSimulations.map((sim, index) => (<SimulationCard key={index} title={sim.title} description={sim.description} simulationJson={sim.simulationJson} />))}</div><div className="mt-12 text-center"><a href="/gallery" className="inline-block bg-purple-600 hover:bg-purple-700 transition-colors text-white px-6 py-3 rounded-lg">View All Simulations</a></div></div></section>;
