import axios from 'axios';
import {PartnerTO} from '.';
import {Cache} from '../cache';
import {Logger} from '../Logger';
import {Partner} from './Partner';

export interface PartnerPortalConfig {
  apiUrl: string;
  highlight: string;
  locale: string;
}

export class PartnerPortal {
  constructor(
    protected config: Partial<PartnerPortalConfig>,
    protected logger: Logger,
    protected cache?: Cache
  ) {
    const defaultConfig = {
      apiUrl: 'https://api.finder.partners.aws.a2z.com/search',
      highlight: 'on',
      locale: 'en',
    };

    this.cache = cache;

    const portalConfig: PartnerPortalConfig = Object.assign(
      {},
      defaultConfig,
      this.config
    );
    this.config = portalConfig;
  }

  async fetchPartnerList(
    tier: string,
    type: string,
    country: string,
    maxResults = 100
  ): Promise<{_id: string}[]> {
    let list;
    if (this.cache) {
      this.logger.info('Fetching partner list from cache');
      list = (await this.cache.get('partnerList')) as {_id: string}[];
      if (list) {
        this.logger.info('Found cached partner list');
        return list;
      }
    }

    this.logger.info(`Fetching partners from ${this.config.apiUrl}`);
    const res = await axios({
      baseURL: this.config.apiUrl,
      method: 'GET',
      params: {
        locale: 'en',
        sourceFilter: 'searchPage',
        highlight: 'on',
        size: maxResults,
        location: country,
        pTier: tier,
        pType: type,
      },
    });

    list = res.data.message.results;
    if (this.cache) {
      this.logger.info('Saving partner list to cache');
      this.cache.save('partnerList', list);
    }
    return list;
  }

  sanitizePartner(partner: PartnerTO): Partner {
    const sanitized: Partner = {
      id: partner.id,
      name: partner.name,
      type: partner.customer_type,
      logoUrl: partner.download_url,
      description: partner.description,
      tier: partner.current_program_status,
      website: partner.website,
      references: partner.references,
      technology: partner.technology_expertise,
      practices: partner.solutions_practice_count,
      clients: partner.target_client_base,
      timestamp: partner.timestamp,
      language: partner.language,
      industry: partner.industry,
      refiners: partner.refiners,
      employees: partner.numberofemployees,
      launches: partner.customer_launches_count,
      partner_programs: partner.partner_path,
      professional_services: partner.professional_service_types,
      socio_economic_categories: partner.socio_economic_categories,
      solutions: partner.solutions,
      competency: partner.competency_membership,
      public_sector: {
        contract_urls: partner.public_sector_contract_urls,
        categories: partner.public_sector_categories_count,
        program_categories: partner.public_sector_program_categories,
        contract: partner.public_sector_contract_count,
        contract_names: partner.public_sector_contract_names,
      },
      programs: partner.program_membership,
      offices: partner.office_address,
      qualifications: partner.aws_certifications,
      certified_individuals: partner.aws_certifications_count,
      use_cases: partner.use_case_expertise,
      aws_services_membership: partner.service_membership,
    };
    return sanitized;
  }

  async fetchPartners(
    tier: string,
    type: string,
    country: string,
    maxResults = 100
  ): Promise<Partner[]> {
    if (this.cache) {
      this.logger.info('Fetching partners from cache');
      const cached = (await this.cache.get('partners')) as Partner[];
      if (cached) {
        this.logger.info('Found cached partners');
        return cached;
      }
    }

    const res = await axios({
      baseURL: this.config.apiUrl,
      method: 'GET',
      params: {
        locale: 'en',
        sourceFilter: 'detailPage',
        highlight: 'on',
        pTier: tier,
        pType: type,
        size: maxResults,
        location: country,
      },
    });

    const resultList = res.data.message.results as {
      _id: string;
      _source: PartnerTO;
    }[];
    const partners = resultList.map(({_id, _source}) =>
      this.sanitizePartner(Object.assign({}, _source, {id: _id}))
    );

    if (this.cache) {
      this.logger.info('Saving partners to cache');
      this.cache.save('partners', partners);
    }
    return partners;
  }

  async getRefiners(
    tier: string,
    type: string,
    country: string,
    maxResults = 100
  ): Promise<string[]> {
    const res = await axios({
      baseURL: this.config.apiUrl,
      method: 'GET',
      params: {
        locale: 'en',
        sourceFilter: 'detailPage',
        highlight: 'on',
        pTier: tier,
        pType: type,
        size: maxResults,
        location: country,
      },
    });

    const refiners = res.data.message.refiners;
    return refiners;
  }
}
