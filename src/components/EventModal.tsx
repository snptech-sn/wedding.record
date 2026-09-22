import React, { useState, useEffect } from 'react';
import { EventItem, EventType } from '../types';
import { EVENT_TYPE_LABELS } from '../utils/formatters';
import {
  X,
  Calendar,
  MapPin,
  User,
  FileText,
  Sparkles,
  Heart,
  Cake,
  Home,
  Navigation,
  ExternalLink,
  Loader2,
  Compass,
  Check,
} from 'lucide-react';
import { searchMapsGrounding, MapsPlace } from '../services/mapsService';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: Omit<EventItem, 'id'>) => void;
  initialData?: EventItem | null;
}

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState<EventType>('WEDDING');
  const [date, setDate] = useState('');
  const [hostName, setHostName] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // Google Maps Grounding state
  const [showMapsFinder, setShowMapsFinder] = useState(false);
  const [mapsQuery, setMapsQuery] = useState('');
  const [mapsLoading, setMapsLoading] = useState(false);
  const [mapsPlaces, setMapsPlaces] = useState<MapsPlace[]>([]);
  const [mapsError, setMapsError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setEventType(initialData.eventType);
      setDate(initialData.date);
      setHostName(initialData.hostName);
      setLocation(initialData.location || '');
      setNotes(initialData.notes || '');
    } else {
      setTitle('');
      setEventType('WEDDING');
      setDate(new Date().toISOString().slice(0, 10));
      setHostName('');
      setLocation('');
      setNotes('');
    }
    setError('');
    setShowMapsFinder(false);
    setMapsPlaces([]);
    setMapsError(null);
  }, [initialData, isOpen]);

  const handleSearchMapsVenue = async (targetQuery?: string) => {
    const q = (targetQuery || mapsQuery || location || 'សាលមង្គលការនៅភ្នំពេញ').trim();
    setMapsLoading(true);
    setMapsError(null);
    try {
      const res = await searchMapsGrounding(q, null, `ពិធី: ${title || 'កម្មវិធី'} ម្ចាស់ដើមការ: ${hostName}`);
      setMapsPlaces(res.places || []);
      if (!res.places || res.places.length === 0) {
        setMapsError('មិនបានរកឃើញទីតាំងដែលត្រូវគ្នានៅលើ Google Maps ទេ។ សូមសាកល្បងពាក្យគន្លឹះផ្សេង។');
      }
    } catch (err: any) {
      console.error(err);
      setMapsError(err?.message || 'បរាជ័យក្នុងការទាញយក Google Maps data');
    } finally {
      setMapsLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('សូមបញ្ចូលឈ្មោះកម្មវិធី / ពិធី');
      return;
    }
    if (!hostName.trim()) {
      setError('សូមបញ្ចូលឈ្មោះម្ចាស់កម្មវិធី');
      return;
    }
    if (!date) {
      setError('សូមជ្រើសរើសកាលបរិច្ឆេទកម្មវិធី');
      return;
    }

    onSave({
      title: title.trim(),
      eventType,
      date,
      hostName: hostName.trim(),
      location: location.trim() || undefined,
      notes: notes.trim() || undefined,
    });
  };

  const getEventIcon = (type: EventType) => {
    switch (type) {
      case 'WEDDING':
        return <Heart className="w-4 h-4 text-rose-500" />;
      case 'BIRTHDAY':
        return <Cake className="w-4 h-4 text-amber-500" />;
      case 'HOUSEWARMING':
        return <Home className="w-4 h-4 text-emerald-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-indigo-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden z-10 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-600 via-rose-700 to-amber-600 px-6 py-4 text-white flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">
              {initialData ? 'កែប្រែព័ត៌មានកម្មវិធី' : 'បង្កើតកម្មវិធី ឬ ពិធីថ្មី'}
            </h2>
            <p className="text-xs text-rose-100 mt-0.5">
              មង្គលការ, ខួបកំណើត, ឡើងគេហដ្ឋាន ឬ ព្រឹត្តិការណ៍ពិសេស
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs rounded-xl">
              {error}
            </div>
          )}

          {/* Event Type Grid Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              ប្រភេទកម្មវិធី <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(EVENT_TYPE_LABELS) as EventType[]).map((type) => {
                const isSelected = eventType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setEventType(type);
                      if (!title || title.startsWith('ពិធី')) {
                        if (type === 'WEDDING') setTitle('ពិធីមង្គលការ ');
                        else if (type === 'BIRTHDAY') setTitle('ពិធីខួបកំណើត ');
                        else if (type === 'HOUSEWARMING') setTitle('ពិធីឡើងគេហដ្ឋានថ្មី ');
                        else setTitle('កម្មវិធី ');
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                      isSelected
                        ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-900 dark:text-rose-200 ring-2 ring-rose-500/20 shadow-xs'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    {getEventIcon(type)}
                    <span>{EVENT_TYPE_LABELS[type].label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <span>ឈ្មោះកម្មវិធី / ពិធី</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ឧទាហរណ៍: ពិធីមង្គលការ សុខា & ចរិយា"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          {/* Host Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-rose-500" />
              <span>ម្ចាស់កម្មវិធី (កូនកំលោះ-ក្រមុំ ឬ ម្ចាស់ផ្ទះ)</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={hostName}
              onChange={(e) => setHostName(e.target.value)}
              placeholder="ឧទាហរណ៍: លោក សុខា & អ្នកនាង ចរិយា"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              <span>កាលបរិច្ឆេទប្រារព្ធពិធី</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-medium text-slate-900 dark:text-white"
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                <span>ទីតាំងប្រារព្ធពិធី (បើមាន)</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  const nextState = !showMapsFinder;
                  setShowMapsFinder(nextState);
                  if (nextState && mapsPlaces.length === 0) {
                    handleSearchMapsVenue(location || 'សាលមង្គលការនៅភ្នំពេញ');
                  }
                }}
                className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>{showMapsFinder ? 'លាក់ផែនទី' : 'ស្វែងរកតាម Google Maps'}</span>
              </button>
            </div>

            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="ឧ. មជ្ឈមណ្ឌលកោះពេជ្រ អគារ G ឬ គេហដ្ឋានផ្ទាល់"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />

            {/* Google Maps Grounding Finder Panel */}
            {showMapsFinder && (
              <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl space-y-2.5 animate-in fade-in">
                <div className="flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 font-semibold">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>ស្វែងរកទីតាំង & សាលមង្គលការ (Google Maps)</span>
                  </span>
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/60 px-1.5 py-0.5 rounded text-emerald-700 dark:text-emerald-300">
                    Gemini 2.5 Flash
                  </span>
                </div>

                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={mapsQuery}
                    onChange={(e) => setMapsQuery(e.target.value)}
                    placeholder="វាយឈ្មោះសាល ឬទីតាំង..."
                    className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => handleSearchMapsVenue(mapsQuery)}
                    disabled={mapsLoading}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0 disabled:opacity-50 cursor-pointer"
                  >
                    {mapsLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Compass className="w-3 h-3" />}
                    <span>ស្វែងរក</span>
                  </button>
                </div>

                {mapsLoading && (
                  <div className="py-3 text-center text-xs text-emerald-700 dark:text-emerald-400 flex items-center justify-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>កំពុងទាញយកទិន្នន័យ Google Maps...</span>
                  </div>
                )}

                {mapsError && (
                  <div className="text-[11px] text-rose-600 dark:text-rose-400 p-2 bg-rose-50 dark:bg-rose-950/40 rounded-lg">
                    {mapsError}
                  </div>
                )}

                {mapsPlaces.length > 0 && (
                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 text-xs">
                    {mapsPlaces.map((place, idx) => (
                      <div
                        key={idx}
                        className="p-2 bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-800 rounded-lg flex items-start justify-between gap-2 shadow-2xs"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-slate-900 dark:text-white truncate">
                            {place.title}
                          </div>
                          {place.address && (
                            <div className="text-[10px] text-slate-500 truncate">
                              {place.address}
                            </div>
                          )}
                          {place.uri && (
                            <a
                              href={place.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5 mt-0.5"
                            >
                              <span>បើក Google Maps</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setLocation(place.title + (place.address ? ` (${place.address})` : ''));
                            setShowMapsFinder(false);
                          }}
                          className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/60 dark:hover:bg-emerald-800 text-emerald-800 dark:text-emerald-200 rounded text-[10px] font-semibold shrink-0 flex items-center gap-0.5 cursor-pointer"
                        >
                          <Check className="w-3 h-3" />
                          <span>ជ្រើសរើស</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span>កំណត់សម្គាល់បន្ថែម</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ព័ត៌មានលម្អិតផ្សេងៗ..."
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              បោះបង់
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 rounded-xl transition-all shadow-sm shadow-rose-200 dark:shadow-none"
            >
              {initialData ? 'រក្សាទុកការកែប្រែ' : 'បង្កើតកម្មវិធី'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
