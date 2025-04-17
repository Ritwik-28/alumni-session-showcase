import React from 'react';
import { ChevronDown } from 'lucide-react';
import type { AlumniSession } from '../types';

interface FiltersProps {
  companies: string[];
  programs: string[];
  transitions: string[];
  selectedCompany: string;
  selectedProgram: string;
  selectedTransition: string;
  sessions: AlumniSession[];
  onCompanyChange: (company: string) => void;
  onProgramChange: (program: string) => void;
  onTransitionChange: (transition: string) => void;
}

export function Filters({
  companies,
  programs,
  transitions,
  selectedCompany,
  selectedProgram,
  selectedTransition,
  sessions,
  onCompanyChange,
  onProgramChange,
  onTransitionChange,
}: FiltersProps) {
  // Get available programs for selected company
  const availablePrograms = selectedCompany
    ? [...new Set(sessions
        .filter(s => s.current_company === selectedCompany)
        .map(s => s.program_name))].sort()
    : programs;

  // Get available companies for selected program
  const availableCompanies = selectedProgram
    ? [...new Set(sessions
        .filter(s => s.program_name === selectedProgram)
        .map(s => s.current_company))].sort()
    : companies;

  // Get available transitions based on other filters
  const availableTransitions = selectedCompany || selectedProgram
    ? [...new Set(sessions
        .filter(s => 
          (!selectedCompany || s.current_company === selectedCompany) &&
          (!selectedProgram || s.program_name === selectedProgram))
        .map(s => s.alumni_transition))].sort()
    : transitions;

  return (
    <div className="flex flex-col items-center gap-4 mb-12 sticky top-0 bg-white z-10 shadow rounded-lg p-4">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Book Alumni Session
      </h1>
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Company Filter */}
        <div className="relative">
          <select
            value={selectedCompany}
            onChange={(e) => onCompanyChange(e.target.value)}
            className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-8 w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Companies</option>
            {availableCompanies.map((company) => (
              <option key={company} value={company}>
                {company}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>

        {/* Program Filter */}
        <div className="relative">
          <select
            value={selectedProgram}
            onChange={(e) => onProgramChange(e.target.value)}
            className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-8 w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Programs</option>
            {availablePrograms.map((program) => (
              <option key={program} value={program}>
                {program}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>

        {/* Transition Filter */}
        <div className="relative">
          <select
            value={selectedTransition}
            onChange={(e) => onTransitionChange(e.target.value)}
            className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-8 w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">View All Transitions</option>
            {availableTransitions.map((transition) => (
              <option key={transition} value={transition}>
                {transition}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}