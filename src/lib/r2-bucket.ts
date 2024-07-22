import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '~/configs/env.config';

const S3 = new S3Client({
  region: 'auto',
  endpoint: env.R2_ENDPOINT,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

export const createPutObjectPresignedUrl = async (
  key: string,
  expiresIn: number = 3600,
) => {
  return await getSignedUrl(
    S3,
    new PutObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: key }),
    { expiresIn },
  );
};

export const createGetObjectPresignedUrl = async (key: string) => {
  return await getSignedUrl(
    S3,
    new GetObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: key }),
  );
};

// getObjectPresignedUrl('test.txt')
//   .then((res) => {
//     console.log(res);
//   })
//   .catch((err) => {
//     console.error(err);
//   });

// S3.send(new ListObjectsV2Command({ Bucket: env.R2_BUCKET_NAME }))
//   .then((res) => {
//     console.log(res);
//   })
//   .catch((err) => {
//     console.error(err);
//   });
