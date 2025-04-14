import { Atom, Orbit, GitCompare, PanelLeftOpen } from "lucide-react";

const features = [
  {
    icon: <Atom className="h-12 w-12 text-purple-400" />,
    title: "Physics Engine",
    description: "Powered by Matter.js, our physics engine delivers realistic, interactive simulations with accurate physics principles."
  },
  {
    icon: <Orbit className="h-12 w-12 text-purple-400" />,
    title: "AI Generation",
    description: "Describe the physics scenario you want to visualize and our AI will generate the appropriate simulation."
  },
  {
    icon: <GitCompare className="h-12 w-12 text-purple-400" />,
    title: "Interactive Parameters",
    description: "Adjust parameters in real-time to see how they affect your simulations and explore the laws of physics."
  },
  {
    icon: <PanelLeftOpen className="h-12 w-12 text-purple-400" />,
    title: "Gallery & Sharing",
    description: "Browse our gallery of pre-made simulations or share your creations with the community."
  },
];

export const FeaturesSection = () => <section className="py-20 px-4 bg-gradient-to-b from-purple-900/10 to-purple-900/30"><div className="container mx-auto"><div className="text-center mb-16"><h2 className="text-3xl font-bold mb-4">Why Choose Orion AI</h2><p className="text-gray-300 max-w-2xl mx-auto">Our platform combines the power of AI with a robust physics engine to create beautiful, interactive visualizations.</p></div><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">{features.map((feature, index) => (<div key={index} className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-6 flex flex-col items-center text-center hover:bg-purple-900/30 transition-colors"><div className="mb-4">{feature.icon}</div><h3 className="text-xl font-semibold mb-2">{feature.title}</h3><p className="text-gray-300">{feature.description}</p></div>))}</div></div></section>;
