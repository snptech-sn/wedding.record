import React, { useState, useEffect } from 'react';
import { EventItem } from '../types';
import {
  searchMapsGrounding,
  getCurrentCoordinates,
  MapsPlace,
  MapsGroundingResult,
} from '../services/mapsService';
import {
  MapPin,
  Search,
  ExternalLink,
  Navigation,
  Compass,
  Star,
  Hotel,
  Flower2,
  Landmark,
  Coffee,
  X,
  Loader2,
  Check,
  Map,
  Sparkles,
  LocateFixed,
} from 'lucide-react';

interface VenueMapsExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEvent: EventItem | null;
  onSelectVenueForEvent?: (venueTitle: string, address?: string) => void;
}

const PRESET_QUERIES = [
  { label: 'សាលមង្គលការល្បីៗនៅភ្នំពេញ', icon: Sparkles },
  { label: 'មជ្ឈមណ្ឌលកោះពេជ្រ Koh Pich', icon: MapPin },
  { label: 'Premier Centre Sen Sok', icon: MapPin },
  { label: 'The Galleon Hall', icon: MapPin },
  { label: 'សណ្ឋាគារ & កន្លែងស្នាក់នៅក្បែរ', icon: Hotel },
  { label: 'ហាងផ្កា & គ្រឿងដេគ័រពិធី', icon: Flower2 },
  { label: 'ធនាគារ & ម៉ាស៊ីន ATM ក្បែរ', icon: Landmark },
  { label: 'ហាងកាហ្វេ & ភោជនីយដ្ឋានក្បែរ', icon: Coffee },
];

