export interface AlumniSession {
  id: string;
  status: string;
  alumni_image: string;
  alumni_showcase: string;
  alumni_name: string;
  program_name: string;
  alumni_history: string;
  alumni_linkedin_profile: string;
  alumni_portfolio?: string; // New optional field for portfolio link
  alumni_transition?: string; // New optional field for transition
  alumni_placement?: string;
  previous_role: string;
  current_role: string;
  current_company: string;
  hike_number: number;
  date_created: string;
  date_updated: string;
}

export interface DirectusResponse<T> {
  data: T[];
}

export interface DirectusError {
  errors: Array<{
    message: string;
    extensions: {
      code: string;
    };
  }>;
}
