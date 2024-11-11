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

interface DetailModalProps {
  session: AlumniSession;
  onClose: () => void;
}

export function DetailModal({ session, onClose }: DetailModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showDownloadMessage, setShowDownloadMessage] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose(); // Close modal when clicking outside
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleDownloadImage = () => {
    const downloadUrl = DirectusService.getAssetDownloadUrl(session.alumni_showcase);
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
      trackEvent(`modal_${session.id}_download_image`, 'download_image');
      setShowDownloadMessage(true);
      setTimeout(() => setShowDownloadMessage(false), 2000);
    }
  };

  const handleLinkedInClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    trackEvent(`modal_${session.id}_view_linkedin`, 'view_linkedin');
  };

  const handlePortfolioClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    trackEvent(`modal_${session.id}_view_portfolio`, 'view_portfolio');
  };

  const generatePrefillLink = () => {
    // Determine the value for entry.1595370286 based on program_name
    let programValue = 'Fellowship Program in Software Development';
    if (session.program_name.includes('QA Automation') || session.program_name.includes('SDET')) {
      programValue = 'Fellowship Program in QA Automation (SDET)';
    } else if (session.program_name.includes('Backend') || session.program_name.includes('Fullstack')) {
      programValue = 'Fellowship Program in Software Development';
    }

    // Prefill data for Google Form fields
    const prefilledData = {
      entry_1595370286: programValue, // Program name value
      entry_49225849: session.alumni_name, // Alumni name
    };

    const baseUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSfcFgyYj-Mbh9xyteoSIDmTcFpNtZI-LYIJW6k0rk1hk4AuXA/viewform?usp=pp_url';
    const queryString = Object.entries(prefilledData)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
    
    return `${baseUrl}&${queryString}`;
  };

  const handleScheduleSessionClick = () => {
    const prefillLink = generatePrefillLink();
    window.open(prefillLink, '_blank');
  };

  const trackEvent = (eventName: string, action: string) => {
    if (window.gtag) {
      window.gtag('event', action, {
        event_category: 'Modal Interaction',
        event_label: eventName,
        value: session.id,
      });
    }
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
        
        {/* Button Container */}
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

        {/* Temporary download message */}
        {showDownloadMessage && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-3 rounded shadow-md">
            <p className="text-gray-800">Download Started</p>
          </div>
        )}

        <div className="p-4">
          {/* Alumni Name and LinkedIn CTA */}
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

          {/* Current Role/Company and Portfolio CTA */}
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

          {/* Previous Role and Hike % */}
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

          {/* Program Name and Alumni Placement */}
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

          {/* Alumni History */}
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

        {/* Fixed CTA inside modal */}
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