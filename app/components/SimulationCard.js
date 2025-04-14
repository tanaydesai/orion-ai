"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Copy, Heart, Share2 } from "lucide-react";
import { SimulationCanvas } from "./SimulationCanvas";

export const SimulationCard = ({ title, description, simulationJson, className = '' }) => <Card className={`overflow-hidden ${className}`}><CardHeader className="p-6"><CardTitle className="text-xl text-white">{title}</CardTitle><CardDescription className="text-gray-300">{description}</CardDescription></CardHeader><CardContent className="p-0"><div className="w-full h-[300px]"><SimulationCanvas simulationJson={simulationJson} /></div></CardContent><CardFooter className="flex justify-between p-4 bg-purple-900/30"><div className="flex gap-2"><Button variant="ghost" size="icon"><Heart className="h-4 w-4" /></Button><Button variant="ghost" size="icon"><Copy className="h-4 w-4" /></Button><Button variant="ghost" size="icon"><Share2 className="h-4 w-4" /></Button></div><Button variant="secondary" className="text-xs">View Details</Button></CardFooter></Card>;
