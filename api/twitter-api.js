import { TWITTER_CONSUMER_KEY, TWITTER_CONSUMER_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_TOKEN_SECRET } from '../helper/constants.js'
import { TwitterApi as TwitterApiV2 } from 'twitter-api-v2';

export default class TwitterApi {

  static async tweet(text) {
    const client = this.#getAppClient();
    return await client.v2.tweet('[Bot] ' + text);
  }

  static #getAppClient() {
    return new TwitterApiV2({
      appKey: TWITTER_CONSUMER_KEY,
      appSecret: TWITTER_CONSUMER_SECRET,
      accessToken: TWITTER_ACCESS_TOKEN,
      accessSecret: TWITTER_ACCESS_TOKEN_SECRET,
    });
  }
}

