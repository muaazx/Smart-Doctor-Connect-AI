import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { collection, query, limit, getDocs } from 'firebase/firestore';
import DoctorCard from '@/components/DoctorCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, SlidersHorizontal, Activity, Sparkles, LineChart } from 'lucide-react';
import { getDoctorSuggestions } from '@/lib/gemini';
import { motion, AnimatePresence } from 'motion/react';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [search, setSearch] = useState(initialQuery);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);

  const fetchDoctors = async (searchTerm: string) => {
    setLoading(true);
    try {
      const doctorsRef = collection(db, 'doctors');
      const q = query(doctorsRef, limit(20));

      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      
      const filtered = results.filter((doc: any) => 
        !searchTerm ||
        (doc.name && doc.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (doc.specialization && doc.specialization.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (doc.location && doc.location.toLowerCase().includes(searchTerm.toLowerCase()))
      );

      setDoctors(filtered);

      if (searchTerm.length > 3 && searchTerm.split(' ').length > 1) {
        getDoctorSuggestions(searchTerm).then(suggestion => {
          setAiSuggestion(suggestion);
        }).catch(() => setAiSuggestion(null));
      } else {
        setAiSuggestion(null);
      }

    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'doctors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors(initialQuery);
  }, [initialQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDoctors(search);
  };

  return (
    <div className="flex-1 bg-background min-h-screen">
       <header className="h-20 glass px-8 flex items-center justify-between sticky top-0 z-10 transition-all">
        <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
          <span className="hover:text-blue-600 cursor-pointer transition-colors">Registry</span>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <span className="font-black text-slate-900 dark:text-white">Discovery Node</span>
        </div>
      </header>

      <div className="bg-white/5 dark:bg-transparent border-b border-slate-200 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-8 py-10">
          <motion.form 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSearch} 
            className="flex gap-4 max-w-4xl glass p-2 rounded-2xl shadow-2xl border border-white/10"
          >
            <div className="flex-1 relative flex items-center">
              <Search className="absolute left-5 text-slate-400" size={20} />
              <Input 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search doctors by name, specialization, or location..."
                className="pl-14 h-14 border-none bg-transparent font-bold text-sm uppercase tracking-tight text-slate-700 dark:text-slate-200 focus-visible:ring-0"
              />
            </div>
            <Button className="rounded-xl px-10 h-14 bg-blue-600 text-white font-black uppercase tracking-[0.2em] text-[10px] hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all active:scale-95">
              Execute Search
            </Button>
            <Button variant="outline" className="rounded-xl h-14 border-slate-200 dark:border-white/10 px-5 text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5">
              <SlidersHorizontal size={20} />
            </Button>
          </motion.form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-12 space-y-12">
        <AnimatePresence>
          {aiSuggestion && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-950 rounded-3xl p-10 flex flex-col md:flex-row gap-10 items-center shadow-2xl relative overflow-hidden border border-white/10"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-3xl -mr-32 -mt-32 animate-pulse"></div>
              <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center text-white flex-shrink-0 relative z-10 shadow-2xl shadow-blue-500/40">
                <Sparkles size={40} className="animate-pulse" />
              </div>
              <div className="flex-1 space-y-3 text-center md:text-left relative z-10">
                <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-2">Neural Triage Insights</h4>
                <div className="flex flex-col md:flex-row md:items-baseline gap-3">
                   <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Target Specialization:</h3>
                   <span className="text-3xl font-black text-blue-500 italic tracking-tighter drop-shadow-[0_0_10px_rgba(37,99,235,0.3)]">{aiSuggestion.specialization}</span>
                </div>
                <p className="text-slate-400 text-[13px] font-bold tracking-wide max-w-2xl leading-relaxed">{aiSuggestion.reason}</p>
              </div>
              <Button 
                onClick={() => {
                  setSearch(aiSuggestion.specialization);
                  fetchDoctors(aiSuggestion.specialization);
                }}
                className="rounded-2xl px-10 py-5 h-auto bg-white text-slate-950 font-black uppercase tracking-[0.2em] text-[10px] hover:bg-blue-50 transition-all relative z-10 shadow-2xl active:scale-95"
              >
                Sync Filter
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-between items-end border-b border-slate-100 dark:border-white/5 pb-8">
           <div className="space-y-2">
              <h2 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em]">Node Discovery Results</h2>
              <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
                {loading ? 'Scanning...' : `${doctors.length} Verified Units`}
              </p>
           </div>
           <div className="flex items-center space-x-4 pb-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sequence:</span>
              <select className="bg-transparent text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white focus:outline-none cursor-pointer border-b-2 border-blue-600 pb-1">
                <option className="bg-slate-950 text-white">Performance</option>
                <option className="bg-slate-950 text-white">Experience</option>
                <option className="bg-slate-950 text-white">Rating</option>
              </select>
           </div>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="h-[420px] bg-slate-100 dark:bg-slate-900 rounded-3xl animate-pulse border border-slate-200 dark:border-white/5" />
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            {doctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </motion.div>
        )}

        {!loading && doctors.length === 0 && (
          <div className="text-center py-32 glass rounded-3xl border border-white/10 shadow-2xl space-y-8">
            <Activity size={64} className="mx-auto text-slate-200 dark:text-slate-800 animate-pulse" />
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Zero Nodes Detected</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-bold max-w-sm mx-auto">No medical professionals match your current search parameters in the network.</p>
            </div>
            <Button 
              variant="outline" 
              className="rounded-xl border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest text-[10px] h-12 px-8 hover:bg-slate-50 dark:hover:bg-white/5" 
              onClick={() => fetchDoctors('')}
            >
              Reset Global Link
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
