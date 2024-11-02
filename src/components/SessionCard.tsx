import React from 'react';
import { Linkedin } from 'lucide-react';
import type { AlumniSession } from '../types';
import { DirectusService } from '../services/directus';

interface SessionCardProps {
  session: AlumniSession;
  onClick: () => void;
}

export function SessionCard({ session, onClick }: SessionCardProps) {
  // Track card opening event
  const handleCardClick = () => {
    onClick();
    trackEvent(`alumni_card_${session.id}_open_modal`, 'open_modal');
  };

  // Track LinkedIn profile click event
  const handleLinkedInClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the click from bubbling up to the card
    trackEvent(`alumni_card_${session.id}_view_linkedin`, 'view_linkedin');
  };

  // Tracking function using gtag
  const trackEvent = (eventName: string, action: string) => {
    if (window.gtag) {
      window.gtag('event', action, {
        event_category: 'Alumni Card',
        event_label: eventName,
        value: session.id,
      });
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="relative bg-cover bg-center rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer overflow-hidden group"
      style={{
        backgroundImage: `url(${DirectusService.getAssetUrl(session.alumni_showcase)})`,
        height: '300px', // Set a fixed height for the card
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-50" />

      {/* Content */}
      <div className="relative z-10 p-6 flex flex-col justify-end h-full text-white">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold">{session.alumni_name}</h3>
          <a
            href={session.alumni_linkedin_profile}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-500 transition-colors"
            onClick={handleLinkedInClick}
            title="View LinkedIn Profile"
          >
            <Linkedin className="w-5 h-5" />
          </a>
        </div>
        <p className="text-white font-medium">{session.current_role}</p>
        <p className="text-gray-300 text-sm">{session.current_company}</p>
      </div>
    </div>
  );
}