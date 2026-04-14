import { Shield, Zap, Lock, Bell, ArrowRight, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { subscribeToGlobalStats, testConnection } from '../firebase/firestore';

export default function LandingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [globalStats, setGlobalStats] = useState({ threatsBlocked: 0 });

  useEffect(() => {
    testConnection();
    const unsubscribe = subscribeToGlobalStats(setGlobalStats);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: any[] = [];
    const particleCount = 100;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    class Particle {
      x: number; y: number; vx: number; vy: number; size: number;
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }
      draw() {
        if (!ctx) return;
        ctx.fillStyle = 'rgba(0, 245, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) particles.push(new Particle());

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      requestAnimationFrame(animate);
    };
    animate();

    return () => window.removeEventListener('resize', resize);
  }, []);

  const features = [
    { title: 'Real-Time Detection', desc: 'Instant scanning of URLs and files for malicious patterns.', icon: Zap },
    { title: 'User Awareness', desc: 'Educating users on the latest phishing and social engineering tactics.', icon: Shield },
    { title: 'Smart Alerts', desc: 'Critical notifications sent directly to your dashboard and device.', icon: Bell },
    { title: 'Secure Auth', desc: 'Multi-factor authentication to keep your profile locked down.', icon: Lock },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />
      
      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan text-sm font-bold mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-cyan opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-cyan"></span>
            </span>
            LIVE THREAT MONITORING ACTIVE
          </div>
          
          <h1 className="text-5xl md:text-7xl font-display font-extrabold tracking-tighter mb-6 leading-tight">
            DETECT. PROTECT. <br />
            <span className="text-accent-cyan">PREVENT.</span>
          </h1>
          
          <p className="text-xl text-text-muted max-w-2xl mx-auto mb-10">
            The world's most advanced real-time fraud detection platform. 
            Stay ahead of cyber criminals with SecureX.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/auth"
              className="w-full sm:w-auto px-8 py-4 bg-accent-cyan text-bg-primary font-bold rounded-xl hover:glow-cyan transition-all flex items-center justify-center gap-2 group"
            >
              Start Scanning Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <div className="text-text-muted font-medium flex items-center gap-2">
              <span className="text-accent-green font-bold">{globalStats.threatsBlocked.toLocaleString()}</span> Threats Blocked Today
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="glass-card p-8 hover:border-accent-cyan/50 transition-colors group"
            >
              <f.icon className="w-12 h-12 text-accent-cyan mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold mb-3">{f.title}</h3>
              <p className="text-text-muted leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="gradient-border p-12 rounded-3xl text-center overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
              Ready to secure your digital life?
            </h2>
            <p className="text-text-muted mb-10 max-w-xl mx-auto">
              Join thousands of users who trust SecureX for real-time protection against online fraud.
            </p>
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-bg-primary font-bold rounded-xl hover:bg-opacity-90 transition-all"
            >
              Create Free Account
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-accent-cyan/20 blur-3xl rounded-full" />
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-accent-red/20 blur-3xl rounded-full" />
        </div>
      </section>
    </div>
  );
}
