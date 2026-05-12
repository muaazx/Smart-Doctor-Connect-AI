import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Heart, Shield, Clock, ArrowRight, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/doctors?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 lg:py-40 overflow-hidden bg-background">
        {/* Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-[120px] animate-pulse-slow"></div>
          <div className="absolute bottom-[10%] right-[-10%] w-[30%] h-[30%] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[100px] animate-pulse-slow"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-12"
            >
              <div className="inline-flex items-center gap-3 glass px-4 py-2 rounded-full text-[10px] font-black tracking-[0.2em] uppercase text-blue-600 dark:text-blue-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                Healthcare Evolution V1.0
              </div>
              
              <h1 className="text-6xl lg:text-8xl font-black text-slate-900 dark:text-white leading-[0.95] tracking-tighter">
                Healthcare <br/>
                <span className="text-gradient">Unified.</span>
              </h1>
              
              <p className="text-lg text-slate-500 dark:text-slate-400 max-w-lg leading-relaxed font-medium">
                The next generation of medical connectivity. Find verified specialists, book instant visits, and experience AI-assisted care.
              </p>

              <motion.form 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                onSubmit={handleSearch} 
                className="flex flex-col sm:flex-row gap-2 p-2 glass rounded-2xl shadow-2xl shadow-blue-500/10 max-w-xl"
              >
                <div className="flex-1 relative flex items-center">
                  <Search className="absolute left-5 text-slate-400" size={20} />
                  <Input 
                    placeholder="Search symptoms, doctors, or city..." 
                    className="pl-14 h-14 border-none focus-visible:ring-0 text-slate-700 dark:text-slate-200 bg-transparent text-sm font-bold uppercase tracking-tight"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button type="submit" size="lg" className="h-14 px-10 rounded-xl font-black bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all uppercase tracking-widest text-[10px]">
                  Find Specialist
                </Button>
              </motion.form>

              <div className="flex items-center gap-6 pt-6">
                <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <motion.div 
                      key={i} 
                      whileHover={{ y: -5, scale: 1.1 }}
                      className="w-10 h-10 rounded-full border-2 border-background glass overflow-hidden shadow-lg"
                    >
                      <img src={`https://i.pravatar.cc/150?u=${i+20}`} alt="user" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </motion.div>
                  ))}
                </div>
                <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-[0.2em] uppercase">
                  Trusted by 2,000+ Verified Patients
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative hidden lg:block"
            >
              <div className="relative z-10 rounded-3xl overflow-hidden glass p-4">
                <img 
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1000&auto=format&fit=crop" 
                  alt="Medical Professional" 
                  className="w-full aspect-[4/5] object-cover rounded-2xl grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
                  referrerPolicy="no-referrer"
                />
              </div>
              
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-10 -left-10 glass p-8 rounded-3xl shadow-2xl z-20 max-w-[280px] space-y-4"
              >
                <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/40">
                  <Shield size={24} />
                </div>
                <div className="space-y-2">
                  <span className="block font-black text-slate-900 dark:text-white text-xs uppercase tracking-widest">Verified Auth</span>
                  <span className="block text-[11px] text-slate-500 dark:text-slate-400 font-bold leading-relaxed">Manual credential validation for every medical professional on the node.</span>
                </div>
              </motion.div>

              <div className="absolute -top-6 -right-6 w-32 h-32 bg-indigo-600/20 rounded-full blur-3xl"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 glass border-y border-slate-200 dark:border-slate-800 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-between gap-12 relative z-10">
           {[
             { label: 'Verified Doctors', value: '500+', icon: <Heart className="text-red-500" size={16} /> },
             { label: 'Active Sessions', value: '12k', icon: <Activity className="text-blue-500" size={16} /> },
             { label: 'Regional Hubs', value: '24', icon: <Search className="text-indigo-500" size={16} /> },
             { label: 'AI Diagnoses', value: '45k', icon: <Activity className="text-green-500" size={16} /> }
           ].map((stat, i) => (
             <motion.div 
               key={i} 
               whileHover={{ scale: 1.05 }}
               className="flex flex-col gap-1"
             >
               <div className="flex items-center gap-2">
                 {stat.icon}
                 <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{stat.value}</span>
               </div>
               <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{stat.label}</span>
             </motion.div>
           ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-16">
            {[
              { 
                title: "Expert Intelligence", 
                desc: "Advanced search algorithms to find the perfect specialist for your specific profile.", 
                icon: <Search size={24} />,
                color: "blue"
              },
              { 
                title: "Neural Triage", 
                desc: "Powered by Gemini AI to analyze symptoms and suggest optimal clinical paths.", 
                icon: <Activity size={24} />,
                color: "indigo"
              },
              { 
                title: "Instant Channels", 
                desc: "Zero-latency communication with medical staff through our integrated AI agent.", 
                icon: <Clock size={24} />,
                color: "purple"
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="space-y-8 group"
              >
                <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/5 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 text-blue-600">
                  {feature.icon}
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{feature.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm font-bold">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-900"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.1),transparent_70%)]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12 relative z-10">
          <h2 className="text-5xl lg:text-7xl font-black text-white tracking-tighter leading-[0.95]">
            Integrate your <br/>
            <span className="text-blue-500 italic">Medical Practice.</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto font-bold text-lg leading-relaxed">
            Join the most advanced network of healthcare professionals and start providing digital-first care today.
          </p>
          <div className="flex flex-wrap justify-center gap-6 pt-6">
            <Button size="lg" className="h-16 px-12 rounded-full font-black bg-blue-600 hover:bg-blue-700 shadow-2xl shadow-blue-500/20 uppercase tracking-widest text-[11px]">
              Deploy Node
            </Button>
            <Button size="lg" variant="outline" className="h-16 px-12 rounded-full font-black text-white hover:bg-white/10 border-slate-700 uppercase tracking-widest text-[11px]">
              Platform Overview
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
