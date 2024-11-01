import React, { useState } from 'react';
import { Linkedin } from 'lucide-react';
import type { AlumniSession } from '../types';
import { DirectusService } from '../services/directus';

interface SessionCardProps {
  session: AlumniSession;
  onClick: () => void;
}

export function SessionCard({ session, onClick }: SessionCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer overflow-hidden group"
    >
      <div className="aspect-w-16 aspect-h-9 relative">
        <img
          src={DirectusService.getAssetUrl(session.alumni_showcase)}
          alt={session.alumni_name}
          loading="lazy"
          onLoad={handleImageLoad}
          className={`object-cover w-full h-48 transition-opacity duration-500 ${imageLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-md'}`}
        />
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold text-gray-900">
            {session.alumni_name}
          </h3>
          <a
            href={session.alumni_linkedin_profile}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 transition-colors"
            onClick={(e) => {
              e.stopPropagation(); // Prevent the click from bubbling up to the card
            }}
            title="View LinkedIn Profile" // Added title for accessibility
          >
            <Linkedin className="w-5 h-5" />
          </a>
        </div>
        <p className="text-gray-600 font-medium">
          {session.current_role}
        </p>
        <p className="text-gray-500 text-sm">
          {session.current_company}
        </p>
      </div>
    </div>
  );
}