export const VenueMapsExplorerModal: React.FC<VenueMapsExplorerModalProps> = ({
  isOpen,
  onClose,
  currentEvent,
  onSelectVenueForEvent,
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(
    null
  );
  const [locating, setLocating] = useState(false);
  const [result, setResult] = useState<MapsGroundingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Initialize query based on current event location
  useEffect(() => {
    if (isOpen) {
      if (currentEvent?.location) {
        setQuery(currentEvent.location);
        // Automatically search for event venue if opened
        handleSearch(currentEvent.location);
      } else {
        setQuery('សាលមង្គលការ និងមជ្ឈមណ្ឌលសន្និបាតនៅរាជធានីភ្នំពេញ');
        handleSearch('សាលមង្គលការ និងមជ្ឈមណ្ឌលសន្និបាតនៅរាជធានីភ្នំពេញ');
      }
    } else {
      setResult(null);
      setError(null);
    }
  }, [isOpen, currentEvent]);

  if (!isOpen) return null;

  const handleFetchLocation = async () => {
    setLocating(true);
    setError(null);
    try {
      const coords = await getCurrentCoordinates();
      setUserLocation(coords);
    } catch (err: any) {
      console.warn('Geolocation error:', err);
      setError('មិនអាចទាញយកទីតាំងបច្ចុប្បន្នរបស់អ្នកបានទេ។ សូមពិនិត្យការអនុញ្ញាត Geolocation។');
    } finally {
      setLocating(false);
    }
  };

  const handleSearch = async (overrideQuery?: string) => {
    const q = (overrideQuery ?? query).trim();
    if (!q) return;

    setLoading(true);
    setError(null);
    try {
      const eventContext = currentEvent
        ? `កម្មវិធី: ${currentEvent.title} (${currentEvent.eventType}), ម្ចាស់កម្មវិធី: ${currentEvent.hostName}, ទីតាំងដើម: ${currentEvent.location || 'មិនទាន់បញ្ជាក់'}`
        : undefined;

      const res = await searchMapsGrounding(q, userLocation, eventContext);
      setResult(res);
    } catch (err: any) {
      console.error('Search error:', err);
      setError(err?.message || 'បរាជ័យក្នុងការទាញយកទិន្នន័យ Google Maps។ សូមព្យាយាមម្តងទៀត។');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (uri: string) => {
    navigator.clipboard.writeText(uri);
    setCopiedLink(uri);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden z-10 animate-in fade-in zoom-in-95 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-cyan-600 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shadow-xs">
              <MapPin className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">ទិន្នន័យទីតាំង & Google Maps</h2>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-white/20 text-white rounded-full border border-white/30 uppercase tracking-wider">
                  Maps Grounding
                </span>
              </div>
              <p className="text-xs text-emerald-100 mt-0.5">
                {currentEvent ? `សម្រាប់កម្មវិធី៖ ${currentEvent.title}` : 'ស្វែងរកទីតាំងសាលមង្គលការ និងសេវាកម្មក្បែរទីតាំង'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar & Quick Actions */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 shrink-0 space-y-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ស្វែងរកទីតាំង សាលមង្គលការ ឬសេវាកម្ម (ឧ. កោះពេជ្រ, ហាងផ្កាក្បែរ...)"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="button"
              onClick={handleFetchLocation}
              disabled={locating}
              title={userLocation ? 'បានកំណត់ទីតាំងបច្ចុប្បន្ន' : 'ប្រើប្រាស់ទីតាំងបច្ចុប្បន្ន'}
              className={`px-3 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                userLocation
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {locating ? (
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              ) : (
                <LocateFixed className={`w-4 h-4 ${userLocation ? 'text-emerald-600' : ''}`} />
              )}
              <span className="hidden sm:inline">
                {userLocation ? 'ទីតាំងជិតខ្ញុំ' : 'ទីតាំងរបស់ខ្ញុំ'}
              </span>
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span>ស្វែងរក</span>
            </button>
          </form>

          {/* Quick Preset Tags */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            <span className="text-slate-400 dark:text-slate-500 shrink-0 mr-1 text-[11px] font-medium">
              សំណូមពរ៖
            </span>
            {PRESET_QUERIES.map((preset, idx) => {
              const Icon = preset.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setQuery(preset.label);
                    handleSearch(preset.label);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-600 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 text-[11px]"
                >
                  <Icon className="w-3 h-3 text-slate-400" />
                  <span>{preset.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Body / Results */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs">
              {error}
            </div>
          )}

          {loading && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  កំពុងទាញយកទិន្នន័យពី Google Maps...
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  ផ្ទៀងផ្ទាត់ឈ្មោះទីតាំង អាសយដ្ឋាន និងតំណភ្ជាប់ផែនទីផ្លូវការ
                </p>
              </div>
            </div>
          )}

          {!loading && result && (
            <div className="space-y-6">
              {/* Google Maps Places Grounded Cards */}
              {result.places && result.places.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Map className="w-3.5 h-3.5 text-emerald-600" />
                      <span>ទីតាំងផ្ទៀងផ្ទាត់ដោយ Google Maps ({result.places.length})</span>
                    </h3>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                      មានតំណភ្ជាប់ផ្ទាល់ & ការវាយតម្លៃ
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {result.places.map((place, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700/60 transition-all shadow-xs hover:shadow-md group flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2">
                              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                                <MapPin className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                  {place.title}
                                </h4>
                                {place.address && (
                                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                                    {place.address}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Review snippet if available */}
                          {place.placeAnswerSources?.reviewSnippets &&
                            place.placeAnswerSources.reviewSnippets.length > 0 && (
                              <div className="mt-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 italic">
                                <span className="font-semibold not-italic text-slate-800 dark:text-slate-200 mr-1">
                                  «មតិវាយតម្លៃ»៖
                                </span>
                                {place.placeAnswerSources.reviewSnippets[0].reviewText}
                                {place.placeAnswerSources.reviewSnippets[0].authorAttribution
                                  ?.displayName && (
                                  <span className="block mt-1 font-medium not-italic text-[10px] text-slate-400">
                                    — {place.placeAnswerSources.reviewSnippets[0].authorAttribution.displayName}
                                  </span>
                                )}
                              </div>
                            )}
                        </div>

                        {/* Actions for this place */}
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                          {place.uri ? (
                            <a
                              href={place.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 font-medium text-xs transition-colors"
                            >
                              <Navigation className="w-3.5 h-3.5" />
                              <span>បើក Google Maps</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-[11px] text-slate-400">Google Maps Verified</span>
                          )}

                          {onSelectVenueForEvent && (
                            <button
                              type="button"
                              onClick={() => {
                                onSelectVenueForEvent(place.title, place.address);
                                onClose();
                              }}
                              className="px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-medium text-xs transition-colors flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              <span>ជ្រើសរើសជាទីតាំង</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Detailed Grounded Insights (Text response in Khmer) */}
              {result.text && (
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-emerald-600" />
                    <span>ព័ត៌មានលម្អិត & ការណែនាំទីតាំង</span>
                  </h3>
                  <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {result.text}
                  </div>
                </div>
              )}

              {/* Explicit list of all Grounding URLs mandated by Gemini Maps Grounding guideline */}
              {result.places && result.places.some((p) => p.uri) && (
                <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
                  <h4 className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 mb-1.5 flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" />
                    <span>តំណភ្ជាប់ផែនទី Google Maps ផ្លូវការ (Official Grounding Links)៖</span>
                  </h4>
                  <ul className="space-y-1">
                    {result.places
                      .filter((p) => p.uri)
                      .map((p, idx) => (
                        <li key={idx} className="text-xs flex items-center justify-between gap-2">
                          <a
                            href={p.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 truncate"
                          >
                            <span className="font-semibold shrink-0">{p.title}:</span>
                            <span className="truncate text-slate-500 text-[11px]">{p.uri}</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => handleCopy(p.uri)}
                            className="text-[10px] text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 shrink-0 font-medium ml-2 px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                          >
                            {copiedLink === p.uri ? 'បានចម្លង!' : 'ចម្លង Link'}
                          </button>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {!loading && !result && (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500">
              <MapPin className="w-10 h-10 mx-auto mb-2 opacity-40 text-emerald-500" />
              <p className="text-sm font-medium">បញ្ចូលឈ្មោះទីតាំង ឬចុចលើសំណូមពរខាងលើដើម្បីស្វែងរក</p>
              <p className="text-xs text-slate-400 mt-1">
                ប្រព័ន្ធនឹងទាញយកទិន្នន័យផ្ទាល់ពី Google Maps តាមរយៈ Gemini 2.5 Flash
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Google Maps Grounding Enabled (Gemini 2.5 Flash)</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors"
          >
            បិទ
          </button>
        </div>
      </div>
    </div>
  );
};
