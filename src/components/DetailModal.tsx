import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  Briefcase,
  Building2,
  GraduationCap,
  Linkedin,
  Download,
  TrendingUp,
  BookMarked,
} from 'lucide-react';
import type { AlumniSession } from '../types';
import { DirectusService } from '../services/directus';
import posthog from 'posthog-js';

interface DetailModalProps {
  session: AlumniSession;
  onClose: () => void;
  filters: {
    selectedCompany: string;
    selectedProgram: string;
    selectedTransition: string;
  };
}

// ✅ Slugify helper for clean event names
const slugify = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

export function DetailModal({ session, onClose, filters }: DetailModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showDownloadMessage, setShowDownloadMessage] = useState(false);

  // 🔁 Scroll depth tracking
  useEffect(() => {
    const handleScroll = () => {
      const container = modalRef.current;
      if (!container) return;

      const scrollY = container.scrollTop;
      const maxScroll = container.scrollHeight - container.clientHeight;
      const scrollPercent = Math.round((scrollY / maxScroll) * 100);

      posthog.capture(`modal_scroll_${slugify(session.alumni_name)}`, {
        session_id: session.id,
        name: session.alumni_name,
        company: session.current_company,
        program: session.program_name,
        scroll_percent: scrollPercent,
        filters,
      });
    };

    const container = modalRef.current;
    container?.addEventListener('scroll', handleScroll);
    return () => container?.removeEventListener('scroll', handleScroll);
  }, [session]);

  // ⏱ View time tracking
  useEffect(() => {
    const startTime = Date.now();
    return () => {
      const durationMs = Date.now() - startTime;
      posthog.capture(`modal_view_duration_${slugify(session.alumni_name)}`, {
        session_id: session.id,
        name: session.alumni_name,
        company: session.current_company,
        program: session.program_name,
        duration_seconds: Math.round(durationMs / 1000),
        filters,
      });
    };
  }, [session]);

  const trackEvent = (eventName: string, extra: Record<string, any> = {}) => {
    posthog.capture(`${eventName}_${slugify(session.alumni_name)}`, {
      session_id: session.id,
      name: session.alumni_name,
      company: session.current_company,
      program: session.program_name,
      filters,
      ...extra,
    });
  };

  const handleDownloadImage = () => {
    const downloadUrl = DirectusService.getAssetDownloadUrl(session.alumni_showcase);
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
      trackEvent('modal_image_downloaded');
      setShowDownloadMessage(true);
      setTimeout(() => setShowDownloadMessage(false), 2000);
    }
  };

  const handleLinkedInClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    trackEvent('linkedin_cta_clicked');
  };

  const handlePortfolioClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    trackEvent('portfolio_cta_clicked');
  };

  const generatePrefillLink = () => {
    let programValue = 'Fellowship Program in Software Development';
    if (session.program_name.includes('QA Automation') || session.program_name.includes('SDET')) {
      programValue = 'Fellowship Program in QA Automation (SDET)';
    } else if (session.program_name.includes('Backend') || session.program_name.includes('Fullstack')) {
      programValue = 'Fellowship Program in Software Development';
    }

    const prefilledData = {
      entry_1595370286: programValue,
      entry_49225849: session.alumni_name,
    };

    const baseUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSfcFgyYj-Mbh9xyteoSIDmTcFpNtZI-LYIJW6k0rk1hk4AuXA/viewform?usp=pp_url';
    const queryString = Object.entries(prefilledData)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');

    return `${baseUrl}&${queryString}`;
  };

  const handleScheduleSessionClick = () => {
    trackEvent('schedule_cta_clicked');
    const prefillLink = generatePrefillLink();
    window.open(prefillLink, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
      >
        <img
          src={DirectusService.getAssetUrl(session.alumni_image)}
          alt={session.alumni_name}
          loading="lazy"
          className={`w-full max-w-full max-h-[40vh] sm:max-h-[50vh] md:max-h-[60vh] object-contain transition-opacity duration-500 ${
            imageLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-md'
          }`}
          onLoad={() => setImageLoaded(true)}
        />

        <div className="absolute right-4 top-4 flex gap-2 z-10">
          <button
            onClick={handleDownloadImage}
            className="p-1 rounded-full bg-white shadow hover:bg-gray-100 transition"
            title="Download image"
            aria-label="Download image"
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-full bg-white shadow hover:bg-gray-100 transition"
            title="Close modal"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {showDownloadMessage && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-3 rounded shadow-md">
            <p className="text-gray-800">Download Started</p>
          </div>
        )}

        <div className="p-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold text-gray-900">{session.alumni_name}</h2>
            <a
              href={session.alumni_linkedin_profile}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
              onClick={handleLinkedInClick}
            >
              <Linkedin className="w-4 h-4" />
              LinkedIn Profile
            </a>
          </div>

          <div className="flex justify-between items-center text-sm text-gray-700 mb-2">
            <div className="flex items-center gap-1">
              <Briefcase className="w-4 h-4 text-gray-400" />
              <span>{session.current_role} at {session.current_company}</span>
            </div>
            {session.alumni_portfolio && (
              <a
                href={session.alumni_portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                onClick={handlePortfolioClick}
              >
                <BookMarked className="w-4 h-4" />
                Portfolio
              </a>
            )}
          </div>

          <div className="flex justify-between items-center text-sm text-gray-700 mb-2">
            <div className="flex items-center gap-1">
              <Building2 className="w-4 h-4 text-gray-400" />
              <span>Previously {session.previous_role}</span>
            </div>
            {session.hike_number !== null && session.previous_role !== 'Fresher' && (
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span className="font-semibold">{session.hike_number}% Hike</span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center gap-1 text-sm text-gray-700 mb-4">
            <div className="flex items-center gap-1">
              <GraduationCap className="w-4 h-4 text-gray-400" />
              <span>{session.program_name}</span>
            </div>
            {session.alumni_placement && (
              <span className="text-blue-600 font-semibold">
                {session.alumni_placement}
              </span>
            )}
          </div>

          {session.alumni_history && (
            <div className="bg-gray-50 p-3 rounded mt-3">
              <p className="text-xs text-gray-500 mb-1">Alumni History</p>
              <div
                className="text-sm text-gray-900"
                dangerouslySetInnerHTML={{ __html: session.alumni_history }}
              />
            </div>
          )}
        </div>

        <div className="sticky bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 z-20">
          <button
            onClick={handleScheduleSessionClick}
            className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 text-sm"
          >
            Schedule a 1:1 Alumni Session
          </button>
        </div>
      </div>
    </div>
  );
}
