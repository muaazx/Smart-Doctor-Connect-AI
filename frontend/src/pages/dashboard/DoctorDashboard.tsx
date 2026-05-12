import React, { useEffect, useState } from 'react';
import { db, handleFirestoreError, OperationType, auth, storage } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { compressImageToBase64 } from '@/lib/utils';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Check, X, Settings, Activity, Save } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export default function DoctorDashboard() {
  const { user, profile } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(profile?.available ?? true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [tempProfile, setTempProfile] = useState(profile || {});
  const [profilePic, setProfilePic] = useState<File | null>(null);

  useEffect(() => {
    if (!user) return;
    
    const q = query(
      collection(db, 'appointments'),
      where('doctorId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const apps = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setAppointments(apps);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'appointments');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const toggleAvailability = async (val: boolean) => {
    if (!user) return;
    setIsAvailable(val);
    try {
      const docRef = doc(db, 'doctors', user.uid);
      await updateDoc(docRef, { available: val });
      toast.success(`Online status set to ${val ? 'available' : 'offline'}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'doctors/availability');
    }
  };

  const updateStatus = async (appId: string, status: string) => {
    try {
      const appRef = doc(db, 'appointments', appId);
      await updateDoc(appRef, { status });
      toast.success(`Entry marked as ${status}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `appointments/${appId}`);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    try {
      let profilePicUrl = tempProfile.profilePicUrl;
      if (profilePic) {
        try {
          toast.info("Processing profile picture...");
          profilePicUrl = await compressImageToBase64(profilePic);
        } catch (uploadError) {
          console.error("Image processing failed:", uploadError);
          toast.warning("Profile picture processing failed.");
        }
      }

      const docRef = doc(db, 'doctors', user.uid);
      // Ensure specific types
      const dataToSave = {
        ...tempProfile,
        profilePicUrl: profilePicUrl || null,
        experience: Number(tempProfile.experience) || 0,
        consultationType: Array.isArray(tempProfile.consultationType) 
            ? tempProfile.consultationType 
            : typeof tempProfile.consultationType === 'string' 
                ? tempProfile.consultationType.split(',').map((s: string) => s.trim()) 
                : ['online', 'physical']
      };
      await updateDoc(docRef, dataToSave);
      setEditingProfile(false);
      toast.success("Professional credentials synchronized.");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'doctors/profile');
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-background"><Activity className="animate-spin text-blue-600" /></div>;

  const pendingCount = appointments.filter(a => a.status === 'pending').length;
  const completedCount = appointments.filter(a => a.status === 'confirmed').length;

  return (
    <div className="flex-1 bg-background min-h-screen">
      <header className="h-20 glass px-8 flex items-center justify-between sticky top-0 z-10 transition-all">
        <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 text-xs">
          <span className="hover:text-blue-600 cursor-pointer font-black uppercase tracking-widest">Main Console</span>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <span className="font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] text-[10px]">Registry Overview</span>
        </div>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3 bg-slate-100 dark:bg-slate-900 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800">
             <span className="font-black text-slate-500 dark:text-slate-400 text-[9px] uppercase tracking-widest">Availability</span>
             <Switch 
              id="availability" 
              checked={isAvailable} 
              onCheckedChange={toggleAvailability}
              className="scale-90"
             />
             <span className={`text-[10px] font-black uppercase tracking-widest ${isAvailable ? 'text-green-600' : 'text-slate-400'}`}>
                {isAvailable ? 'Active' : 'Offline'}
             </span>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full border border-slate-200 dark:border-slate-800 h-10 w-10 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400" onClick={() => setEditingProfile(!editingProfile)}>
            <Settings size={18} />
          </Button>
        </div>
      </header>

      <div className="p-8 max-w-7xl mx-auto space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 flex flex-col justify-between group"
          >
            <div className="flex justify-between items-start">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.2em]">Patient Throughput</span>
              <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Activity size={16} />
              </div>
            </div>
            <div className="mt-4 text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{appointments.length}</div>
            <div className="mt-4 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full w-full shadow-[0_0_10px_rgba(37,99,235,0.5)]"></div>
            </div>
            <div className="mt-3 text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] font-black italic">Aggregate Total</div>
          </motion.div>

          {/* Card 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 flex flex-col justify-between group"
          >
            <div className="flex justify-between items-start">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.2em]">Queue Priority</span>
              <span className={`rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest ${pendingCount > 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 shadow-lg shadow-amber-500/10' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                {pendingCount > 0 ? 'Action Required' : 'Synchronized'}
              </span>
            </div>
            <div className="mt-4 text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic">{pendingCount}</div>
            <div className="mt-4 flex gap-1.5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${i <= pendingCount ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-slate-100 dark:bg-slate-800'}`}></div>
              ))}
            </div>
            <div className="mt-3 text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] font-black italic">Pending Analysis</div>
          </motion.div>

          {/* Card 3 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 flex flex-col justify-between group"
          >
            <div className="flex justify-between items-start">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.2em]">Session Success</span>
              <div className="w-8 h-8 rounded-lg bg-green-600/10 text-green-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Check size={16} />
              </div>
            </div>
            <div className="mt-4 text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{completedCount}</div>
            <div className="mt-4 flex items-end h-8 gap-1.5">
              <div className="bg-blue-600/20 dark:bg-blue-600/10 w-full h-4 rounded-full"></div>
              <div className="bg-blue-600/40 dark:bg-blue-600/20 w-full h-7 rounded-full"></div>
              <div className="bg-blue-600/60 dark:bg-blue-600/30 w-full h-5 rounded-full"></div>
              <div className="bg-blue-600 w-full h-8 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]"></div>
            </div>
            <div className="mt-3 text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] font-black italic">Stable Performance</div>
          </motion.div>
        </div>

        {editingProfile ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass p-8 rounded-3xl shadow-2xl space-y-10"
          >
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-6">
               <div>
                 <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Credential Matrix</h3>
                 <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em] mt-1">Configure professional profile variables</p>
               </div>
               <Button variant="ghost" size="icon" onClick={() => setEditingProfile(false)} className="rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><X size={20} /></Button>
            </div>
            <div className="grid md:grid-cols-2 gap-12">
               <div className="space-y-4">
                 <Label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Profile Imaging</Label>
                 <Input 
                   type="file"
                   accept="image/*"
                   onChange={e => e.target.files && setProfilePic(e.target.files[0])}
                   className="glass file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-blue-600 file:text-white file:border-0 file:rounded-full file:px-4 file:mr-4 hover:file:bg-blue-700 file:cursor-pointer cursor-pointer py-2 h-auto rounded-xl border-slate-200 dark:border-slate-800"
                 />
               </div>
               <div className="space-y-4">
                 <Label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Full Designation</Label>
                 <Input 
                  value={tempProfile.name || ''} 
                  onChange={(e) => setTempProfile({...tempProfile, name: e.target.value})}
                  className="rounded-xl h-14 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-200 px-6 focus:ring-2 focus:ring-blue-600/20 transition-all"
                 />
               </div>
               <div className="space-y-4">
                 <Label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Specialization Field</Label>
                 <Input 
                    value={tempProfile.specialization || ''} 
                    onChange={(e) => setTempProfile({...tempProfile, specialization: e.target.value})}
                    className="rounded-xl h-14 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-200 px-6"
                  />
               </div>
               <div className="space-y-4">
                 <Label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Geographic Deployment</Label>
                 <Input 
                    value={tempProfile.location || ''} 
                    onChange={(e) => setTempProfile({...tempProfile, location: e.target.value})}
                    className="rounded-xl h-14 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-200 px-6"
                  />
               </div>
               <div className="space-y-4">
                 <Label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Clinical Experience (Years)</Label>
                 <Input 
                    type="number"
                    min="0"
                    value={tempProfile.experience || ''} 
                    onChange={(e) => setTempProfile({...tempProfile, experience: e.target.value})}
                    className="rounded-xl h-14 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-200 px-6"
                  />
               </div>
               <div className="space-y-4 md:col-span-2">
                 <Label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Service Channels (Comma Separated)</Label>
                 <Input 
                    value={Array.isArray(tempProfile.consultationType) ? tempProfile.consultationType.join(', ') : tempProfile.consultationType || ''} 
                    onChange={(e) => setTempProfile({...tempProfile, consultationType: e.target.value})}
                    placeholder="e.g. online, physical"
                    className="rounded-xl h-14 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-200 px-6"
                  />
               </div>
            </div>
            <Button className="w-full h-16 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] gap-3 hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98]" onClick={handleSaveProfile}>
              <Save size={18} />
              Synchronize Data
            </Button>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-slate-100 dark:border-white/5"
          >
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-white/[0.02]">
              <h3 className="font-black text-[11px] uppercase tracking-[0.2em] text-slate-800 dark:text-white">Active Queue Registry</h3>
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50 dark:bg-white/[0.02] text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] font-black">
                  <tr>
                    <th className="px-8 py-5">Patient Identity</th>
                    <th className="px-8 py-5">Channel</th>
                    <th className="px-8 py-5">Chronology</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5 text-right">Control</th>
                  </tr>
                </thead>
                <tbody className="text-[13px] text-slate-600 dark:text-slate-300">
                  {appointments.map((app) => (
                    <tr key={app.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center text-[11px] font-black italic shadow-lg group-hover:scale-110 transition-transform">
                            {app.patientName?.[0] || 'U'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{app.patientName}</p>
                            <p className="text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest mt-0.5">Verified Patient</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-800">
                          {app.type || 'Direct'}
                        </span>
                      </td>
                      <td className="px-8 py-5 font-black text-[10px] text-slate-500 dark:text-slate-400 tracking-widest">
                        {app.date} <span className="text-slate-300 dark:text-slate-700">|</span> {app.timeSlot}
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          app.status === 'confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                          app.status === 'pending' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          {app.status === 'pending' && (
                            <>
                              <Button size="icon" variant="ghost" onClick={() => updateStatus(app.id, 'cancelled')} className="h-9 w-9 rounded-full hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                                <X size={16} />
                              </Button>
                              <Button size="sm" onClick={() => updateStatus(app.id, 'confirmed')} className="h-9 px-5 bg-slate-900 dark:bg-white dark:text-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 dark:hover:bg-blue-400 transition-all">
                                Accept
                              </Button>
                            </>
                          )}
                          {app.status === 'confirmed' && (
                            <div className="w-9 h-9 flex items-center justify-center text-green-500 bg-green-500/10 rounded-full">
                              <Check size={18} />
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {appointments.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-8 py-32 text-center">
                        <div className="flex flex-col items-center gap-4 opacity-40">
                          <Activity size={48} className="text-slate-300 dark:text-slate-700" />
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.4em]">No Incoming Sessions Detected</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
