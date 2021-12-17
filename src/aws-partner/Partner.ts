export interface Solution {
  description: string;
  offering_status: string;
  refiners: string[];
  availability: string;
  title: string;
  solution_id: string;
  record_type: string;
  solution_url_dup: string;
  solution_name: string[];
  offering_type: string;
  proposition: string;
  created_date: Date;
  solution_url: string;
}

export interface Reference {
  reference_id: string;
  description: string;
  reference_url: string;
  customer_name: string;
  title: string;
  record_type: string;
}

export interface Address {
  country: string;
  latlon: {
    lon: number;
    lat: number;
  };
  city: string;
  street: string;
  postalcode: string;
}

export interface Partner {
  id: string;
  name: string;
  type: string;
  logoUrl: string;
  description: string;
  tier: string;
  website: string;
  references: Reference[];
  technology: string[];
  practices: number;
  clients: string[];
  timestamp: Date;
  language: string;
  industry: string[];
  refiners: string[];
  employees: number;
  launches: number;
  partner_programs: string[];
  professional_services: string[];
  socio_economic_categories: string[];
  solutions: Solution[];
  competency: string[];
  offices: Address[];
  programs: string[];
  public_sector?: {
    contract_urls: {
      name: string;
      landing_url: string;
    }[];
    categories: number;
    program_categories: string[];
    contract: number;
    contract_names: string[];
  };
  aws_services_membership: string[];
  certifications: string[];
  use_cases: string[];
  credit_status?: {
    score: number;
  };
}

export interface PartnerTO {
  id: string;
  customer_type: string;
  aws_certifications_count: number;
  partner_active: boolean;
  references: Reference[];
  technology_expertise: string[];
  solutions_practice_count: number;
  description: string;
  target_client_base: string[];
  language: string;
  industry: string[];
  refiners: string[];
  solutions_solution_count: number;
  numberofemployees: number;
  customer_launches_count: number;
  download_url: string;
  partner_path: string[];
  services_count: number;
  professional_service_types: string[];
  literal_name: string;
  references_reference_count: number;
  solution_count: number;
  current_program_status: string;
  socio_economic_categories: string[];
  timestamp: Date;
  is_saas_vendor: string;
  programs_count: number;
  website: string;
  solutions: Solution[];
  brief_description: string;
  public_sector_contract_urls: {
    name: string;
    landing_url: string;
  }[];
  competencies_count: number;
  public_sector_categories_count: number;
  references_casestudy_count: number;
  competency_membership: string[];
  office_address: Address[];
  public_sector_program_categories: string[];
  office_address_aka: Address[];
  public_sector_contract_count: number;
  program_membership: string[];
  domain: string[];
  partner_validated: boolean;
  name: string;
  public_sector_contract_names: string[];
  service_membership: string[];
  name_aka: string[];
  reference_count: number;
  aws_certifications: string[];
  use_case_expertise: string[];
}
