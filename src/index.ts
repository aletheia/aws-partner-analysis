import {writeFileSync} from 'fs';
import ObjectsToCsv = require('objects-to-csv');
import {join} from 'path';
import {Logger} from './Logger';
import {PartnerPortal} from './aws-partner';
import {Cache} from './cache';
import {CreditSafe} from './creditsafe';
import {config} from 'dotenv';

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

  const {CREDITSAFE_USERNAME: username, CREDITSAFE_PASSWORD: password} =
    process.env;

  if (username && password) {
    const creditSafe = new CreditSafe(
      {
        username,
        password,
      },
      logger,
      cache
    );
    const token = await creditSafe.getAuthToken();
    console.log(token);
  }
  // const list = await partnerPortal.fetchPartners(
  //   tier,
  //   type,
  //   country,
  //   maxResults
  // );

  // logger.log(`Found ${list.length} partners`);

  // const csv = new ObjectsToCsv(list);
  // await csv.toDisk(join('./data', 'partners.csv'));

  // writeFileSync(join('data', 'partner.json'), JSON.stringify(list, null, 4));
})();
