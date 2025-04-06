import React from 'react';
import type { AlumniSession } from '../types';
import { DirectusService } from '../services/directus';
import posthog from 'posthog-js';

interface SessionCardProps {
  session: AlumniSession;
  onClick: () => void;
  filters: {
    selectedCompany: string;
    selectedProgram: string;
    selectedTransition: string;
  };
}

// ✅ Helper to slugify the alumni name for cleaner event names
const slugify = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

export function SessionCard({ session, onClick, filters }: SessionCardProps) {
  const handleCardClick = () => {
    posthog.capture(`session_card_clicked_${slugify(session.alumni_name)}`, {
      session_id: session.id,
      name: session.alumni_name,
      company: session.current_company,
      program: session.program_name,
      filters,
    });

    onClick();
  };

  return (
    <div
      onClick={handleCardClick}
      className="relative bg-cover bg-center rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 cursor-pointer overflow-hidden group transform hover:scale-101"
      style={{
        backgroundImage: `url(${DirectusService.getAssetUrl(session.alumni_showcase)})`,
        width: '100%',
        paddingBottom: '100%',
      }}
    />
  );
}
