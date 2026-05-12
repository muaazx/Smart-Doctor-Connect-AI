import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, handleFirestoreError, OperationType, auth } from '@/lib/firebase';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { MapPin, Star, Clock, Calendar, Shield, MessageSquare, Send, Bot, CheckCircle2, ArrowRight } from 'lucide-react';
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
          setDoctor({ ...docSnap.data(), id: docSnap.id });
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
        type: doctor.consultationType === 'Both' ? 'Online' : doctor.consultationType,
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
      const response = await chatWithDoctorAI(doctor.name, doctor.specialization, input, messages);
      const aiMessage = { text: response, isAI: true, timestamp: new Date() };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      toast.error("Network link failure. Retrying...");
    } finally {
      setIsAiThinking(false);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-50"><Activity className="animate-spin text-blue-600" /></div>;
  if (!doctor) return <div className="max-w-7xl mx-auto px-8 py-20 text-center uppercase tracking-widest font-black text-slate-300">404: Node Not Found</div>;

  return (
    <div className="flex-1 bg-slate-50 min-h-screen">
       <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center space-x-2 text-slate-500 text-sm">
          <span className="hover:text-blue-600 cursor-pointer font-medium tracking-tight">Main Controller</span>
          <span className="text-slate-300">/</span>
          <span className="hover:text-blue-600 cursor-pointer font-medium tracking-tight">Provider Registry</span>
          <span className="text-slate-300">/</span>
          <span className="font-bold text-slate-900 uppercase tracking-widest text-[11px]">{doctor.name}</span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 py-10 relative">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-10">
            <div className="bg-white border border-slate-200 rounded-lg p-10 flex flex-col md:flex-row gap-10 items-start shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full -mr-32 -mt-32 scale-150 transition-all group-hover:scale-[1.7]"></div>
              <div className="w-56 h-56 rounded border border-slate-100 flex-shrink-0 shadow-lg overflow-hidden relative z-10">
                <img 
                  src={doctor.profilePicUrl || `https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=400&auto=format&fit=crop`} 
                  alt={doctor.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-1 space-y-6 relative z-10">
                <div className="space-y-1">
                   <div className="flex items-center gap-2">
                     <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Verified Specialist</span>
                     <CheckCircle2 size={12} className="text-blue-600" />
                   </div>
                   <h1 className="text-4xl font-bold text-slate-900 tracking-tight uppercase leading-none">{doctor.name}</h1>
                </div>
                
                <div className="flex items-center gap-2 text-slate-700 font-mono text-sm tracking-tighter">
                   <Activity size={16} className="text-blue-600" />
                   <span className="font-bold">{doctor.specialization}</span>
                </div>
                
                <p className="text-slate-500 text-sm leading-relaxed max-w-xl font-medium">{doctor.bio || "Leading specialist with a passion for patient-centric care. Dedicated to providing the best medical assistance across Pakistan."}</p>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 pt-6 border-t border-slate-100">
                   <div className="space-y-1">
                     <span className="text-[9px] text-slate-400 uppercase tracking-widest font-black">Platform Tenure</span>
                     <p className="font-bold text-slate-900 text-sm font-mono">{doctor.experience || '12'} Years</p>
                   </div>
                   <div className="space-y-1">
                     <span className="text-[9px] text-slate-400 uppercase tracking-widest font-black">Trust Index</span>
                     <div className="flex items-center gap-1 font-bold text-slate-900 text-sm">
                       <Star size={12} className="fill-blue-500 text-blue-500" />
                       {doctor.rating || '4.9'}
                     </div>
                   </div>
                   <div className="space-y-1">
                     <span className="text-[9px] text-slate-400 uppercase tracking-widest font-black">Sync Mode</span>
                     <p className="font-bold text-slate-900 text-sm uppercase tracking-tighter">{doctor.consultationType || 'Direct'}</p>
                   </div>
                   <div className="space-y-1">
                     <span className="text-[9px] text-slate-400 uppercase tracking-widest font-black">Node Status</span>
                     <Badge className="bg-green-100 text-green-700 border-none rounded text-[9px] font-bold uppercase tracking-widest px-2 h-5">Live</Badge>
                   </div>
                </div>
              </div>
            </div>

            <Tabs defaultValue="about" className="space-y-6">
              <TabsList className="bg-slate-100 p-1 rounded border border-slate-200 h-auto">
                <TabsTrigger value="about" className="rounded px-8 py-2.5 data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all font-bold text-[11px] uppercase tracking-widest">Specifications</TabsTrigger>
                <TabsTrigger value="reviews" className="rounded px-8 py-2.5 data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all font-bold text-[11px] uppercase tracking-widest">Network Feedback</TabsTrigger>
              </TabsList>
              <TabsContent value="about" className="bg-white rounded p-10 border border-slate-200 shadow-sm space-y-10">
                <div className="space-y-4">
                  <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                    <MapPin size={14} className="text-blue-600" />
                    Geographic Deployment
                  </h3>
                  <div className="aspect-[21/9] w-full rounded border border-slate-100 bg-slate-50 flex flex-col items-center justify-center text-slate-300 group overflow-hidden relative">
                     <div className="absolute inset-0 bg-slate-900/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white bg-slate-900 px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest shadow-xl">Launch Visual Hub</span>
                     </div>
                     <MapPin size={48} className="mb-2" />
                     <span className="font-black text-xs uppercase tracking-widest text-slate-400">{doctor.location}</span>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-10">
                   <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900">Education Matrix</h4>
                      <ul className="space-y-3 text-sm font-medium text-slate-500">
                         <li className="flex gap-3">
                            <span className="w-1 h-1 bg-blue-600 rounded-full mt-2 shrink-0"></span>
                            MBBS, Master of Surgery - FJMC
                         </li>
                         <li className="flex gap-3">
                            <span className="w-1 h-1 bg-blue-600 rounded-full mt-2 shrink-0"></span>
                            FCPS, Specialist Board Certification
                         </li>
                      </ul>
                   </div>
                   <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900">Key Competencies</h4>
                      <div className="flex flex-wrap gap-2">
                         {['Complex Diagnosis', 'Pediatric Care', 'Surgical Precision', 'Node Health'].map(tag => (
                           <span key={tag} className="bg-slate-50 border border-slate-200 px-3 py-1 rounded text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                             {tag}
                           </span>
                         ))}
                      </div>
                   </div>
                </div>
              </TabsContent>
              <TabsContent value="reviews">
                <div className="text-center py-24 text-slate-300 font-black italic uppercase tracking-tighter text-sm bg-white rounded border border-slate-200">
                  Zero sequence logs detected on this node context.
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 rounded border-slate-200 shadow-xl overflow-hidden">
               <div className="bg-slate-900 p-8 text-white">
                 <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-500 mb-2">Resource Allocation</h3>
                 <h2 className="text-2xl font-bold tracking-tight">Sync Appointment</h2>
                 <p className="text-slate-400 text-xs mt-1 font-medium italic">Schedule a data collection session</p>
               </div>
               <CardContent className="p-8 space-y-10">
                 <div className="space-y-6">
                   <div className="flex items-center justify-between">
                     <span className="font-bold text-[10px] text-slate-900 uppercase tracking-widest">Available Flux Points</span>
                     <Badge variant="outline" className="rounded-none border-slate-200 text-slate-500 font-mono text-[10px]">
                        {doctor.availableSlots?.length || 4} IDENT-T
                     </Badge>
                   </div>
                   <div className="grid grid-cols-2 gap-3">
                     {(doctor.availableSlots || ['10:00 AM', '11:30 AM', '02:00 PM', '04:30 PM']).map((slot: string) => (
                       <Button 
                         key={slot}
                         variant={selectedSlot === slot ? "default" : "outline"}
                         className={`rounded h-14 font-black text-[10px] uppercase tracking-widest transition-all ${
                           selectedSlot === slot ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-500/20' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                         }`}
                         onClick={() => setSelectedSlot(slot)}
                       >
                         {slot}
                       </Button>
                     ))}
                   </div>
                 </div>

                 <div className="space-y-4 pt-6 border-t border-slate-100">
                   <div className="flex items-center justify-between text-[10px] text-slate-400 font-black uppercase tracking-widest">
                     <div className="flex items-center gap-2">
                       <Shield className="text-blue-500" size={14} />
                       <span>Encrypted Sync</span>
                     </div>
                     <div className="flex items-center gap-2">
                       <Clock className="text-blue-500" size={14} />
                       <span>Low Latency</span>
                     </div>
                   </div>
                 </div>

                 <Button className="w-full h-16 rounded bg-slate-900 text-white font-black uppercase tracking-[0.2em] text-[11px] group hover:bg-blue-600 transition-all border border-slate-800" size="lg" onClick={handleBooking}>
                   Finalize Allocation
                   <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={16} />
                 </Button>
               </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* AI Chat Widget */}
      <div className="fixed bottom-10 right-10 z-[100]">
        <AnimatePresence>
          {chatOpen ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-[400px] max-w-[90vw] h-[550px] rounded border border-slate-200 shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="bg-slate-900 p-6 text-white flex justify-between items-center shrink-0 border-b border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center shadow-lg shadow-blue-900/50">
                    <Bot size={24} />
                  </div>
                  <div>
                    <h4 className="font-black text-[10px] uppercase tracking-widest">Neural Link</h4>
                    <p className="text-xs text-slate-400 font-bold tracking-tight">AI Proxy for {doctor.name}</p>
                  </div>
                </div>
                <button onClick={() => setChatOpen(false)} className="hover:bg-slate-800 p-2 rounded transition-colors text-slate-400">
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
                {messages.length === 0 && (
                  <div className="text-center space-y-4 py-12">
                     <Bot className="mx-auto text-slate-200" size={48} />
                     <p className="text-slate-400 text-[11px] leading-relaxed font-bold uppercase tracking-widest italic px-10">
                        "Secure link established. I can provide specification data for Doctor {doctor.name} or log preliminary queries."
                     </p>
                  </div>
                )}
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.isAI ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[85%] rounded p-4 text-[13px] font-medium leading-relaxed ${
                      m.isAI ? 'bg-white text-slate-700 shadow-sm border border-slate-100' : 'bg-slate-900 text-white shadow-xl italic'
                    }`}>
                      {m.text}
                    </div>
                  </div>
                ))}
                {isAiThinking && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-100 rounded-full px-4 py-2 shadow-sm">
                       <span className="flex gap-1">
                         <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></span>
                         <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                         <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                       </span>
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100 flex gap-2 shrink-0">
                <Input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Insert query sequence..."
                  className="rounded-none border-0 bg-slate-100 h-14 font-mono text-xs focus:ring-1 focus:ring-blue-600"
                />
                <Button type="submit" size="icon" className="bg-slate-900 w-14 h-14 shrink-0 rounded hover:bg-blue-600 transition-colors">
                  <Send size={18} />
                </Button>
              </form>
            </motion.div>
          ) : (
            <motion.button 
              layoutId="chat"
              onClick={() => setChatOpen(true)}
              className="bg-slate-900 text-white w-20 h-20 rounded border border-slate-800 flex items-center justify-center shadow-2xl hover:bg-blue-600 active:scale-95 transition-all group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <MessageSquare size={32} className="relative z-10 group-hover:rotate-6 transition-transform" />
              <span className="absolute top-3 right-3 w-3 h-3 bg-blue-500 border-2 border-slate-900 rounded-full animate-pulse shadow-lg shadow-blue-500/50"></span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Stethoscope(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
      <path d="M8 15v1a6 6 0 0 0 6 6h2a6 6 0 0 0 6 6v-4" />
      <circle cx="20" cy="10" r="2" />
    </svg>
  )
}

function X(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}
