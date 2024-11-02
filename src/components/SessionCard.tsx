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
      className="relative bg-cover bg-center rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer overflow-hidden group"
      style={{
        backgroundImage: `url(${DirectusService.getAssetUrl(session.alumni_showcase)})`,
        width: '100%',    // Set to 100% to fit in the grid
        paddingBottom: '100%', // Maintains 1:1 aspect ratio by making height equal to width
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-50" />
    </div>
  );
}