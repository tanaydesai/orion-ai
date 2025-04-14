import { useState } from 'react';

export const SimulationForm = ({ onGenerate, isLoading }) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      onGenerate(prompt);
    }
  };

  const examplePrompts = [
    "Create a Newton's cradle with 5 metal balls",
    "Simulate a pendulum swinging in gravity",
    "Show planets orbiting a sun in space",
    "Make a black hole sucking in nearby objects",
    "Simulate a solar system with multiple planets"
  ];

  return (
    <div className="w-full flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="w-full">
        <textarea 
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe any physics simulation you want to create..."
          className="w-full p-4 rounded-lg bg-slate-800/50 border border-purple-500/30 focus:border-purple-500 focus:outline-none h-32 resize-none text-white"
        />
        <button 
          type="submit" 
          disabled={isLoading || !prompt.trim()}
          className="mt-4 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 disabled:cursor-not-allowed transition-colors text-white px-6 py-3 rounded-lg w-full"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
          </svg>
          {isLoading ? 'Generating Simulation...' : 'Generate Simulation'}
        </button>
      </form>
      
      <div className="mt-4">
        <p className="text-sm text-gray-300 mb-2">Try these simulations:</p>
        <div className="flex flex-col gap-2">
          {examplePrompts.map((example, index) => (
            <button
              key={index}
              onClick={() => !isLoading && onGenerate(example)}
              disabled={isLoading}
              className="text-left text-sm bg-slate-800/30 hover:bg-slate-700/50 disabled:hover:bg-slate-800/30 disabled:opacity-50 disabled:cursor-not-allowed p-2 px-3 rounded-md text-white transition-colors"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
