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
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-10"
            >
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded text-xs font-bold tracking-widest uppercase border border-blue-100">
                <Activity size={14} />
                Healthcare Platform
              </div>
              <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.05] tracking-tight">
                Healthcare <br/>
                <span className="text-blue-600">Unified.</span>
              </h1>
              <p className="text-lg text-slate-500 max-w-lg leading-relaxed font-medium">
                Find verified specialists, book appointments instantly, and manage your health journey with AI-assisted care.
              </p>

              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-0 p-1 bg-white rounded-lg border border-slate-200 shadow-xl shadow-slate-200/40 max-w-xl transition-shadow focus-within:shadow-blue-200/40">
                <div className="flex-1 relative flex items-center">
                  <Search className="absolute left-4 text-slate-400" size={18} />
                  <Input 
                    placeholder="Search symptoms, doctors, or city..." 
                    className="pl-12 h-14 border-none focus-visible:ring-0 text-slate-700 bg-transparent text-sm font-medium"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button type="submit" size="lg" className="h-[52px] px-8 rounded-md font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all m-1">
                  Find Doctor
                </Button>
              </form>

              <div className="flex items-center gap-4 pt-4 border-t border-slate-100 max-w-sm">
                <div className="flex -space-x-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 overflow-hidden shadow-sm">
                      <img src={`https://i.pravatar.cc/150?u=${i+10}`} alt="user" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  ))}
                </div>
                <div className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
                  Trusted by 2,000+ Patients
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative hidden lg:block"
            >
              <div className="relative z-10 rounded-lg overflow-hidden border border-slate-200 shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1000&auto=format&fit=crop" 
                  alt="Medical Professional" 
                  className="w-full aspect-video object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              
              <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-lg shadow-2xl border border-slate-100 z-20 max-w-[240px] space-y-3">
                <div className="w-10 h-10 bg-green-50 text-green-600 rounded flex items-center justify-center border border-green-100">
                  <Shield size={20} />
                </div>
                <div className="space-y-1">
                  <span className="block font-bold text-slate-900 text-sm">Verified Credentials</span>
                  <span className="block text-xs text-slate-400 font-medium leading-relaxed">Every doctor is manually vetted for the highest quality care.</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-between gap-8">
           {[
             { label: 'Verified Doctors', value: '500+' },
             { label: 'Patients Served', value: '12k' },
             { label: 'Cities Covered', value: '24' },
             { label: 'AI Checkups', value: '45k' }
           ].map((stat, i) => (
             <div key={i} className="flex flex-col">
               <span className="text-2xl font-extrabold text-slate-900">{stat.value}</span>
               <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</span>
             </div>
           ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { 
                title: "Expert Search", 
                desc: "Navigate through specialized medical fields with our intuitive keyword matcher.", 
                icon: <Search className="text-blue-600" size={24} />,
              },
              { 
                title: "Smart Triage", 
                desc: "Describe your symptoms and let our AI suggest the most suitable clinical path.", 
                icon: <Activity className="text-blue-600" size={24} />,
              },
              { 
                title: "Direct Channels", 
                desc: "Seamlessly communicate with medical staff through our integrated messaging portal.", 
                icon: <Clock className="text-blue-600" size={24} />,
              }
            ].map((feature, i) => (
              <div 
                key={i}
                className="space-y-6"
              >
                <div className={`w-12 h-12 bg-slate-900 rounded flex items-center justify-center shadow-lg shadow-slate-900/10`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10">
          <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight">Ready to integrate your practice?</h2>
          <p className="text-slate-400 max-w-2xl mx-auto font-medium">Join our network of healthcare professionals and start providing digital-first care today.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="h-14 px-10 rounded-md font-bold bg-blue-600 hover:bg-blue-700">
              Get Started
            </Button>
            <Button size="lg" variant="ghost" className="h-14 px-10 rounded-md font-bold text-white hover:bg-white/10 border border-slate-800">
              Learn More
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
