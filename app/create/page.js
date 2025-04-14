'use client';

import { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { SimulationForm } from '../components/SimulationForm';
import { SimulationCanvas } from '../components/SimulationCanvas';
import Script from 'next/script';

export default function Create() {
  const [isLoading, setIsLoading] = useState(false);
  const [simulationJson, setSimulationJson] = useState(null);
  const [error, setError] = useState('');

  const handleGenerate = async (prompt) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate simulation');
      }
      
      setSimulationJson(data.simulationJson);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js" strategy="beforeInteractive" />
      <Navbar />
      
      <main className="flex-1 flex flex-col items-center p-6">
        <div className="max-w-6xl w-full">
          <h1 className="text-4xl font-bold text-center mb-6">Create Your Simulation</h1>
          <p className="text-center text-gray-300 mb-10">Describe any physics simulation you want to create and our AI will generate it for you.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col">
              <h2 className="text-xl font-bold mb-4">Tell AI What to Create</h2>
              <p className="text-sm text-gray-300 mb-4">Describe any physics simulation in detail - from nuclear reactions to springs, fluid dynamics to gravity fields.</p>
              <SimulationForm onGenerate={handleGenerate} isLoading={isLoading} />
              <p className="text-xs text-gray-400 mt-4">Using OpenAI API to generate custom physics simulations.</p>
            </div>
            
            <div className="flex flex-col">
              <h2 className="text-xl font-bold mb-4">Your Simulation</h2>
              <p className="text-sm text-gray-300 mb-4">Generated simulation will appear here</p>
              <div className="w-full aspect-video bg-slate-900/30 rounded-lg overflow-hidden">
                {error ? (
                  <div className="w-full h-full flex items-center justify-center p-4">
                    <p className="text-red-400 text-center">{error}</p>
                  </div>
                ) : (
                  <SimulationCanvas simulationJson={simulationJson} />
                )}
              </div>
              <p className="text-sm text-gray-300 mt-4">
                Enter a prompt like "nuclear chain reaction" or "galaxy formation with dark matter" and click "Generate Simulation"
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
