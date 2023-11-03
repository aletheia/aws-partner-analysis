import axios from 'axios';
import {base64decode, base64encode} from 'nodejs-base64';
import {Cache} from '../cache';
import {Logger} from '../Logger';

export interface CreditSafeConfig {
  username: string;
  password: string;
}

export enum OfficeType {
  Registered,
  Trading,
  HeadOffice,
  Branch,
  Subsidiary,
  Franchise,
  Franchisor,
  SingleOffice,
}

export enum CompanyStatus {
  Active,
  NonActive,
  Pending,
  Other,
}

export enum CompanyType {
  NotSet,
  Ltd,
  NonLtd,
}

export interface CompanySearchParams {
  countries: string[];
  page?: number;
  pageSize?: number;
  language?: string;
  id?: string;
  safeNumber?: string;
  registryNumber?: string;
  vatNumber?: string;
  name?: string;
  tradeName?: string;
  acronym?: string;
  exactMatch?: boolean;
  address?:
    | string
    | {
        street?: string;
        city?: string;
        zip?: string;
        province?: string;
        number: string;
      };

  callReference?: string;
  officeType?: OfficeType;
  phone?: string;
  status?: CompanyStatus;
  type?: CompanyType;
  website?: string;
  customData?: string;
}

export interface Company {
  id: string;
  safeNumber: string;
  registryNumber: string;
  vatNumber: string;
  name: string;
  address: object;
  status: CompanyStatus;
  officeType: OfficeType;
  type: CompanyType;
  dateOfLatestChange: string;
  dateOfLatestAccounts: string;
  activityCode: string;
}

export class CreditSafe {
  private authToken?: string;
  private baseUrl = 'https://connect.creditsafe.com/v1';

  constructor(
    protected config: CreditSafeConfig,
    protected logger: Logger,
    protected cache?: Cache
  ) {
    this.logger = logger;
    this.config = config;
  }

  async getAuthToken(): Promise<string> {
    if (!this.authToken) {
      const res = await axios({
        baseURL: this.baseUrl,
        method: 'POST',
        url: 'authenticate',
        data: {
          username: this.config.username,
          password: this.config.password,
        },
      });
      this.authToken = res.data.token;
      if (!this.authToken) {
        throw new Error('Cannot retrieve auth token');
      }
    }
    return this.authToken;
  }

  async subscriptionDetails() {
    try {
      const res = await axios({
        baseURL: this.baseUrl,
        method: 'GET',
        url: 'access',
        headers: {
          Authorization: `Bearer ${await this.getAuthToken()}`,
        },
      });
      const data = res.data;
      return data;
    } catch (e) {
      const error = e as Error;
      this.logger.error(error.message);
      console.log(e);
      throw error;
    }
  }

  async getReport(params: {
    connectId: string;
    language?: string;
    template?: string;
    customData?: string;
    callRef?: string;
  }) {
    this.logger.info(`Getting report for ${params.connectId}`);
    if (this.cache) {
      this.logger.info('Searching for report in cache');
      const cacheKey = String(base64encode(JSON.stringify(params)));
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        this.logger.info('Found report in cache');
        return cached as string;
      }
    }

    try {
      const token = await this.getAuthToken();

      const res = await axios({
        baseURL: this.baseUrl,
        method: 'GET',
        url: `companies/${params.connectId}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          language: params.language,
          template: params.template,
          customData: params.customData,
          callRef: params.callRef,
        },
      });

      const data = res.data;
      if (this.cache) {
        this.logger.info('Caching report');
        const cacheKey = String(base64encode(JSON.stringify(params)));
        await this.cache.save(cacheKey, data);
      }
      return data;
    } catch (e) {
      const error = e as Error;
      this.logger.error(error.message);
      console.log(error);
      throw error;
    }
  }

  async searchCompany(params: CompanySearchParams): Promise<Company[]> {
    if (this.cache) {
      this.logger.info('Searching for companies in cache');
      const cacheKey = String(base64encode(JSON.stringify(params)));
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        this.logger.info('Found companies in cache');
        return cached as Company[];
      }
    }

    const token = await this.getAuthToken();

    const data = {
      countries: params.countries.join(','),
      page: params.page,
      pageSize: params.pageSize,
      language: params.language,
      id: params.id,
      safeNo: params.safeNumber,
      regNo: params.registryNumber,
      vatNo: params.vatNumber,
      name: params.name,
      tradeName: params.tradeName,
      acronym: params.acronym,
      exact: params.exactMatch,
      address: typeof params.address === 'string' ? params.address : undefined,
      street:
        params.address && typeof params.address === 'object'
          ? params.address.street
          : undefined,
      houseNo:
        params.address && typeof params.address === 'object'
          ? params.address.number
          : undefined,
      city:
        params.address && typeof params.address === 'object'
          ? params.address.city
          : undefined,
      postCode:
        params.address && typeof params.address === 'object'
          ? params.address.zip
          : undefined,
      province:
        params.address && typeof params.address === 'object'
          ? params.address.province
          : undefined,
      callRef: params.callReference,
      officeType: params.officeType ? OfficeType[params.officeType] : undefined,
      phoneNo: params.phone,
      type: params.type ? CompanyType[params.type] : undefined,
      status: params.status ? CompanyStatus[params.status] : undefined,
      website: params.website,
      customData: params.customData,
    };

    try {
      const res = await axios({
        baseURL: this.baseUrl,
        method: 'GET',
        url: 'companies',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: data,
      });

      const companies = res.data.companies as unknown as Company[];

      if (this.cache) {
        this.logger.info('Caching companies');
        const cacheKey = String(base64encode(JSON.stringify(params)));
        await this.cache.save(cacheKey, companies);
      }
      return companies;
    } catch (e) {
      const error = e as Error;
      this.logger.error(error.message);
      console.log(error);
      throw e;
    }
  }

  async searchCompanyReports(params: CompanySearchParams): Promise<string[]> {
    this.logger.info('Searching for reports');
    const companies = await this.searchCompany(params);
    const reports = [];
    for (const company of companies) {
      const report = await this.getReport({
        connectId: company.id,
      });
      reports.push(report);
    }
    return reports;
  }
}
