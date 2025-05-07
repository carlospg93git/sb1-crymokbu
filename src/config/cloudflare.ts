export const cloudflareConfig = {
  accountId: import.meta.env.VITE_CLOUDFLARE_ACCOUNT_ID || '',
  bucketName: 'bucket-wedding',
  workerUrl: import.meta.env.VITE_CLOUDFLARE_WORKER_URL || '',
}; 