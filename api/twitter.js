import { TWITTER_CONSUMER_KEY, TWITTER_CONSUMER_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_TOKEN_SECRET } from '../helper/constants.js'
import { TwitterApi } from 'twitter-api-v2';

export const tweet = async (text) => {
  const client = getAppClient();
  return await client.v2.tweet('[Bot] ' + text);
}

const getAppClient = () => {
  return new TwitterApi({
    appKey: TWITTER_CONSUMER_KEY,
    appSecret: TWITTER_CONSUMER_SECRET,
    accessToken: TWITTER_ACCESS_TOKEN,
    accessSecret: TWITTER_ACCESS_TOKEN_SECRET,
  });
}