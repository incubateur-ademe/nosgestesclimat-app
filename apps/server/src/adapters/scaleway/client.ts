import { S3Client } from '@aws-sdk/client-s3'
import { config } from '../../config.js'

export const client = new S3Client({
  credentials: {
    accessKeyId: config.thirdParty.scaleway.accessKeyId,
    secretAccessKey: config.thirdParty.scaleway.secretAccessKey,
  },
  endpoint: config.thirdParty.scaleway.endpoint,
  region: config.thirdParty.scaleway.region,
})
