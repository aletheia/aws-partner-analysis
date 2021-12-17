import axios from 'axios';
import {Cache} from '../cache';
import {Logger} from '../Logger';

export interface CreditSafeConfig {
  username: string;
  password: string;
}

export class CreditSafe {
  private authToken?: string;

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
        baseURL: 'https://connect.creditsafe.com/v1',
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
}
