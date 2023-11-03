import ObjectsToCsv = require('objects-to-csv');
import {Partner} from '.';
import {Logger} from '../Logger';

interface Json {
  [key: string]: string | number | boolean | Json;
}

export class PartnerDataset {
  constructor(
    protected partners: Partner[],
    protected refiners: string[],
    protected logger: Logger
  ) {
    this.partners = partners.sort((a: Partner, b: Partner) => {
      return a.name.localeCompare(b.name, undefined, {numeric: true});
    });
    this.refiners = refiners.sort();
    this.logger = logger;
  }

  dataset_refiners(): string {
    let csv = 'Name,';
    this.refiners.forEach(refiner => {
      csv += `${refiner.split(',').join(' ')},`;
    });
    csv += '\n';

    this.partners.forEach(partner => {
      csv += `${partner.name.split(',').join(' ')},`;
      this.refiners.forEach(refiner => {
        if (partner.refiners && partner.refiners.includes(refiner)) {
          csv += '1,';
        } else {
          csv += '0,';
        }
      });
      csv += '\n';
    });
    return csv;
  }

  async dataset_partners(): Promise<string> {
    const partners = this.partners.map(partner => {
      let international = false;
      partner.offices.forEach(office => {
        if (office.country !== 'Italy') {
          international = true;
        }
      });
      return {
        name: partner.name,
        launches: partner.launches,
        professional_services: partner.professional_services
          ? partner.professional_services.length
          : 0,
        solutions: partner.solutions ? partner.solutions.length : 0,
        competencies: partner.competency ? partner.competency.length : 0,
        certifications: partner.certified_individuals
          ? partner.certified_individuals
          : 0,
        qualifications: partner.qualifications
          ? partner.qualifications.length
          : 0,
        programs: partner.programs ? partner.programs.length : 0,
        use_cases: partner.use_cases ? partner.use_cases.length : 0,
        international: international,
        references: partner.references ? partner.references.length : 0,
      };
    });
    return new ObjectsToCsv(partners).toString();
  }

  async datasetTechnologies(): Promise<string> {
    return this.buildDatasetForMetric('technology');
  }

  async datasetIndustries(): Promise<string> {
    return this.buildDatasetForMetric('industry');
  }

  async datasetProfessionalServices(): Promise<string> {
    return await this.buildDatasetForMetric('professional_services');
  }

  async datasetPrograms(): Promise<string> {
    return await this.buildDatasetForMetric('programs');
  }

  async datasetAWSMembership(): Promise<string> {
    return await this.buildDatasetForMetric('aws_services_membership');
  }

  async datasetQualifications(): Promise<string> {
    return await this.buildDatasetForMetric('qualifications');
  }

  async datasetCompetencies(): Promise<string> {
    return await this.buildDatasetForMetric('competency');
  }

  async datasetPartnerPrograms(): Promise<string> {
    return await this.buildDatasetForMetric('use_cases');
  }

  async buildDatasetForMetric(metric: string): Promise<string> {
    let csv = 'Name,';

    const techSet: Json = {};
    this.partners.forEach((partner: Partner) => {
      const metricArray = partner[metric];
      if (metricArray && Array.isArray(metricArray)) {
        metricArray.forEach((m: string) => {
          techSet[m] = m;
        });
      } else {
        partner[metric] = [];
      }
    });
    const metricListvalues = Object.keys(techSet).sort();
    csv += `${metricListvalues.join(',')},\n`;

    this.partners.forEach(partner => {
      csv += `${partner.name.split(',').join(' ')},`;
      metricListvalues.forEach(m => {
        const metricArray = partner[metric];
        if (metricArray && Array.isArray(metricArray)) {
          if (metricArray.includes(m)) {
            csv += '1,';
          } else {
            csv += '0,';
          }
        }
      });
      csv += '\n';
    });
    return csv;
  }
}
