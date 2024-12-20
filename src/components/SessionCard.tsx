import React from 'react';
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
      className="relative bg-cover bg-center rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 cursor-pointer overflow-hidden group transform hover:scale-101" // Added hover effect and scale
      style={{
        backgroundImage: `url(${DirectusService.getAssetUrl(session.alumni_showcase)})`,
        width: '100%',    // Maintain responsive layout in the grid
        paddingBottom: '100%', // Ensures 1:1 aspect ratio
      }}
    >
      {/* Removed overlay */}
    </div>
  );
}