import * as prismic from '@prismicio/client';

export const prismicClient = prismic.createClient(import.meta.env.VITE_PRISMIC_API_URL); 