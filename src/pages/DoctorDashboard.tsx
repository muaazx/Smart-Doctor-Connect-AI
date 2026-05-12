import React, { useEffect, useState } from 'react';
import { db, handleFirestoreError, OperationType, auth } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, User, Check, X, Settings, Users, Activity, Save } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export default function DoctorDashboard() {
  const { user, profile } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(profile?.available ?? true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [tempProfile, setTempProfile] = useState(profile || {});

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
      const docRef = doc(db, 'doctors', user.uid);
      await updateDoc(docRef, tempProfile);
      setEditingProfile(false);
      toast.success("Professional credentials synchronized.");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'doctors/profile');
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-50"><Activity className="animate-spin text-blue-600" /></div>;

  const pendingCount = appointments.filter(a => a.status === 'pending').length;
  const completedCount = appointments.filter(a => a.status === 'confirmed').length;

  return (
    <div className="flex-1 bg-slate-50 min-h-screen">
      <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center space-x-2 text-slate-500 text-sm">
          <span className="hover:text-blue-600 cursor-pointer font-medium tracking-tight">Main Controller</span>
          <span className="text-slate-300">/</span>
          <span className="font-bold text-slate-900 uppercase tracking-widest text-[11px]">Overview</span>
        </div>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3 bg-slate-100 px-4 py-1.5 rounded-md border border-slate-200">
             <span className="font-bold text-slate-500 text-[10px] uppercase tracking-widest">Live Connect</span>
             <Switch 
              id="availability" 
              checked={isAvailable} 
              onCheckedChange={toggleAvailability}
              className="scale-90"
             />
             <span className={`text-[10px] font-bold uppercase tracking-widest ${isAvailable ? 'text-green-600' : 'text-slate-400'}`}>
                {isAvailable ? 'Active' : 'Idle'}
             </span>
          </div>
          <Button variant="ghost" className="rounded-md border border-slate-200 h-9 px-3 text-slate-500 hover:text-blue-600" onClick={() => setEditingProfile(!editingProfile)}>
            <Settings size={16} />
          </Button>
        </div>
      </header>

      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full content-start overflow-hidden">
          {/* Card 1 */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between shadow-sm">
            <div className="flex justify-between items-start">
              <span className="text-sm text-slate-500 font-medium">Total Resource Count</span>
              <span className="text-blue-500 text-xs font-bold font-mono tracking-tighter">NODE-01</span>
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">{appointments.length}</div>
            <div className="mt-3 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full" style={{ width: '100%' }}></div>
            </div>
            <div className="mt-2 text-[10px] text-slate-400 uppercase tracking-wider font-bold">Historical Aggregate</div>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between shadow-sm">
            <div className="flex justify-between items-start">
              <span className="text-sm text-slate-500 font-medium">Active Requests</span>
              <span className={`status-badge ${pendingCount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'} rounded-full px-2 py-0.5 text-[10px] font-bold uppercase`}>
                {pendingCount > 0 ? 'Action Required' : 'Standby'}
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900 italic tracking-tight">{pendingCount}</div>
            <div className="mt-3 flex space-x-1">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`flex-1 h-1.5 rounded-full ${i <= pendingCount ? 'bg-amber-500' : 'bg-slate-100'}`}></div>
              ))}
            </div>
            <div className="mt-2 text-[10px] text-slate-400 uppercase tracking-wider font-bold">System Load: Nominal</div>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between shadow-sm">
            <div className="flex justify-between items-start">
              <span className="text-sm text-slate-500 font-medium">Resolution Success</span>
              <span className="text-green-500 text-xs font-bold tracking-tighter">STABLE</span>
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">{completedCount}</div>
            <div className="mt-3 flex items-end h-8 space-x-1">
              <div className="bg-blue-100 w-full h-4 rounded-t-sm"></div>
              <div className="bg-blue-200 w-full h-6 rounded-t-sm"></div>
              <div className="bg-blue-300 w-full h-5 rounded-t-sm"></div>
              <div className="bg-blue-600 w-full h-8 rounded-t-sm"></div>
            </div>
            <div className="mt-2 text-[10px] text-slate-400 uppercase tracking-wider font-bold">Sprint Performance: High</div>
          </div>
        </div>

        {editingProfile ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-200 rounded-lg p-8 shadow-sm space-y-8"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
               <div>
                 <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Profile Configuration</h3>
                 <p className="text-xs text-slate-400 font-medium tracking-wide">Sync professional credentials with the identity node</p>
               </div>
               <Button variant="ghost" size="sm" onClick={() => setEditingProfile(false)} className="text-slate-400"><X size={18} /></Button>
            </div>
            <div className="grid md:grid-cols-2 gap-10">
               <div className="space-y-3">
                 <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Public Identifier</Label>
                 <Input 
                  value={tempProfile.name} 
                  onChange={(e) => setTempProfile({...tempProfile, name: e.target.value})}
                  className="rounded-md h-12 bg-slate-50 border-slate-200 font-medium text-slate-700"
                 />
               </div>
               <div className="space-y-3">
                 <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Specialization Matrix</Label>
                 <Input 
                    value={tempProfile.specialization} 
                    onChange={(e) => setTempProfile({...tempProfile, specialization: e.target.value})}
                    className="rounded-md h-12 bg-slate-50 border-slate-200 font-medium text-slate-700"
                  />
               </div>
               <div className="space-y-3">
                 <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Primary Deployment Site</Label>
                 <Input 
                    value={tempProfile.location} 
                    onChange={(e) => setTempProfile({...tempProfile, location: e.target.value})}
                    className="rounded-md h-12 bg-slate-50 border-slate-200 font-medium text-slate-700"
                  />
               </div>
               <div className="space-y-3">
                 <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tenure Vector (Years)</Label>
                 <Input 
                    value={tempProfile.experience} 
                    onChange={(e) => setTempProfile({...tempProfile, experience: e.target.value})}
                    className="rounded-md h-12 bg-slate-50 border-slate-200 font-medium text-slate-700"
                  />
               </div>
            </div>
            <Button className="w-full h-12 bg-slate-900 border border-slate-800 rounded-md font-bold uppercase tracking-widest text-[11px] gap-2 hover:bg-slate-800 transition-colors" onClick={handleSaveProfile}>
              <Save size={16} />
              Commit Changes to Node
            </Button>
          </motion.div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-[11px] uppercase tracking-widest text-slate-800">Operational Task Monitor</h3>
              <button className="text-blue-600 text-[10px] font-bold uppercase tracking-widest hover:underline">Full Log Audit</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="px-6 py-3 border-b border-slate-200">Task Identity</th>
                    <th className="px-6 py-3 border-b border-slate-200">Protocol</th>
                    <th className="px-6 py-3 border-b border-slate-200">Timeline</th>
                    <th className="px-6 py-3 border-b border-slate-200">State</th>
                    <th className="px-6 py-3 border-b border-slate-200 text-right">Interrupts</th>
                  </tr>
                </thead>
                <tbody className="text-[13px] text-slate-600">
                  {appointments.map((app) => (
                    <tr key={app.id} className="border-b border-slate-100 hover:bg-slate-50 transition-all">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-slate-900 text-white flex items-center justify-center text-[10px] font-black italic">
                            {app.patientName?.[0] || 'U'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{app.patientName}</p>
                            <p className="text-[9px] text-slate-300 font-bold uppercase tracking-tighter italic">P-IDENT-VAL</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border border-slate-200">
                          {app.type || 'Direct'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-[11px] text-slate-500">
                        {app.date} | {app.timeSlot}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                          app.status === 'confirmed' ? 'bg-green-100 text-green-700' : 
                          app.status === 'pending' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          {app.status === 'pending' && (
                            <>
                              <Button size="sm" variant="ghost" onClick={() => updateStatus(app.id, 'cancelled')} className="h-7 w-7 p-0 hover:text-red-600 transition-colors">
                                <X size={14} />
                              </Button>
                              <Button size="sm" onClick={() => updateStatus(app.id, 'confirmed')} className="h-7 px-3 bg-slate-900 text-white rounded text-[9px] font-black uppercase tracking-widest hover:bg-blue-600">
                                ACK
                              </Button>
                            </>
                          )}
                          {app.status === 'confirmed' && <Check className="text-green-500 mx-auto" size={16} />}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {appointments.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center text-slate-300 font-bold italic uppercase tracking-tighter text-sm">
                        Waiting for remote triggers...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
