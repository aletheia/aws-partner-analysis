import {existsSync, mkdirSync, readFile as rf, writeFile as wf} from 'fs';
import {Logger} from '../Logger';
import {promisify} from 'util';
import {join} from 'path';

const writeFile = promisify(wf);
const readFile = promisify(rf);

export interface CacheConfig {
  folder: string;
  maxAge?: number;
}

export class Cache {
  constructor(
    protected readonly config: CacheConfig,
    protected readonly logger: Logger
  ) {
    this.config = config;
    this.logger = logger;
    existsSync(this.config.folder) || mkdirSync(this.config.folder);
  }

  async save(key: string, data: unknown): Promise<void> {
    const timestamp = new Date().getTime();
    const cached = {
      timestamp,
      data,
    };
    return writeFile(
      join(this.config.folder, `${key}.json`),
      JSON.stringify(cached)
    );
  }

  async get(key: string): Promise<unknown> {
    const file = join(this.config.folder, `${key}.json`);
    if (!existsSync(file)) return null;
    const cached = JSON.parse(await readFile(file, 'utf8'));
    const timestamp = new Date().getTime();
    const age = timestamp - cached.timestamp;
    if (this.config.maxAge && age > this.config.maxAge) {
      this.logger.debug(`Cache expired for ${key}`);
      return null;
    }
    this.logger.debug(`Cache hit for ${key}`);
    return cached.data;
  }
}
