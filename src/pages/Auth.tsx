import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, loginWithGoogle, OperationType, handleFirestoreError } from '@/lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Stethoscope, User, Heart, ArrowRight, CheckCircle2, Activity } from 'lucide-react';
import { toast } from 'sonner';

export default function Auth() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [roleSelection, setRoleSelection] = useState<'doctor' | 'patient'>('patient');

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const user = await loginWithGoogle();
      if (!user) return;

      const docRef = doc(db, roleSelection === 'doctor' ? 'doctors' : 'patients', user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        const data: any = {
          uid: user.uid,
          name: user.displayName || 'Anonymous User',
          createdAt: serverTimestamp(),
        };

        if (roleSelection === 'doctor') {
          data.specialization = 'General Physician';
          data.location = 'Karachi, Pakistan';
          data.available = true;
          data.consultationType = 'Online';
        } else {
          data.email = user.email;
        }

        await setDoc(docRef, data);
        toast.success(`Node created: ${data.name}`);
      } else {
        toast.success(`Identity synced: ${docSnap.data().name}`);
      }

      navigate(roleSelection === 'doctor' ? '/dashboard/doctor' : '/dashboard/patient');
    } catch (error) {
      toast.error("Handshake failure. Retry sync.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-8 bg-slate-50 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-50"></div>
      
      <Card className="w-full max-w-4xl rounded-lg overflow-hidden border-slate-200 shadow-2xl relative z-10 flex flex-col md:flex-row">
        <div className="bg-slate-900 p-12 text-white flex flex-col justify-between items-start md:w-5/12 relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl -mr-16 -mt-16"></div>
          <div className="space-y-6 relative z-10">
            <div className="w-12 h-12 bg-blue-600 rounded flex items-center justify-center shadow-lg shadow-blue-900/50">
              <Heart size={24} className="fill-white" />
            </div>
            <h2 className="text-3xl font-black leading-none uppercase tracking-tighter">Unified Care Node.</h2>
            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.2em] italic">Established 2026 / V1.0</p>
          </div>
          <div className="space-y-4 relative z-10">
            <p className="text-slate-500 text-xs font-medium leading-relaxed">System-wide synchronization of healthcare resources across the national grid.</p>
            <div className="flex gap-2">
               <div className="h-1 w-8 bg-blue-600 rounded-full"></div>
               <div className="h-1 w-2 bg-slate-700 rounded-full"></div>
               <div className="h-1 w-2 bg-slate-700 rounded-full"></div>
            </div>
          </div>
        </div>

        <CardContent className="p-12 md:p-16 space-y-10 bg-white flex-1">
          <div className="space-y-2">
            <h1 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.3em]">Identity Hub</h1>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Sync Credentials</h2>
          </div>

          <Tabs defaultValue="patient" className="w-full" onValueChange={(v) => setRoleSelection(v as any)}>
            <TabsList className="grid w-full grid-cols-2 rounded bg-slate-100 p-1 h-auto mb-10 border border-slate-200">
              <TabsTrigger value="patient" className="rounded py-2.5 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest transition-all text-slate-500">
                <User size={14} />
                Client
              </TabsTrigger>
              <TabsTrigger value="doctor" className="rounded py-2.5 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest transition-all text-slate-500">
                <Stethoscope size={14} />
                Provider
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
               <motion.div
                 key={roleSelection}
                 initial={{ opacity: 0, x: -10 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: 10 }}
                 className="space-y-6"
               >
                 <div className="p-8 rounded border border-slate-100 bg-slate-50/50 space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                      <Activity size={14} className="text-blue-600" />
                      Deployment Protocol
                    </h3>
                    <ul className="space-y-3 text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                       <li className="flex items-start gap-3">
                          <CheckCircle2 size={14} className="text-blue-500 shrink-0" />
                          Authorized network access 24/7
                       </li>
                       <li className="flex items-start gap-3">
                          <CheckCircle2 size={14} className="text-blue-500 shrink-0" />
                          Real-time peer synchronization
                       </li>
                       <li className="flex items-start gap-3">
                          <CheckCircle2 size={14} className="text-blue-500 shrink-0" />
                          Encrypted identity management
                       </li>
                    </ul>
                 </div>
               </motion.div>
            </AnimatePresence>
          </Tabs>

          <Button 
            className="w-full h-16 rounded bg-slate-900 text-white font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-4 hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-900/20 transition-all border border-slate-800 disabled:opacity-50"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <img src="https://www.google.com/favicon.ico" alt="google" className="w-5 h-5 grayscale group-hover:grayscale-0" />
            {loading ? 'Initializing...' : 'G-SYNC PROTOCOL'}
            {!loading && <ArrowRight size={16} className="ml-2" />}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
