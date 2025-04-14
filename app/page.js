import Image from "next/image";
import Link from "next/link";
import { Navbar } from "./components/Navbar";
import { FeaturesSection } from "./components/FeaturesSection";
import { GallerySection } from "./components/GallerySection";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex flex-col">
        <div className="flex flex-col items-center justify-center p-6 relative">
          <div className="max-w-4xl w-full text-center flex flex-col items-center gap-6">
            <h1 className="text-4xl md:text-6xl font-bold">
              <span className="text-white">Physics Visualizations</span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-purple-600">Powered by AI</span>
            </h1>
            
            <p className="text-lg text-gray-300 max-w-2xl">
              Generate interactive physics simulations with AI. From Newton's cradle to orbital
              mechanics - all with just a text prompt.
            </p>
            
            <div className="flex gap-4 mt-4">
              <Link href="/create" className="bg-purple-600 hover:bg-purple-700 transition-colors text-white px-6 py-3 rounded-lg flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Create Simulation
              </Link>
              
              <Link href="/gallery" className="border border-purple-500 hover:bg-purple-500/20 transition-colors text-white px-6 py-3 rounded-lg">
                Explore Gallery
              </Link>
            </div>
            
            <div className="w-full aspect-video mt-8 bg-purple-900/20 rounded-lg relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-lg text-white/70">Featured Simulation Loading...</p>
              </div>
            </div>
          </div>
        </div>
        
        <FeaturesSection />
        
        <GallerySection />
        
        <div className="absolute bottom-2 left-2 text-xs text-gray-500">
          <a href="https://orionai.app.vercel.app/create" className="hover:text-purple-400 transition-colors">
            https://orionai.app.vercel.app/create
          </a>
        </div>
      </main>
    </div>
  );
}
