import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, handleFirestoreError, OperationType, auth } from '@/lib/firebase';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { MapPin, Star, Clock, Calendar, Shield, MessageSquare, Send, Bot, CheckCircle2, ArrowRight, Activity, X } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { chatWithDoctorAI } from '@/lib/gemini';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export default function DoctorProfile() {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [consultationMethod, setConsultationMethod] = useState<string>('Online');
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);

  useEffect(() => {
    const fetchDoctor = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'doctors', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setDoctor({ ...data, id: docSnap.id });
          if (data.consultationType && Array.isArray(data.consultationType)) {
             setConsultationMethod(data.consultationType[0]);
          } else if (typeof data.consultationType === 'string') {
             setConsultationMethod(data.consultationType.split(',')[0].trim());
          }
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `doctor/${id}`);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  const handleBooking = async () => {
    if (!user) {
      toast.error("Authentication required for request finalization");
      navigate('/auth');
      return;
    }
    if (!selectedSlot) {
      toast.error("Sequence error: No time slot selected");
      return;
    }

    try {
      await addDoc(collection(db, 'appointments'), {
        doctorId: doctor.id,
        patientId: user.uid,
        doctorName: doctor.name,
        patientName: profile?.name || user.displayName || 'Patient',
        specialization: doctor.specialization,
        timeSlot: selectedSlot,
        date: new Date().toISOString().split('T')[0],
        status: 'pending',
        type: consultationMethod,
        createdAt: serverTimestamp()
      });
      toast.success("Request logged in central hub");
      navigate('/dashboard/patient');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'appointments');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !doctor) return;

    const userMessage = { text: input, isAI: false, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsAiThinking(true);

    try {
      let responseText = await chatWithDoctorAI(doctor.name, doctor.specialization, input, messages);
      
      const collectMarker = "___COLLECTED_DATA___";
      if (responseText && responseText.includes(collectMarker)) {
        const parts = responseText.split(collectMarker);
        responseText = parts[0].trim();
        
        try {
          const jsonStr = parts[1].trim();
          const data = JSON.parse(jsonStr);
          
          await addDoc(collection(db, 'inquiries'), {
            doctorId: doctor.id,
            doctorName: doctor.name,
            patientName: data.name,
            contact: data.contact,
            problem: data.problem,
            createdAt: serverTimestamp(),
            status: 'pending_doctor_review'
          });
          
          toast.success(`Priority Email Notification dispatched to ${doctor.name}.`);
          toast.info("Follow-up sequence activated. Automated reminder scheduled.");
        } catch(e) {
          console.error("Failed to parse collected data", e);
        }
      }

      const aiMessage = { text: responseText, isAI: true, timestamp: new Date() };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      toast.error("Network link failure. Retrying...");
    } finally {
      setIsAiThinking(false);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-background"><Activity className="animate-spin text-blue-600" /></div>;
  if (!doctor) return <div className="max-w-7xl mx-auto px-8 py-20 text-center uppercase tracking-widest font-black text-slate-300 dark:text-slate-700">404: Node Not Found</div>;

  return (
    <div className="flex-1 bg-background min-h-screen">
       <header className="h-20 glass px-8 flex items-center justify-between sticky top-0 z-10 transition-all">
        <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
          <span className="hover:text-blue-600 cursor-pointer transition-colors">Registry</span>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <span className="hover:text-blue-600 cursor-pointer transition-colors">Specialists</span>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <span className="text-slate-900 dark:text-white">{doctor.name}</span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 py-12 relative">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-12 rounded-3xl flex flex-col md:flex-row gap-12 items-start shadow-2xl relative overflow-hidden group border border-white/10"
            >
              <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/5 rounded-full -mr-40 -mt-40 blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
              
              <div className="w-64 h-64 rounded-2xl border border-slate-200 dark:border-white/10 flex-shrink-0 shadow-2xl overflow-hidden relative z-10 group-hover:scale-[1.02] transition-transform duration-500">
                <img 
                  src={doctor.profilePicUrl || `https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=400&auto=format&fit=crop`} 
                  alt={doctor.name} 
                  className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
                  referrerPolicy="no-referrer"
                />
              </div>
              
              <div className="flex-1 space-y-8 relative z-10">
                <div className="space-y-3">
                   <div className="inline-flex items-center gap-3 px-3 py-1 rounded-full bg-blue-600/10 text-blue-600 text-[9px] font-black uppercase tracking-[0.2em]">
                     <CheckCircle2 size={12} />
                     Verified Network Node
                   </div>
                   <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-[0.9]">{doctor.name}</h1>
                </div>
                
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-black text-xs uppercase tracking-widest">
                   <Activity size={18} className="text-blue-600" />
                   <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">{doctor.specialization}</span>
                </div>
                
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-xl font-bold">{doctor.bio || "Leading specialist with a passion for patient-centric care. Dedicated to providing the best medical assistance across the digital network."}</p>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 pt-8 border-t border-slate-100 dark:border-white/5">
                   <div className="space-y-2">
                     <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] font-black">Active Tenure</span>
                     <p className="font-black text-slate-900 dark:text-white text-sm tracking-tighter">{doctor.experience || '0'}Y EXPERTISE</p>
                   </div>
                   <div className="space-y-2">
                     <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] font-black">Network Rating</span>
                     <div className="flex items-center gap-1.5 font-black text-slate-900 dark:text-white text-sm">
                       <Star size={14} className="fill-blue-600 text-blue-600" />
                       {doctor.rating || 'ALPHA'}
                     </div>
                   </div>
                   <div className="space-y-2">
                     <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] font-black">Interface</span>
                     <p className="font-black text-slate-900 dark:text-white text-[10px] uppercase tracking-tighter">{Array.isArray(doctor.consultationType) ? doctor.consultationType.join(', ') : (doctor.consultationType || 'DIRECT')}</p>
                   </div>
                   <div className="space-y-2">
                     <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] font-black">Status</span>
                     <div className="flex items-center gap-2">
                       <div className={`w-2 h-2 rounded-full ${doctor.available ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}></div>
                       <span className={`text-[10px] font-black uppercase tracking-widest ${doctor.available ? 'text-green-600' : 'text-slate-400'}`}>
                         {doctor.available ? 'Active' : 'Offline'}
                       </span>
                     </div>
                   </div>
                </div>
              </div>
            </motion.div>

            <Tabs defaultValue="about" className="space-y-8">
              <TabsList className="bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 h-auto w-fit">
                <TabsTrigger value="about" className="rounded-xl px-10 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-blue-600 data-[state=active]:shadow-xl transition-all font-black text-[10px] uppercase tracking-[0.2em]">Matrix Specs</TabsTrigger>
                <TabsTrigger value="reviews" className="rounded-xl px-10 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-blue-600 data-[state=active]:shadow-xl transition-all font-black text-[10px] uppercase tracking-[0.2em]">Logs & Feedback</TabsTrigger>
              </TabsList>
              
              <TabsContent value="about">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass rounded-3xl p-12 border border-white/10 shadow-2xl space-y-12"
                >
                  <div className="space-y-6">
                    <h3 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[0.3em] flex items-center gap-3">
                      <MapPin size={16} className="text-blue-600" />
                      Deployment Coordinates
                    </h3>
                    <div className="aspect-[21/9] w-full rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center text-slate-300 group overflow-hidden relative">
                       <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                          <Button size="lg" className="rounded-full bg-slate-900 dark:bg-white dark:text-black font-black uppercase tracking-[0.2em] text-[9px] shadow-2xl h-12 px-8">
                            Initialize Visualizer
                          </Button>
                       </div>
                       <MapPin size={64} className="mb-3 text-slate-200 dark:text-slate-800" />
                       <span className="font-black text-sm uppercase tracking-[0.3em] text-slate-400 dark:text-slate-600">{doctor.location} Registry</span>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-12 pt-8 border-t border-slate-100 dark:border-white/5">
                     <div className="space-y-6">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">Cognitive Matrix</h4>
                        <ul className="space-y-4">
                           {['MBBS, Senior Consultant', 'Expert Board Verification', 'Neural Analysis Certification'].map((item, i) => (
                             <li key={i} className="flex gap-4 items-center group">
                                <div className="w-2 h-2 rounded-full bg-blue-600 group-hover:scale-150 transition-transform"></div>
                                <span className="text-[13px] font-bold text-slate-500 dark:text-slate-400">{item}</span>
                             </li>
                           ))}
                        </ul>
                     </div>
                     <div className="space-y-6">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">Core Competencies</h4>
                        <div className="flex flex-wrap gap-3">
                           {['Neuro-Triage', 'Clinical Ops', 'Pathogen Analysis', 'Health Logic'].map(tag => (
                             <span key={tag} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 px-4 py-2 rounded-xl text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest hover:border-blue-600 transition-all cursor-default">
                               {tag}
                             </span>
                           ))}
                        </div>
                     </div>
                  </div>
                </motion.div>
              </TabsContent>
              
              <TabsContent value="reviews">
                <div className="text-center py-32 glass rounded-3xl border border-white/10">
                  <Activity size={48} className="mx-auto text-slate-200 dark:text-slate-800 mb-6 opacity-50" />
                  <p className="text-slate-400 dark:text-slate-600 text-[11px] font-black uppercase tracking-[0.4em] italic px-10">
                    Neural Feedback Cache is Empty for this Node
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="sticky top-24 glass rounded-3xl overflow-hidden shadow-2xl border border-white/10"
            >
               <div className="bg-slate-950 p-10 text-white relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-3xl -mr-16 -mt-16"></div>
                 <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 mb-4">Scheduling Engine</h3>
                 <h2 className="text-4xl font-black tracking-tighter uppercase leading-none">Register <br/> Session</h2>
               </div>
               
               <CardContent className="p-10 space-y-12">
                 <div className="space-y-8">
                   <div className="space-y-4">
                     <span className="font-black text-[10px] text-slate-900 dark:text-white uppercase tracking-[0.2em]">Interface Mode</span>
                     <div className="flex gap-3">
                       {(Array.isArray(doctor.consultationType) ? doctor.consultationType : typeof doctor.consultationType === 'string' ? doctor.consultationType.split(',') : ['Online', 'Physical']).map((type: string) => (
                         <Button 
                           key={type.trim()}
                           variant={consultationMethod.toLowerCase() === type.trim().toLowerCase() ? "default" : "outline"}
                           className={`flex-1 rounded-2xl h-14 font-black text-[10px] uppercase tracking-[0.2em] transition-all ${
                             consultationMethod.toLowerCase() === type.trim().toLowerCase() ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/30' : 'border-slate-200 dark:border-white/5 text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'
                           }`}
                           onClick={() => setConsultationMethod(type.trim())}
                         >
                           {type.trim()}
                         </Button>
                       ))}
                     </div>
                   </div>

                   <div className="space-y-4">
                     <div className="flex items-center justify-between">
                       <span className="font-black text-[10px] text-slate-900 dark:text-white uppercase tracking-[0.2em]">Sequence Slots</span>
                       <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{doctor.availableSlots?.length || 4} ACTIVE</span>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                       {(doctor.availableSlots || ['10:00 AM', '11:30 AM', '02:00 PM', '04:30 PM']).map((slot: string) => (
                         <Button 
                           key={slot}
                           variant={selectedSlot === slot ? "default" : "outline"}
                           className={`rounded-2xl h-16 font-black text-[10px] uppercase tracking-[0.2em] transition-all ${
                             selectedSlot === slot ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/30' : 'border-slate-200 dark:border-white/5 text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'
                           }`}
                           onClick={() => setSelectedSlot(slot)}
                         >
                           {slot}
                         </Button>
                       ))}
                     </div>
                   </div>
                 </div>

                 <div className="bg-blue-600/5 dark:bg-blue-600/10 rounded-2xl p-6 space-y-4 border border-blue-600/10">
                     <div className="flex items-center gap-3 text-blue-600 font-black text-[10px] uppercase tracking-[0.3em]">
                       <Bot size={16} />
                       <span>Predictive Matrix</span>
                     </div>
                     <p className="text-xs font-bold text-slate-600 dark:text-slate-400 leading-relaxed uppercase tracking-tight">
                        Node latency predicts optimal slot at <span className="text-slate-900 dark:text-white">{doctor.availableSlots?.[0] || '10:00 AM'}</span> with a wait index of <span className="text-slate-900 dark:text-white">MINIMAL</span>.
                     </p>
                  </div>

                 <Button 
                    className="w-full h-18 rounded-2xl bg-slate-950 dark:bg-white dark:text-black text-white font-black uppercase tracking-[0.2em] text-[11px] group hover:bg-blue-600 dark:hover:bg-blue-400 transition-all shadow-2xl active:scale-[0.98]" 
                    size="lg" 
                    onClick={handleBooking}
                  >
                    Initiate Final Sync
                    <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform" size={18} />
                  </Button>
               </CardContent>
            </motion.div>
          </div>
        </div>
      </div>

      {/* AI Chat Widget */}
      <div className="fixed bottom-12 right-12 z-[100]">
        <AnimatePresence>
          {chatOpen ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className="glass w-[450px] max-w-[95vw] h-[650px] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-white/20"
            >
              <div className="bg-slate-950 p-8 text-white flex justify-between items-center shrink-0 border-b border-white/5">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/40 relative">
                    <Bot size={28} />
                    <span className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-950 animate-pulse"></span>
                  </div>
                  <div>
                    <h4 className="font-black text-[11px] uppercase tracking-[0.3em]">AI INTERFACE</h4>
                    <p className="text-[10px] text-slate-500 font-bold tracking-widest mt-1">SYNCHRONIZING WITH {doctor.name.toUpperCase()}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setChatOpen(false)} className="rounded-full hover:bg-white/5 text-slate-500">
                  <X size={24} />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-transparent custom-scrollbar">
                {messages.length === 0 && (
                  <div className="text-center space-y-6 py-20 opacity-40">
                     <Bot className="mx-auto text-slate-300 dark:text-slate-700" size={64} />
                     <p className="text-slate-400 dark:text-slate-600 text-[10px] leading-relaxed font-black uppercase tracking-[0.4em] px-12">
                        "INTERFACE INITIALIZED. SECURE CHANNEL ESTABLISHED. HOW MAY I ASSIST YOUR CLINICAL INQUIRY?"
                     </p>
                  </div>
                )}
                {messages.map((m, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: m.isAI ? -10 : 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={i} 
                    className={`flex ${m.isAI ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`max-w-[85%] rounded-2xl p-5 text-[13px] font-bold leading-relaxed shadow-xl ${
                      m.isAI ? 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-white/5' : 'bg-blue-600 text-white'
                    }`}>
                      {m.text}
                    </div>
                  </motion.div>
                ))}
                {isAiThinking && (
                  <div className="flex justify-start">
                    <div className="glass px-6 py-3 rounded-full shadow-2xl flex gap-1.5 items-center">
                       <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></span>
                       <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                       <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleSendMessage} className="p-6 glass border-t border-white/10 flex gap-4 shrink-0 bg-white/5">
                <Input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Inquiry data input..."
                  className="rounded-2xl border-none bg-slate-100 dark:bg-slate-950 h-16 font-bold text-xs px-6 focus:ring-2 focus:ring-blue-600/20"
                />
                <Button type="submit" size="icon" className="bg-blue-600 w-16 h-16 shrink-0 rounded-2xl hover:bg-blue-700 shadow-2xl shadow-blue-500/30 transition-all active:scale-[0.9]">
                  <Send size={24} />
                </Button>
              </form>
            </motion.div>
          ) : (
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setChatOpen(true)}
              className="bg-slate-950 dark:bg-white text-white dark:text-black w-24 h-24 rounded-3xl flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative group overflow-hidden border border-white/10"
            >
              <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <MessageSquare size={36} className="relative z-10 group-hover:rotate-12 transition-transform" />
              <span className="absolute top-4 right-4 w-4 h-4 bg-blue-500 border-4 border-slate-950 dark:border-white rounded-full animate-pulse shadow-2xl shadow-blue-500/50"></span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
