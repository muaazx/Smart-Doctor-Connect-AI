import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DoctorCardProps {
  doctor: any;
  key?: any;
}

export default function DoctorCard({ doctor }: DoctorCardProps) {
  return (
    <Card className="overflow-hidden border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all group flex flex-col h-full rounded-lg">
      <div className="aspect-video relative overflow-hidden bg-slate-100">
        <img 
          src={doctor.profilePicUrl || `https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=400&auto=format&fit=crop`} 
          alt={doctor.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 right-3">
          <Badge className="bg-white/95 backdrop-blur-sm text-slate-900 border-none px-2 py-1 flex items-center gap-1 shadow-sm font-bold text-[10px] uppercase">
            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
            {doctor.rating || '4.8'}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-5 flex-1 flex flex-col space-y-4">
        <div className="space-y-1">
          <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors leading-tight">{doctor.name}</h3>
          <p className="text-xs font-bold text-blue-600 uppercase tracking-widest leading-none">{doctor.specialization}</p>
        </div>

        <div className="space-y-2 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 text-slate-500">
            <MapPin size={14} className="text-slate-400 flex-shrink-0" />
            <span className="text-[13px] font-medium truncate">{doctor.location}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <Clock size={14} className="text-slate-400 flex-shrink-0" />
            <span className="text-[13px] font-medium">{doctor.experience || '10 years'} experience</span>
          </div>
        </div>

        <div className="pt-2 mt-auto">
          <Link to={`/doctor/${doctor.uid}`}>
            <Button className="w-full bg-slate-900 hover:bg-blue-600 text-white font-bold h-10 rounded-md transition-all text-xs uppercase tracking-widest shadow-sm">
              View Profile
              <ArrowRight size={14} className="ml-2" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
