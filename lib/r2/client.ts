import AWS from 'aws-sdk'

const r2 = new AWS.S3({
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  accessKeyId: process.env.R2_ACCESS_KEY_ID!,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  region: 'auto',
  signatureVersion: 'v4',
})

export const r2Bucket = process.env.R2_BUCKET_NAME!

export default r2

