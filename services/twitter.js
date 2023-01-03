import { TwitterApi } from 'twitter-api-v2';

export default class Twitter {

  static async tweet(text) {
    const client = this.#getAppClient();
    if (process.env.APP_ENV == 'production') {
      return await client.v2.tweet('[Bot] ' + text);
    } else {
      return false;
    }
  }

  static async dailyUpdate(text, imagePath) {
    const client = this.#getAppClient();
    const imageId = await client.v1.uploadMedia(imagePath);
    const params = {
      media: { media_ids: [ imageId ] }
    };
    if (process.env.APP_ENV == 'production') {
      return await client.v2.tweet('[Bot] ' + text, params);
    } else {
      return false;
    }
  }

  static #getAppClient() {
    return new TwitterApi({
      appKey: process.env.TWITTER_CONSUMER_KEY,
      appSecret: process.env.TWITTER_CONSUMER_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    });
  }
}

