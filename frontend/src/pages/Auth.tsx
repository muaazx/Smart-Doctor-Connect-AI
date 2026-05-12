import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, loginWithGoogle, OperationType, handleFirestoreError, storage } from '@/lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { compressImageToBase64 } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Stethoscope, User, Heart, ArrowRight, CheckCircle2, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

export default function Auth() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [roleSelection, setRoleSelection] = useState<'doctor' | 'patient'>('patient');
  
  // Doctor specific details
  const [doctorForm, setDoctorForm] = useState({
    location: '',
    specialization: '',
    experience: '',
    consultationType: ''
  });
  const [profilePic, setProfilePic] = useState<File | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const user = await loginWithGoogle();
      if (!user) return;

      const docRef = doc(db, roleSelection === 'doctor' ? 'doctors' : 'patients', user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        if (roleSelection === 'doctor') {
          if (!doctorForm.location || !doctorForm.specialization || !doctorForm.experience || !doctorForm.consultationType) {
            toast.error("Please fill in all doctor details to complete your new registration.");
            setLoading(false);
            return;
          }
        }

        const data: any = {
          uid: user.uid,
          name: user.displayName || 'Anonymous User',
          createdAt: serverTimestamp(),
        };

        if (roleSelection === 'doctor') {
          // Upload profile picture if provided
          let profilePicUrl = user.photoURL; // default to google photo
          if (profilePic) {
            try {
              toast.info("Processing profile picture...");
              profilePicUrl = await compressImageToBase64(profilePic);
            } catch (uploadError) {
              console.error("Image processing failed:", uploadError);
              toast.warning("Profile picture processing failed. Using default image.");
            }
          }

          // Use the custom inputs instead of hardcoding
          data.location = doctorForm.location;
          data.specialization = doctorForm.specialization;
          data.experience = Number(doctorForm.experience) || 0;
          data.consultationType = doctorForm.consultationType.split(',').map(s => s.trim());
          data.profilePicUrl = profilePicUrl;
          data.available = true;
          data.availableSlots = ['10:00 AM', '11:30 AM', '02:00 PM', '04:30 PM'];
          data.rating = 0;
        } else {
          data.email = user.email;
        }

        await setDoc(docRef, data);
        toast.success(`Profile created: ${data.name}`);
      } else {
        toast.success(`Identity synced: ${docSnap.data().name}`);
      }

      navigate(roleSelection === 'doctor' ? '/dashboard/doctor' : '/dashboard/patient');
    } catch (error) {
      console.error(error);
      toast.error("Handshake failure. Retry sync.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6 bg-background relative overflow-hidden font-sans">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.05),transparent_70%)]"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl glass rounded-3xl overflow-hidden shadow-2xl relative z-10 flex flex-col md:flex-row min-h-[600px] border border-white/10"
      >
        <div className="bg-slate-950 p-12 text-white flex flex-col justify-between items-start md:w-5/12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px] -mr-32 -mt-32"></div>
          
          <div className="space-y-8 relative z-10">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/40">
              <Heart size={28} className="text-white fill-white/20" />
            </div>
            <div className="space-y-2">
              <h2 className="text-4xl font-black leading-none uppercase tracking-tighter">
                SMART <br/>
                <span className="text-blue-500">DOCTOR</span> <br/>
                CONNECT.
              </h2>
              <div className="flex items-center gap-2 pt-4">
                <div className="h-1 w-12 bg-blue-600 rounded-full"></div>
                <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.4em]">Medical OS V1.0</p>
              </div>
            </div>
          </div>

          <div className="space-y-6 relative z-10">
            <p className="text-slate-400 text-sm font-bold leading-relaxed max-w-[240px]">
              The next evolution in patient-provider synchronization.
            </p>
            <div className="flex gap-1.5">
               <div className="h-1.5 w-6 bg-blue-600 rounded-full"></div>
               <div className="h-1.5 w-1.5 bg-slate-800 rounded-full"></div>
               <div className="h-1.5 w-1.5 bg-slate-800 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="p-12 md:p-16 space-y-12 bg-transparent flex-1 max-h-[90vh] overflow-y-auto custom-scrollbar">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/10 text-blue-600 text-[9px] font-black uppercase tracking-[0.2em]">
              <Activity size={12} />
              Identity Verification Required
            </div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Authentication</h1>
          </div>

          <Tabs defaultValue="patient" className="w-full" onValueChange={(v) => setRoleSelection(v as any)}>
            <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-slate-100 dark:bg-slate-900 p-1.5 h-auto mb-10 border border-slate-200 dark:border-slate-800">
              <TabsTrigger value="patient" className="rounded-xl py-3.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-blue-600 data-[state=active]:shadow-xl flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-[0.2em] transition-all text-slate-500 hover:text-slate-900 dark:hover:text-slate-300">
                <User size={16} />
                Patient
              </TabsTrigger>
              <TabsTrigger value="doctor" className="rounded-xl py-3.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-blue-600 data-[state=active]:shadow-xl flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-[0.2em] transition-all text-slate-500 hover:text-slate-900 dark:hover:text-slate-300">
                <Stethoscope size={16} />
                Specialist
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
               <motion.div
                 key={roleSelection}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 transition={{ duration: 0.3 }}
                 className="space-y-8"
               >
                 {roleSelection === 'patient' ? (
                   <div className="p-10 rounded-3xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] space-y-6">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white flex items-center gap-3">
                        <CheckCircle2 size={16} className="text-blue-600" />
                        Network Protocols
                      </h3>
                      <ul className="space-y-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">
                         <li className="flex items-center gap-4 group">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 group-hover:scale-150 transition-transform"></div>
                            Zero-latency specialist lookup
                         </li>
                         <li className="flex items-center gap-4 group">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 group-hover:scale-150 transition-transform"></div>
                            End-to-end medical encryption
                         </li>
                         <li className="flex items-center gap-4 group">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 group-hover:scale-150 transition-transform"></div>
                            Unified health record registry
                         </li>
                      </ul>
                   </div>
                 ) : (
                   <div className="p-10 rounded-3xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] space-y-8">
                      <div className="space-y-2">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white">Credentials Matrix</h3>
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest italic">All nodes must be verified manually.</p>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <Label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Designation Hub</Label>
                          <Input 
                            placeholder="e.g. London Clinical" 
                            value={doctorForm.location}
                            onChange={e => setDoctorForm({...doctorForm, location: e.target.value})}
                            className="h-14 rounded-2xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 font-bold px-6"
                          />
                        </div>
                        <div className="space-y-4">
                          <Label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Medical Domain</Label>
                          <Input 
                            placeholder="e.g. Neuro-Specialist" 
                            value={doctorForm.specialization}
                            onChange={e => setDoctorForm({...doctorForm, specialization: e.target.value})}
                            className="h-14 rounded-2xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 font-bold px-6"
                          />
                        </div>
                        <div className="space-y-4">
                          <Label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Active Tenure (Yrs)</Label>
                          <Input 
                            type="number"
                            placeholder="00" 
                            value={doctorForm.experience}
                            onChange={e => setDoctorForm({...doctorForm, experience: e.target.value})}
                            className="h-14 rounded-2xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 font-bold px-6"
                          />
                        </div>
                        <div className="space-y-4">
                          <Label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Interface Modes</Label>
                          <Input 
                            placeholder="online, hybrid" 
                            value={doctorForm.consultationType}
                            onChange={e => setDoctorForm({...doctorForm, consultationType: e.target.value})}
                            className="h-14 rounded-2xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 font-bold px-6"
                          />
                        </div>
                      </div>
                   </div>
                 )}
               </motion.div>
            </AnimatePresence>
          </Tabs>

          <Button 
            className="w-full h-16 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-4 hover:bg-blue-700 hover:shadow-2xl hover:shadow-blue-500/30 transition-all active:scale-[0.98] disabled:opacity-50"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center p-1.5 shadow-lg group">
              <img src="https://www.google.com/favicon.ico" alt="google" className="w-full h-full" />
            </div>
            {loading ? 'Decrypting Access...' : 'Continue with Google Identity'}
            {!loading && <ArrowRight size={18} className="ml-2 animate-pulse" />}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
