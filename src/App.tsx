import React, { useState, useEffect, useRef } from 'react';
import posthog from 'posthog-js';
import { Loader2, AlertCircle } from 'lucide-react';
import { Filters } from './components/Filters';
import { SessionCard } from './components/SessionCard';
import { DetailModal } from './components/DetailModal';
import { DirectusService } from './services/directus';
import type { AlumniSession } from './types';

// ✅ Expose PostHog to browser for testing
// @ts-expect-error
window.posthog = posthog;

posthog.init(import.meta.env.VITE_PUBLIC_POSTHOG_KEY!, {
  api_host: `${window.location.origin}/ingest`,
  autocapture: true,
  capture_pageview: true,
  session_recording: {
    maskAllInputs: false,
  },
});

if (!import.meta.env.VITE_PUBLIC_POSTHOG_KEY) {
  console.warn('❗ PostHog key not found in env!');
}

// ✅ Slugify helper to format names for events
const slugify = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

export function App() {
  const [sessions, setSessions] = useState<AlumniSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<AlumniSession | null>(null);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedTransition, setSelectedTransition] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const touchStart = useRef(0);
  const touchEnd = useRef(0);
  const isTouching = useRef(false);
  const swipeTimeout = useRef<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const sessionsData = await DirectusService.getSessions();
        setSessions(sessionsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    setCurrentSlide(0);
  }, [selectedCompany, selectedProgram, selectedTransition]);

  const companies = [...new Set(sessions.map((s) => s.current_company))].sort();
  const programs = [...new Set(sessions.map((s) => s.program_name))].sort();
  const transitions = [...new Set(sessions.map((s) => s.alumni_transition).filter((item): item is string => item !== undefined))].sort();

  const filteredSessions = sessions.filter((session) => {
    const matchesCompany = !selectedCompany || session.current_company === selectedCompany;
    const matchesProgram = !selectedProgram || session.program_name === selectedProgram;
    const matchesTransition = !selectedTransition || session.alumni_transition === selectedTransition;
    return matchesCompany && matchesProgram && matchesTransition;
  });

  const filters = {
    selectedCompany,
    selectedProgram,
    selectedTransition,
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.targetTouches[0].clientX;
    isTouching.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEnd.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const minSwipeDistance = 75;
    const swipeDistance = touchStart.current - touchEnd.current;

    if (swipeTimeout.current) {
      clearTimeout(swipeTimeout.current);
    }

    swipeTimeout.current = window.setTimeout(() => {
      if (isTouching.current) {
        if (Math.abs(swipeDistance) > minSwipeDistance) {
          if (swipeDistance > 0) {
            setCurrentSlide((prev) =>
              prev === filteredSessions.length - 1 ? 0 : prev + 1
            );
          } else {
            setCurrentSlide((prev) =>
              prev === 0 ? filteredSessions.length - 1 : prev - 1
            );
          }
        } else {
          const session = filteredSessions[currentSlide];
          setSelectedSession(session);

          posthog.capture(`session_card_viewed_${slugify(session.alumni_name)}`, {
            session_id: session.id,
            name: session.alumni_name,
            company: session.current_company,
            program: session.program_name,
            filters,
          });
        }
      }
      isTouching.current = false;
    }, 100);
  };

  const handleSessionClick = (session: AlumniSession) => {
    setSelectedSession(session);

    posthog.capture(`session_card_clicked_${slugify(session.alumni_name)}`, {
      session_id: session.id,
      name: session.alumni_name,
      company: session.current_company,
      program: session.program_name,
      filters,
    });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
          <div className="flex items-center gap-3 text-red-600 mb-4">
            <AlertCircle className="w-6 h-6" />
            <h2 className="text-lg font-semibold">Error</h2>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <Filters
          companies={companies}
          programs={programs}
          transitions={transitions}
          selectedCompany={selectedCompany}
          selectedProgram={selectedProgram}
          selectedTransition={selectedTransition}
          sessions={sessions}
          onCompanyChange={setSelectedCompany}
          onProgramChange={setSelectedProgram}
          onTransitionChange={setSelectedTransition}
        />

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  filters={filters}
                  onClick={() => handleSessionClick(session)}
                />
              ))}
            </div>

            <div className="md:hidden">
              {filteredSessions.length > 0 && (
                <div className="relative">
                  <div
                    className="overflow-hidden touch-pan-y"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  >
                    <div className="w-full max-w-sm mx-auto px-4">
                      <SessionCard
                        session={filteredSessions[currentSlide]}
                        filters={filters}
                        onClick={() =>
                          handleSessionClick(filteredSessions[currentSlide])
                        }
                      />
                    </div>
                  </div>

                  <div className="flex justify-center gap-2 mt-4">
                    {[...Array(filteredSessions.length).keys()].map((index) => (
                      <button
                        key={index}
                        className={`h-2 rounded-full transition-all ${
                          currentSlide === index ? 'w-4 bg-blue-600' : 'w-2 bg-gray-300'
                        }`}
                        onClick={() => setCurrentSlide(index)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {filteredSessions.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              No alumni found with the selected filters.
            </p>
          </div>
        )}

        {selectedSession && (
          <DetailModal
            session={selectedSession}
            onClose={() => setSelectedSession(null)}
            filters={filters}
          />
        )}
      </div>
    </div>
  );
}
