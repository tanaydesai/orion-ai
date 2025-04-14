import Image from 'next/image';
import Link from 'next/link';

export const Navbar = () => <nav className="flex items-center justify-between p-4 md:p-6"><div className="flex items-center gap-2"><Link href="/"><Image src="/orion-logo.svg" alt="OrionAI Logo" width={32} height={32} /></Link><Link href="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-purple-600">OrionAI</Link></div><div className="flex items-center gap-4"><Link href="/" className="hover:text-purple-400 transition-colors">Home</Link><Link href="/create" className="hover:text-purple-400 transition-colors">Create</Link></div></nav>;
