import {writeFileSync} from 'fs';
import ObjectsToCsv = require('objects-to-csv');
import {join} from 'path';
import {Logger} from './Logger';
import {Partner, PartnerPortal} from './aws-partner';
import {Cache} from './cache';
import {CreditSafe} from './creditsafe';
import {config} from 'dotenv';
import {PartnerDataset} from './aws-partner/PartnerDataset';

const DATA_FOLDER = './data';

(async () => {
  config();
  const logger = new Logger();

  const removeCommas = (str: string) => str.replace(/,/g, '');

  const tier = 'Advanced';
  const type = 'Consulting Partner';
  const maxResults = 100;
  const country = 'Italy';
  const baseURL = 'https://api.finder.partners.aws.a2z.com/search';

  const cache = new Cache(
    {folder: DATA_FOLDER, maxAge: 1000 * 60 * 60 * 24 * 30},
    logger
  );

  const partnerPortal = new PartnerPortal(
    {
      apiUrl: baseURL,
    },
    logger,
    cache
  );

  const plist = await partnerPortal.fetchPartnerList(
    tier,
    type,
    country,
    maxResults
  );

  const partners: Partner[] = await partnerPortal.fetchPartners(
    tier,
    type,
    country,
    maxResults
  );

  const refiners: string[] = await partnerPortal.getRefiners(
    tier,
    type,
    country,
    maxResults
  );

  const partnerDataset = new PartnerDataset(partners, refiners, logger);

  writeFileSync(
    join(DATA_FOLDER, 'partners.csv'),
    await partnerDataset.dataset_partners()
  );

  writeFileSync(
    join(DATA_FOLDER, 'refiners.csv'),
    await partnerDataset.dataset_refiners()
  );

  writeFileSync(
    join(DATA_FOLDER, 'partner_numbers.csv'),
    await partnerDataset.dataset_partners()
  );

  writeFileSync(
    join(DATA_FOLDER, 'dataset_technologies.csv'),
    await partnerDataset.datasetTechnologies()
  );

  writeFileSync(
    join(DATA_FOLDER, 'dataset_qualifications.csv'),
    await partnerDataset.datasetQualifications()
  );

  writeFileSync(
    join(DATA_FOLDER, 'dataset_competencies.csv'),
    await partnerDataset.datasetCompetencies()
  );

  writeFileSync(
    join(DATA_FOLDER, 'dataset_industries.csv'),
    await partnerDataset.datasetIndustries()
  );

  writeFileSync(
    join(DATA_FOLDER, 'dataset_partner_programs.csv'),
    await partnerDataset.datasetPartnerPrograms()
  );

  writeFileSync(
    join(DATA_FOLDER, 'dataset_professional_services.csv'),
    await partnerDataset.datasetProfessionalServices()
  );

  writeFileSync(
    join(DATA_FOLDER, 'dataset_programs.csv'),
    await partnerDataset.datasetPrograms()
  );

  // await csv.toDisk(join('./data', 'refiners.csv'));

  // writeFileSync(join('data', 'partner.json'), JSON.stringify(list, null, 4));
})();
