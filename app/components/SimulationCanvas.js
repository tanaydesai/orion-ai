"use client";

import { useEffect, useRef } from 'react';
import Matter from 'matter-js';

export const SimulationCanvas = ({ simulationJson }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const emittersRef = useRef([]);

  useEffect(() => {
    if (!simulationJson || !canvasRef.current) return;
    
    // Parse the JSON if it's a string
    let simulation;
    try {
      simulation = typeof simulationJson === 'string' ? JSON.parse(simulationJson) : simulationJson;
    } catch (error) {
      console.error('Error parsing simulation JSON:', error);
      return;
    }

    const canvas = canvasRef.current;
    const container = containerRef.current;
    
    // Set up Matter.js
    const Engine = Matter.Engine;
    const Render = Matter.Render;
    const Runner = Matter.Runner;
    const Bodies = Matter.Bodies;
    const Body = Matter.Body;
    const Composite = Matter.Composite;
    const World = Matter.World;
    const MouseConstraint = Matter.MouseConstraint;
    const Mouse = Matter.Mouse;
    const Vector = Matter.Vector;
    const Events = Matter.Events;
    
    // Create engine with improved solver settings
    window.matterEngine = Engine.create({
      positionIterations: 10,  // Higher for more accuracy
      velocityIterations: 10,  // Higher for more accuracy
      constraintIterations: 5, // Higher for more stable constraints
      enableSleeping: false    // Keep objects active for better animations
    });
    const world = window.matterEngine.world;
    
    // Apply gravity settings if provided
    if (simulation.gravity) {
      const gravity = simulation.gravity;
      world.gravity.x = (gravity.x || 0) * (gravity.scale || 0.001);
      world.gravity.y = (gravity.y || 1) * (gravity.scale || 0.001);
    }
    
    // Apply time scale if provided
    if (simulation.settings?.timeScale) {
      window.matterEngine.timing.timeScale = simulation.settings.timeScale;
    } else {
      // Default to faster animation if not specified
      window.matterEngine.timing.timeScale = 2.0;
    }
    
    // Create renderer
    window.matterRender = Render.create({
      canvas: canvas,
      engine: window.matterEngine,
      options: {
        width: container.clientWidth,
        height: container.clientHeight,
        wireframes: false,
        background: simulation.settings?.background || '#0F0A1F',
        pixelRatio: window.devicePixelRatio
      }
    });
    
    // Start the renderer
    Render.run(window.matterRender);
    
    // Create runner
    window.matterRunner = Runner.create();
    Runner.run(window.matterRunner, window.matterEngine);
    
    // Add mouse control
    const mouse = Mouse.create(window.matterRender.canvas);
    const mouseConstraint = MouseConstraint.create(window.matterEngine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false }
      }
    });
    World.add(world, mouseConstraint);
    window.matterRender.mouse = mouse;
    
    // Add boundaries
    const wallThickness = 50;
    World.add(world, [
      // Bottom wall
      Bodies.rectangle(container.clientWidth / 2, container.clientHeight + wallThickness / 2, container.clientWidth, wallThickness, { 
        isStatic: true,
        render: { fillStyle: '#3B0764' }
      }),
      // Left wall
      Bodies.rectangle(-wallThickness / 2, container.clientHeight / 2, wallThickness, container.clientHeight, { 
        isStatic: true,
        render: { fillStyle: '#3B0764' }
      }),
      // Right wall
      Bodies.rectangle(container.clientWidth + wallThickness / 2, container.clientHeight / 2, wallThickness, container.clientHeight, { 
        isStatic: true,
        render: { fillStyle: '#3B0764' }
      }),
      // Top wall
      Bodies.rectangle(container.clientWidth / 2, -wallThickness / 2, container.clientWidth, wallThickness, { 
        isStatic: true,
        render: { fillStyle: '#3B0764' }
      })
    ]);
    
    // Create objects from simulation description
    const bodies = [];
    if (simulation.objects && Array.isArray(simulation.objects)) {
      simulation.objects.forEach(obj => {
        let body;
        const x = (obj.x / 100) * container.clientWidth;
        const y = (obj.y / 100) * container.clientHeight;
        const smallerDimension = Math.min(container.clientWidth, container.clientHeight);
        
        const options = {
          isStatic: obj.isStatic || false,
          density: obj.density || 0.001,
          restitution: obj.restitution || 0.6,
          friction: obj.friction || 0.1,
          frictionAir: obj.frictionAir || 0.01,
          render: {
            fillStyle: obj.color || '#9C27B0'
          }
        };
        
        switch(obj.type) {
          case 'circle':
            const radius = (obj.radius / 100) * smallerDimension;
            body = Bodies.circle(x, y, radius, options);
            break;
            
          case 'rectangle':
            const width = (obj.width / 100) * container.clientWidth;
            const height = (obj.height / 100) * container.clientHeight;
            body = Bodies.rectangle(x, y, width, height, options);
            break;
            
          case 'polygon':
            const sides = obj.sides || 5;
            const size = (obj.size / 100) * smallerDimension;
            body = Bodies.polygon(x, y, sides, size, options);
            break;
            
          default:
            // Default to circle if type is not specified
            body = Bodies.circle(x, y, 30, options);
        }
        
        // Apply initial velocity if specified
        if (obj.initialVelocity) {
          Body.setVelocity(body, {
            x: obj.initialVelocity.x || 0,
            y: obj.initialVelocity.y || 0
          });
        }
        
        // Apply initial angular velocity if specified
        if (obj.initialAngularVelocity) {
          Body.setAngularVelocity(body, obj.initialAngularVelocity);
        }
        
        // Apply force if specified
        if (obj.force) {
          Body.applyForce(body, body.position, {
            x: obj.force.x || 0,
            y: obj.force.y || 0
          });
        }
        
        World.add(world, body);
        bodies.push(body);
      });
    }
    
    // Add forces
    if (simulation.forces && Array.isArray(simulation.forces)) {
      simulation.forces.forEach(force => {
        const forceX = (force.x / 100) * container.clientWidth;
        const forceY = (force.y / 100) * container.clientHeight;
        const forcePosition = { x: forceX, y: forceY };
        const forceRadius = (force.radius / 100) * container.clientWidth;
        
        // Visual indicator for force (optional)
        const indicator = Bodies.circle(forceX, forceY, 10, {
          isStatic: true,
          isSensor: true,
          render: {
            fillStyle: force.type === 'attractor' ? '#9C27B0' : 
                       force.type === 'repeller' ? '#FF5722' : 
                       force.type === 'wind' ? '#2196F3' :
                       force.type === 'blackhole' ? '#000000' : '#F44336'
          }
        });
        World.add(world, indicator);
        
        // Add force effect
        Events.on(window.matterEngine, 'beforeUpdate', () => {
          bodies.forEach(body => {
            if (body.isStatic) return;
            
            const distance = Vector.magnitude(Vector.sub(body.position, forcePosition));
            
            if (distance < forceRadius) {
              const direction = Vector.normalise(
                force.type === 'attractor' ? Vector.sub(forcePosition, body.position) :
                force.type === 'repeller' ? Vector.sub(body.position, forcePosition) :
                force.type === 'wind' ? { x: 1, y: 0 } :
                force.type === 'blackhole' ? Vector.sub(forcePosition, body.position) :
                Vector.sub(body.position, forcePosition)
              );
              
              let strength = force.strength * (1 - distance / forceRadius);
              
              // For blackhole, increase strength as objects get closer
              if (force.type === 'blackhole') {
                // Use a more dramatic force calculation based on inverse square law
                strength = force.strength * Math.pow(forceRadius / (distance + 1), 2) * 10;
                
                // Add visual effect - stretch bodies toward black hole (more dramatic)
                const scale = 1 + (2.5 * (1 - distance / forceRadius));
                const angle = Math.atan2(forcePosition.y - body.position.y, forcePosition.x - body.position.x);
                Body.scale(body, scale, 1/scale);
                Body.rotate(body, angle - body.angle);
                
                // Add velocity damping for more stable black hole effect
                const currentVel = body.velocity;
                const velMag = Vector.magnitude(currentVel);
                if (velMag > 10) {
                  Body.setVelocity(body, {
                    x: currentVel.x * 0.85,
                    y: currentVel.y * 0.85
                  });
                }
                
                // Add visual effects - particles being sucked in (enhanced)
                if (Math.random() < 0.2 && distance < forceRadius * 0.7) {
                  const particleSize = Math.random() * 3 + 1;
                  const particlePos = {
                    x: body.position.x + (Math.random() - 0.5) * body.circleRadius * 2,
                    y: body.position.y + (Math.random() - 0.5) * body.circleRadius * 2
                  };
                  
                  // Create particle with glowing effect
                  const particle = Bodies.circle(
                    particlePos.x,
                    particlePos.y,
                    particleSize,
                    {
                      collisionFilter: { group: -1 },
                      frictionAir: 0.001,
                      render: {
                        fillStyle: `rgba(${Math.floor(Math.random()*100 + 155)}, ${Math.floor(Math.random()*100)}, ${Math.floor(Math.random()*155 + 100)}, ${Math.random()*0.3 + 0.7})`,
                        lineWidth: 0
                      }
                    }
                  );
                  
                  World.add(world, particle);
                  
                  // Apply force toward black hole with spiral effect
                  const particleToBlackhole = Vector.sub(forcePosition, particlePos);
                  const particleDirection = Vector.normalise(particleToBlackhole);
                  const particleDistance = Vector.magnitude(particleToBlackhole);
                  
                  // Add tangential component for spiral effect
                  const tangent = {
                    x: -particleDirection.y,
                    y: particleDirection.x
                  };
                  
                  Body.applyForce(particle, particlePos, {
                    x: (particleDirection.x * 0.00008 + tangent.x * 0.00002) * (forceRadius / (particleDistance + 1)),
                    y: (particleDirection.y * 0.00008 + tangent.y * 0.00002) * (forceRadius / (particleDistance + 1))
                  });
                  
                  // Remove particle after a short time with fade effect
                  let opacity = 1;
                  const fadeInterval = setInterval(() => {
                    opacity -= 0.1;
                    if (opacity <= 0) {
                      clearInterval(fadeInterval);
                      World.remove(world, particle);
                    } else if (particle.render) {
                      const currentColor = particle.render.fillStyle;
                      if (currentColor.startsWith('rgba')) {
                        const parts = currentColor.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([.\d]+)\)/);
                        if (parts && parts.length === 5) {
                          particle.render.fillStyle = `rgba(${parts[1]}, ${parts[2]}, ${parts[3]}, ${opacity})`;
                        }
                      }
                    }
                  }, 50);
                  
                  // Add to cleanup
                  emittersRef.current.push(fadeInterval);
                }
                
                // Add accretion disk effect around black hole
                if (Math.random() < 0.05) {
                  const diskAngle = Math.random() * Math.PI * 2;
                  const diskDistance = forceRadius * (0.2 + Math.random() * 0.3);
                  const diskParticleSize = Math.random() * 2 + 1;
                  
                  const diskParticle = Bodies.circle(
                    forcePosition.x + Math.cos(diskAngle) * diskDistance,
                    forcePosition.y + Math.sin(diskAngle) * diskDistance,
                    diskParticleSize,
                    {
                      collisionFilter: { group: -2 },
                      frictionAir: 0.001,
                      render: {
                        fillStyle: `rgba(${155 + Math.floor(Math.random()*100)}, ${100 + Math.floor(Math.random()*155)}, ${200 + Math.floor(Math.random()*55)}, 0.7)`,
                        lineWidth: 0
                      }
                    }
                  );
                  
                  World.add(world, diskParticle);
                  
                  // Apply orbital velocity
                  const orbitalSpeed = 0.00015 * Math.sqrt(forceRadius / diskDistance);
                  const tangent = {
                    x: -Math.sin(diskAngle),
                    y: Math.cos(diskAngle)
                  };
                  
                  Body.setVelocity(diskParticle, {
                    x: tangent.x * orbitalSpeed * diskDistance,
                    y: tangent.y * orbitalSpeed * diskDistance
                  });
                  
                  // Apply slight inward pull
                  Events.on(window.matterEngine, 'beforeUpdate', function diskParticleAttraction() {
                    if (diskParticle && diskParticle.position) {
                      const toCenter = Vector.sub(forcePosition, diskParticle.position);
                      const distToCenter = Vector.magnitude(toCenter);
                      
                      if (distToCenter > 0) {
                        const forceVector = Vector.mult(Vector.normalise(toCenter), 0.000001 * forceRadius);
                        Body.applyForce(diskParticle, diskParticle.position, forceVector);
                      } else {
                        Events.off(window.matterEngine, 'beforeUpdate', diskParticleAttraction);
                      }
                    } else {
                      Events.off(window.matterEngine, 'beforeUpdate', diskParticleAttraction);
                    }
                  });
                  
                  // Remove after some time
                  setTimeout(() => {
                    World.remove(world, diskParticle);
                  }, 5000);
                }
              }
              
              // For orbit, apply perpendicular force for circular motion
              if (force.type === 'orbit') {
                const perpendicular = {
                  x: -direction.y,
                  y: direction.x
                };
                
                // Adjust strength based on distance for stable orbit
                // Use Kepler's laws for more realistic orbital mechanics
                const orbitStrength = force.strength * Math.sqrt(forceRadius / (distance + 1));
                
                Body.applyForce(body, body.position, {
                  x: perpendicular.x * orbitStrength + direction.x * strength * 0.05,
                  y: perpendicular.y * orbitStrength + direction.y * strength * 0.05
                });
                
                // Add orbital trail effect
                if (Math.random() < 0.05 && body.circleRadius > 5) {
                  const trailParticle = Bodies.circle(
                    body.position.x,
                    body.position.y,
                    body.circleRadius * 0.3,
                    {
                      isStatic: true,
                      collisionFilter: { group: -1 },
                      render: {
                        fillStyle: body.render.fillStyle ? body.render.fillStyle + '30' : '#FFFFFF30',
                        opacity: 0.3
                      }
                    }
                  );
                  
                  World.add(world, trailParticle);
                  
                  // Fade out and remove trail particle
                  let opacity = 0.3;
                  const fadeInterval = setInterval(() => {
                    opacity -= 0.02;
                    if (opacity <= 0) {
                      clearInterval(fadeInterval);
                      World.remove(world, trailParticle);
                    } else if (trailParticle.render) {
                      const currentColor = trailParticle.render.fillStyle;
                      if (currentColor.startsWith('#') && currentColor.length === 9) {
                        const baseColor = currentColor.substring(0, 7);
                        const alpha = Math.floor(opacity * 255).toString(16).padStart(2, '0');
                        trailParticle.render.fillStyle = `${baseColor}${alpha}`;
                      }
                    }
                  }, 50);
                  
                  // Add to cleanup
                  emittersRef.current.push(fadeInterval);
                }
              } else {
                Body.applyForce(body, body.position, {
                  x: direction.x * strength,
                  y: direction.y * strength
                });
              }
            }
          });
        });
      });
    }
    
    // Add composite objects
    if (simulation.behaviors?.composites && Array.isArray(simulation.behaviors.composites)) {
      simulation.behaviors.composites.forEach(composite => {
        const x = (composite.x / 100) * container.clientWidth;
        const y = (composite.y / 100) * container.clientHeight;
        const size = (composite.size / 100) * container.clientHeight;
        const elements = composite.elements || 5;
        
        switch(composite.type) {
          case 'newtonsCradle': {
            // Create Newton's Cradle
            const ballRadius = size * ((composite.options?.ballRadius || 10) / 100);
            const stringLength = size * 0.8;
            
            // Create the balls
            for (let i = 0; i < elements; i++) {
              const ball = Bodies.circle(
                x + (i - (elements-1)/2) * (ballRadius * 2.1),
                y + stringLength,
                ballRadius,
                {
                  inertia: Infinity,
                  restitution: 0.99,
                  friction: 0.0001,
                  frictionAir: 0.00001,
                  slop: 0.01,
                  render: {
                    fillStyle: i === 0 || i === elements-1 ? '#E91E63' : '#9C27B0'
                  }
                }
              );
              
              // Create the string
              const string = Matter.Constraint.create({
                pointA: { x: x + (i - (elements-1)/2) * (ballRadius * 2.1), y: y },
                bodyB: ball,
                length: stringLength,
                stiffness: 1,
                damping: 0.01,
                render: {
                  strokeStyle: '#FFFFFF',
                  lineWidth: 2
                }
              });
              
              World.add(world, [ball, string]);
              bodies.push(ball);
            }
            
            // Give the first ball an initial velocity to start the cradle
            if (elements > 0) {
              const firstBall = bodies[bodies.length - elements];
              Body.setPosition(firstBall, {
                x: firstBall.position.x - ballRadius * 4,
                y: firstBall.position.y
              });
            }
            break;
          }
          
          case 'pendulum': {
            // Create pendulum
            const stringLength = size * ((composite.options?.stringLength || 70) / 100);
            const ballRadius = size * 0.1;
            
            for (let i = 0; i < elements; i++) {
              const angle = (i / elements) * Math.PI;
              const pendulumX = x + Math.sin(angle) * (size * 0.3);
              
              const ball = Bodies.circle(
                pendulumX,
                y + stringLength,
                ballRadius,
                {
                  restitution: 0.8,
                  friction: 0.005,
                  frictionAir: 0.0001,
                  render: {
                    fillStyle: `hsl(${280 + (i * 15) % 60}, 70%, 60%)`
                  }
                }
              );
              
              const string = Matter.Constraint.create({
                pointA: { x: pendulumX, y: y },
                bodyB: ball,
                length: stringLength,
                stiffness: 0.98,
                damping: 0.05,
                render: {
                  type: 'line',
                  strokeStyle: '#FFFFFF',
                  lineWidth: 2
                }
              });
              
              World.add(world, [ball, string]);
              bodies.push(ball);
              
              // Give initial velocity to start pendulum swinging
              Body.setVelocity(ball, { x: (i % 2 === 0 ? 5 : -5), y: 0 });
            }
            break;
          }
          
          case 'solarSystem': {
            // Create enhanced solar system
            const sunRadius = size * 0.15;
            const sun = Bodies.circle(x, y, sunRadius, {
              isStatic: true,
              render: {
                fillStyle: '#FFEB3B',
                lineWidth: 0
              }
            });
            
            // Add sun glow effect
            const sunGlow = Bodies.circle(x, y, sunRadius * 1.5, {
              isStatic: true,
              isSensor: true,
              collisionFilter: { group: -1 },
              render: {
                fillStyle: 'radial-gradient(circle, rgba(255,235,59,0.8) 0%, rgba(255,152,0,0.4) 50%, rgba(255,87,34,0) 100%)',
                opacity: 0.5,
                lineWidth: 0
              }
            });
            
            World.add(world, [sun, sunGlow]);
            
            // Create solar flare effect
            const flareInterval = setInterval(() => {
              if (Math.random() < 0.3) {
                const flareAngle = Math.random() * Math.PI * 2;
                const flareLength = sunRadius * (0.5 + Math.random() * 0.5);
                const flareWidth = sunRadius * (0.1 + Math.random() * 0.2);
                
                const flare = Bodies.rectangle(
                  x + Math.cos(flareAngle) * sunRadius * 0.8,
                  y + Math.sin(flareAngle) * sunRadius * 0.8,
                  flareLength,
                  flareWidth,
                  {
                    isStatic: true,
                    isSensor: true,
                    angle: flareAngle,
                    collisionFilter: { group: -1 },
                    render: {
                      fillStyle: '#FFC107',
                      opacity: 0.7,
                      lineWidth: 0
                    }
                  }
                );
                
                World.add(world, flare);
                
                // Remove flare after animation
                setTimeout(() => {
                  World.remove(world, flare);
                }, 300 + Math.random() * 200);
              }
            }, 200);
            
            emittersRef.current.push(flareInterval);
            
            // Create planets with enhanced visuals
            const planetColors = [
              { fill: '#3F51B5', atmosphere: '#5C6BC0' }, // Blue
              { fill: '#4CAF50', atmosphere: '#81C784' }, // Green
              { fill: '#F44336', atmosphere: '#E57373' }, // Red
              { fill: '#FF9800', atmosphere: '#FFB74D' }, // Orange
              { fill: '#795548', atmosphere: '#A1887F' }, // Brown
              { fill: '#9C27B0', atmosphere: '#BA68C8' }, // Purple
              { fill: '#00BCD4', atmosphere: '#4DD0E1' }  // Cyan
            ];
            
            for (let i = 0; i < elements; i++) {
              const distance = sunRadius * 2 + (i + 1) * size * 0.1;
              const angle = Math.random() * Math.PI * 2;
              const planetRadius = sunRadius * (0.2 + Math.random() * 0.3);
              const planetColor = planetColors[i % planetColors.length];
              
              // Create planet with atmosphere
              const planet = Bodies.circle(
                x + Math.cos(angle) * distance,
                y + Math.sin(angle) * distance,
                planetRadius,
                {
                  restitution: 0.6,
                  friction: 0.005,
                  frictionAir: 0,
                  render: {
                    fillStyle: planetColor.fill,
                    lineWidth: 0
                  }
                }
              );
              
              // Add atmosphere effect
              const atmosphere = Bodies.circle(
                x + Math.cos(angle) * distance,
                y + Math.sin(angle) * distance,
                planetRadius * 1.2,
                {
                  isSensor: true,
                  collisionFilter: { group: -1 },
                  render: {
                    fillStyle: planetColor.atmosphere + '40',
                    opacity: 0.4,
                    lineWidth: 0
                  }
                }
              );
              
              // Create constraint to keep atmosphere with planet
              const atmosphereConstraint = Matter.Constraint.create({
                bodyA: planet,
                bodyB: atmosphere,
                stiffness: 1,
                render: { visible: false }
              });
              
              World.add(world, [planet, atmosphere, atmosphereConstraint]);
              bodies.push(planet);
              
              // Apply initial velocity for orbit - using improved orbital mechanics
              const speed = 0.008 * Math.sqrt(1 / distance);
              Body.setVelocity(planet, {
                x: -Math.sin(angle) * speed * distance,
                y: Math.cos(angle) * speed * distance
              });
              
              // Create orbit force using improved approach
              Events.on(window.matterEngine, 'beforeUpdate', () => {
                if (!planet.isStatic) {
                  const planetPos = planet.position;
                  const sunPos = sun.position;
                  const distanceVector = Vector.sub(sunPos, planetPos);
                  const distanceMag = Vector.magnitude(distanceVector);
                  
                  if (distanceMag > 0) {
                    // Use inverse square law for gravity
                    const gravitationalForce = 0.0006 * (sun.mass * planet.mass) / (distanceMag * distanceMag);
                    const forceVector = Vector.mult(Vector.normalise(distanceVector), gravitationalForce);
                    
                    Body.applyForce(planet, planetPos, forceVector);
                    
                    // Add orbital correction to prevent decay
                    const velocity = planet.velocity;
                    const speed = Vector.magnitude(velocity);
                    
                    if (speed < 0.15 * Math.sqrt(1 / distanceMag)) {
                      // Boost if moving too slow
                      const perpendicular = {
                        x: -distanceVector.y / distanceMag,
                        y: distanceVector.x / distanceMag
                      };
                      
                      Body.applyForce(planet, planetPos, {
                        x: perpendicular.x * 0.0002,
                        y: perpendicular.y * 0.0002
                      });
                    }
                  }
                }
              });
              
              // Add enhanced visual trail effect for planets
              const trailInterval = setInterval(() => {
                if (!planet.isStatic) {
                  const trailParticle = Bodies.circle(
                    planet.position.x,
                    planet.position.y,
                    planetRadius * 0.3,
                    {
                      isStatic: true,
                      collisionFilter: { group: -1 },
                      render: {
                        fillStyle: planetColor.fill + '30',
                        opacity: 0.3,
                        lineWidth: 0
                      }
                    }
                  );
                  
                  World.add(world, trailParticle);
                  
                  // Fade out and remove trail particle
                  let opacity = 0.3;
                  const fadeInterval = setInterval(() => {
                    opacity -= 0.03;
                    if (opacity <= 0) {
                      clearInterval(fadeInterval);
                      World.remove(world, trailParticle);
                    } else if (trailParticle.render) {
                      trailParticle.render.opacity = opacity;
                    }
                  }, 50);
                  
                  emittersRef.current.push(fadeInterval);
                }
              }, i < 3 ? 50 : 100); // More frequent trails for inner planets
              
              emittersRef.current.push(trailInterval);
              
              // Add moon for some planets
              if (i > 0 && i < 5 && Math.random() < 0.7) {
                const moonDistance = planetRadius * 2.5;
                const moonRadius = planetRadius * 0.3;
                const moonAngle = Math.random() * Math.PI * 2;
                
                const moon = Bodies.circle(
                  planet.position.x + Math.cos(moonAngle) * moonDistance,
                  planet.position.y + Math.sin(moonAngle) * moonDistance,
                  moonRadius,
                  {
                    restitution: 0.6,
                    friction: 0.005,
                    frictionAir: 0,
                    render: {
                      fillStyle: '#E0E0E0',
                      lineWidth: 0
                    }
                  }
                );
                
                World.add(world, moon);
                bodies.push(moon);
                
                // Apply initial velocity for moon orbit
                const moonSpeed = 0.01 * Math.sqrt(planet.mass / moonDistance);
                Body.setVelocity(moon, {
                  x: planet.velocity.x - Math.sin(moonAngle) * moonSpeed * moonDistance,
                  y: planet.velocity.y + Math.cos(moonAngle) * moonSpeed * moonDistance
                });
                
                // Create moon orbit force
                Events.on(window.matterEngine, 'beforeUpdate', () => {
                  if (!moon.isStatic && !planet.isStatic) {
                    const moonPos = moon.position;
                    const planetPos = planet.position;
                    const distanceVector = Vector.sub(planetPos, moonPos);
                    const distanceMag = Vector.magnitude(distanceVector);
                    
                    if (distanceMag > 0) {
                      // Use inverse square law for gravity
                      const gravitationalForce = 0.0003 * (planet.mass * moon.mass) / (distanceMag * distanceMag);
                      const forceVector = Vector.mult(Vector.normalise(distanceVector), gravitationalForce);
                      
                      Body.applyForce(moon, moonPos, forceVector);
                    }
                  }
                });
              }
            }
            break;
          }
          
          case 'chain': {
            // Create chain
            const linkLength = size * ((composite.options?.linkLength || 10) / 100);
            const linkWidth = linkLength * 0.4;
            
            let prevBody = null;
            
            for (let i = 0; i < elements; i++) {
              const link = Bodies.rectangle(
                x,
                y + i * linkLength,
                linkWidth,
                linkLength,
                {
                  density: 0.001,
                  frictionAir: 0.001,
                  render: {
                    fillStyle: i % 2 === 0 ? '#9C27B0' : '#7B1FA2'
                  }
                }
              );
              
              World.add(world, link);
              bodies.push(link);
              
              if (i === 0) {
                // Anchor the first link
                const constraint = Matter.Constraint.create({
                  pointA: { x: x, y: y },
                  bodyB: link,
                  pointB: { x: 0, y: -linkLength/2 },
                  stiffness: 0.8,
                  render: {
                    strokeStyle: '#FFFFFF',
                    lineWidth: 2
                  }
                });
                World.add(world, constraint);
              } else if (prevBody) {
                // Connect to previous link
                const constraint = Matter.Constraint.create({
                  bodyA: prevBody,
                  bodyB: link,
                  pointA: { x: 0, y: linkLength/2 },
                  pointB: { x: 0, y: -linkLength/2 },
                  stiffness: 0.8,
                  render: {
                    strokeStyle: '#FFFFFF',
                    lineWidth: 2
                  }
                });
                World.add(world, constraint);
              }
              
              prevBody = link;
            }
            break;
          }
        }
      });
    }
    
    // Add particle emitters
    if (simulation.behaviors?.particleEmitters && Array.isArray(simulation.behaviors.particleEmitters)) {
      simulation.behaviors.particleEmitters.forEach(emitter => {
        const emitterX = (emitter.x / 100) * container.clientWidth;
        const emitterY = (emitter.y / 100) * container.clientHeight;
        const emitterRate = emitter.rate || 0.5; // particles per second
        const particleSize = emitter.particleSize || 5;
        const particleColor = emitter.particleColor || '#9C27B0';
        const direction = (emitter.direction || 270) * Math.PI / 180; // convert to radians
        const spread = (emitter.spread || 30) * Math.PI / 180; // convert to radians
        const particleForce = emitter.force || 0.005;
        
        // Visual indicator for emitter
        const indicator = Bodies.circle(emitterX, emitterY, 8, {
          isStatic: true,
          isSensor: true,
          render: {
            fillStyle: particleColor
          }
        });
        World.add(world, indicator);
        
        // Set up interval for emitting particles
        const interval = setInterval(() => {
          // Create a particle
          const angle = direction + (Math.random() * spread * 2 - spread);
          const particle = Bodies.circle(emitterX, emitterY, particleSize, {
            density: 0.0005,
            frictionAir: 0.02,
            restitution: 0.8,
            friction: 0.1,
            render: {
              fillStyle: particleColor
            },
            collisionFilter: {
              group: -1 // negative group means it can collide with itself
            }
          });
          
          // Apply force in the direction
          const forceVector = {
            x: Math.cos(angle) * particleForce,
            y: Math.sin(angle) * particleForce
          };
          
          Body.applyForce(particle, particle.position, forceVector);
          
          // Add to world
          World.add(world, particle);
          
          // Remove after some time to prevent memory issues
          setTimeout(() => {
            World.remove(world, particle);
          }, 5000);
        }, 1000 / emitterRate);
        
        emittersRef.current.push(interval);
      });
    }
    
    // Apply collision behavior
    if (simulation.behaviors?.collisions) {
      const collisionType = simulation.behaviors.collisions;
      
      if (collisionType === 'sticky') {
        // Make objects stick together on collision
        Events.on(window.matterEngine, 'collisionStart', (event) => {
          const pairs = event.pairs;
          
          for (let i = 0; i < pairs.length; i++) {
            const pair = pairs[i];
            
            // Skip if either body is static
            if (pair.bodyA.isStatic || pair.bodyB.isStatic) continue;
            
            // Create constraint between bodies
            const constraint = Matter.Constraint.create({
              bodyA: pair.bodyA,
              bodyB: pair.bodyB,
              pointA: { x: 0, y: 0 },
              pointB: { x: 0, y: 0 },
              stiffness: 0.5
            });
            
            World.add(world, constraint);
          }
        });
      } else if (collisionType === 'inelastic') {
        // Reduce restitution on collision
        bodies.forEach(body => {
          body.restitution = 0.2;
        });
      } else if (collisionType === 'elastic') {
        // Increase restitution for elastic collisions
        bodies.forEach(body => {
          body.restitution = 0.9;
        });
      }
    }
    
    // Handle window resize
    const handleResize = () => {
      window.matterRender.options.width = container.clientWidth;
      window.matterRender.options.height = container.clientHeight;
      window.matterRender.options.pixelRatio = window.devicePixelRatio;
      Render.setPixelRatio(window.matterRender, window.devicePixelRatio);
      Render.lookAt(window.matterRender, {
        min: { x: 0, y: 0 },
        max: { x: container.clientWidth, y: container.clientHeight }
      });
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      
      // Clear all emitter intervals
      emittersRef.current.forEach(interval => clearInterval(interval));
      emittersRef.current = [];
      
      try {
        if (window.matterEngine) Matter.Engine.clear(window.matterEngine);
        if (window.matterRender) Matter.Render.stop(window.matterRender);
        if (window.matterRunner) Matter.Runner.stop(window.matterRunner);
      } catch (e) {
        console.log('Cleanup error:', e);
      }
    };
  }, [simulationJson]);

  return (
    <div ref={containerRef} className="w-full h-full bg-purple-900/20 rounded-lg overflow-hidden relative">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};
