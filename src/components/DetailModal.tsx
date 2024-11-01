import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  Briefcase,
  Building,
  GraduationCap,
  Linkedin,
  Download,
  TrendingUp,
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
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    async function fetchImageUrl() {
      const url = await DirectusService.getAssetUrl(session.alumni_image);
      setImageUrl(url);
    }
    fetchImageUrl();
  }, [session.alumni_image]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleDownloadImage = async () => {
    const downloadUrl = await DirectusService.getAssetDownloadUrl(session.alumni_showcase);
    window.open(downloadUrl, '_blank');
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="relative">
          <div className="absolute right-4 top-4 flex gap-2">
            <button
              onClick={handleDownloadImage}
              className="p-2 rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors"
              title="Download image"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {imageUrl && (
            <img
              src={imageUrl}
              alt={session.alumni_name}
              loading="lazy"
              onLoad={handleImageLoad}
              className={`w-full h-64 object-cover transition-opacity duration-500 ${
                imageLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-md'
              }`}
            />
          )}
        </div>

        <div className="p-6">
          {/* Adjusted spacing between name and role */}
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold text-gray-900">{session.alumni_name}</h2>
            <div className="flex flex-col items-end gap-2">
              <a
                href={session.alumni_linkedin_profile}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Linkedin className="w-5 h-5" />
                LinkedIn Profile
              </a>
              {/* Conditionally render hike only if previous role is not 'Fresher' */}
              {session.previous_role !== 'Fresher' && (
                <div className="flex items-center gap-2 text-green-600">
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-semibold">{session.hike_number}% Hike</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Briefcase className="w-5 h-5 text-gray-400" />
              <span>
                {session.current_role} at {session.current_company}
              </span>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <Building className="w-5 h-5 text-gray-400" />
              <span>Previously {session.previous_role}</span>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <GraduationCap className="w-5 h-5 text-gray-400" />
              <span>{session.program_name}</span>
            </div>
          </div>

          <div className="flex flex-col gap-4 mb-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500 mb-2">Alumni History</p>
              <div
                className="prose prose-sm max-w-none text-gray-900"
                dangerouslySetInnerHTML={{ __html: session.alumni_history }}
              />
            </div>
          </div>

          <button
            onClick={() =>
              window.open(
                'https://docs.google.com/forms/d/e/1FAIpQLSfcFgyYj-Mbh9xyteoSIDmTcFpNtZI-LYIJW6k0rk1hk4AuXA/viewform',
                '_blank'
              )
            }
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Schedule a 1:1 Alumni Session
          </button>
        </div>
      </div>
    </div>
  );
}