import React, { useEffect, useRef } from 'react';
import { Cpu, Zap, ShoppingBag, Shield, Terminal, ArrowRight, Play, Star, GitBranch } from 'lucide-react';

export default function LandingPage({ onEnterApp }) {
  const canvasRef = useRef(null);

  // Neural network particle network animation in landing page hero
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const particles = [];
    const particleCount = 70;

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = (Math.random() - 0.5) * 0.8;
        this.radius = Math.random() * 2 + 1;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#06B6D4';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#06B6D4';
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      // Draw lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(109, 40, 217, ${0.18 * (1 - dist / 120)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-cyber-dark overflow-hidden flex flex-col">
      {/* Dynamic Glowing Mesh Orbs */}
      <div className="glow-mesh bg-cyber-purple top-20 left-10" />
      <div className="glow-mesh bg-cyber-cyan bottom-20 right-10" />

      {/* Header */}
      <header className="sticky top-0 z-50 glass-card px-6 py-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyber-purple to-cyber-cyan flex items-center justify-center font-bold text-white shadow-lg shadow-cyber-purple/30">
            🧬
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-cyber-text to-cyber-cyan bg-clip-text text-transparent">
              SYNAPSE AI
            </span>
            <span className="block text-[10px] text-cyber-cyan tracking-widest font-mono uppercase">Agent Ecosystem</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
          <a href="#features" className="hover:text-cyber-cyan transition-colors">Features</a>
          <a href="#marketplace" className="hover:text-cyber-cyan transition-colors">Marketplace</a>
          <a href="#pricing" className="hover:text-cyber-cyan transition-colors">Pricing</a>
          <a href="#tech" className="hover:text-cyber-cyan transition-colors">Technology</a>
        </nav>

        <button 
          onClick={onEnterApp}
          className="relative group px-5 py-2.5 rounded-xl font-semibold overflow-hidden transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyber-purple to-cyber-cyan rounded-xl group-hover:scale-105 transition-transform duration-300" />
          <div className="relative flex items-center gap-2 text-white text-sm">
            Enter Dashboard <ArrowRight size={16} />
          </div>
        </button>
      </header>

      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col justify-center items-center px-6 py-20 text-center z-10 max-w-6xl mx-auto w-full">
        {/* Canvas background for network particles */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60 -z-10" />

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card border-cyber-cyan/30 text-cyber-cyan text-xs font-mono mb-8 uppercase tracking-wider animate-pulse">
          <Zap size={12} /> The Decentralized Agentic Economy is Here
        </div>

        <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-none max-w-5xl">
          Create. Train. Deploy.<br />
          <span className="bg-gradient-to-r from-cyber-cyan via-[#8B5CF6] to-cyber-purple bg-clip-text text-transparent">
            Monetize AI Agents.
          </span>
        </h1>

        <p className="text-white/60 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
          The zero-code agent builder, visual graph workflow system, and collaborative marketplace built for the enterprise. Powered by Gemini.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button 
            onClick={onEnterApp}
            className="px-8 py-4 bg-gradient-to-r from-cyber-purple to-cyber-cyan rounded-xl font-bold text-white shadow-lg shadow-cyber-purple/40 hover:shadow-cyber-cyan/30 hover:scale-105 transition-all duration-300 flex items-center gap-3 w-full sm:w-auto"
          >
            Launch Builder Node <ArrowRight size={20} />
          </button>
          <a 
            href="#features"
            className="px-8 py-4 glass-card hover:bg-white/5 rounded-xl font-bold text-white transition-all duration-300 flex items-center gap-2 border-white/10 hover:border-white/20 w-full sm:w-auto justify-center"
          >
            <Play size={16} className="fill-white" /> Watch Ecosystem Demo
          </a>
        </div>

        {/* Feature Teasers */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full mt-28">
          <div className="glass-card p-6 rounded-2xl text-left border-white/15 relative overflow-hidden group hover:border-cyber-cyan/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-cyber-purple/20 flex items-center justify-center text-cyber-purple mb-4">
              <Cpu size={24} />
            </div>
            <h3 className="font-bold text-lg text-white mb-2">Visual Builder</h3>
            <p className="text-white/50 text-sm">Design agent goals, customize prompt logic, configure vector memories, and hook up custom API tools visually.</p>
          </div>

          <div className="glass-card p-6 rounded-2xl text-left border-white/15 relative overflow-hidden group hover:border-cyber-purple/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-cyber-cyan/20 flex items-center justify-center text-cyber-cyan mb-4">
              <ShoppingBag size={24} />
            </div>
            <h3 className="font-bold text-lg text-white mb-2">Agent Marketplace</h3>
            <p className="text-white/50 text-sm">Publish and lease out high-performing agents. Secure active micro-payouts via Stripe or Razorpay.</p>
          </div>

          <div className="glass-card p-6 rounded-2xl text-left border-white/15 relative overflow-hidden group hover:border-cyber-cyan/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
              <GitBranch size={24} />
            </div>
            <h3 className="font-bold text-lg text-white mb-2">Workflow Builder</h3>
            <p className="text-white/50 text-sm">Construct graph loops to execute complex automated steps—chaining agents with email nodes, CRM triggers, and webhooks.</p>
          </div>

          <div className="glass-card p-6 rounded-2xl text-left border-white/15 relative overflow-hidden group hover:border-cyber-purple/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <Shield size={24} />
            </div>
            <h3 className="font-bold text-lg text-white mb-2">Collaborative Reasoning</h3>
            <p className="text-white/50 text-sm">Create collaborative rooms where multiple agents divide complex objectives and communicate in real-time.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto px-8 py-6 border-t border-white/5 bg-[#070b16] text-center text-white/40 text-xs font-mono">
        © 2026 Synapse AI Inc. Microservice Ready, Enterprise Grade. Powered by Google Gemini.
      </footer>
    </div>
  );
}
