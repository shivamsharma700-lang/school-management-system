import { useState } from "react";
import { Mail, MapPin, Phone, X } from "lucide-react";
import { CAMPUS_MEDIA, campusMedia, type CampusMedia } from "../lib/mediaCatalog";
import { Badge } from "./ui";
import { MediaImage } from "./media";

export function CampusDetail({
  campus,
  onClose,
  studentCount,
  classCount,
}: {
  campus: CampusMedia;
  onClose: () => void;
  studentCount?: number;
  classCount?: number;
}) {
  const [shot, setShot] = useState(0);
  const gallery = campus.gallery.filter(Boolean);
  const active = gallery[shot] ?? campus.hero;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#04180f]/70 p-4 backdrop-blur-md" onClick={onClose}>
      <div className="glass-panel max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[28px] text-slate-900" onClick={(e) => e.stopPropagation()}>
        <div className="relative h-56">
          <MediaImage src={active} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#04180f]/80 to-transparent" />
          <button type="button" className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/20 text-white" onClick={onClose} aria-label="Close campus">
            <X size={18} />
          </button>
          <div className="absolute bottom-4 left-5 text-white">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gilt-400">{campus.city}</p>
            <h3 className="font-display text-3xl">{campus.name}</h3>
          </div>
        </div>
        <div className="grid gap-2 p-4 sm:grid-cols-3">
          {gallery.map((src, i) => (
            <button key={src + i} type="button" onClick={() => setShot(i)} className={`overflow-hidden rounded-2xl border-2 ${i === shot ? "border-[#0c6b45]" : "border-transparent"}`}>
              <MediaImage src={src} alt="" className="h-20 w-full object-cover" />
            </button>
          ))}
        </div>
        <div className="grid gap-4 px-5 pb-6 sm:grid-cols-2">
          <div>
            <p className="text-sm leading-6 text-slate-600">{campus.description}</p>
            <p className="mt-3 flex items-center gap-2 text-sm text-slate-600"><MapPin size={14} /> {campus.location}</p>
            <p className="mt-2 flex items-center gap-2 text-sm text-slate-600"><Phone size={14} /> {campus.phone}</p>
            <p className="mt-2 flex items-center gap-2 text-sm text-slate-600"><Mail size={14} /> {campus.email}</p>
          </div>
          <div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#053321]/5 p-3">
                <p className="text-xs text-slate-500">Students</p>
                <p className="font-display text-2xl text-[#053321]">{studentCount ?? campus.students}</p>
              </div>
              <div className="rounded-2xl bg-[#053321]/5 p-3">
                <p className="text-xs text-slate-500">Classes</p>
                <p className="font-display text-lg text-[#053321]">{classCount ? `${classCount} classes` : campus.classes}</p>
              </div>
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Facilities</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {campus.facilities.map((f) => <Badge key={f}>{f}</Badge>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LoginCampusRail({
  activeCode,
  onSelect,
}: {
  activeCode: string;
  onSelect: (campus: CampusMedia) => void;
}) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {CAMPUS_MEDIA.map((c) => (
        <button
          key={c.code}
          type="button"
          onClick={() => onSelect(c)}
          className={`relative h-24 w-40 shrink-0 overflow-hidden rounded-2xl border-2 ${c.code === activeCode ? "border-[#12885a] shadow-pop" : "border-transparent opacity-90"}`}
        >
          <MediaImage src={c.hero} alt="" className="h-full w-full object-cover" />
          <span className="absolute inset-x-0 bottom-0 bg-[#04180f]/70 px-2 py-1 text-left text-[10px] font-semibold text-white">
            {c.name}
            <span className="block font-normal text-white/70">{c.city}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

export { campusMedia, CAMPUS_MEDIA };
