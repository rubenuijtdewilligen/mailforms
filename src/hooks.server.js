import PocketBase from 'pocketbase';
import { env } from '$env/dynamic/public';

export const handle = async ({ event, resolve }) => {
  event.locals.pb = new PocketBase(env.PUBLIC_POCKETBASE_URL || 'https://localhost:8090');

  const response = await resolve(event);
  return response;
};
