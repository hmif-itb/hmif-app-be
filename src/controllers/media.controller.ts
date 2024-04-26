import { createPresignedUrl } from '~/routes/media.route';
import { createAuthRouter } from './router-factory';
import { createPutObjectPresignedUrl } from '~/lib/r2-bucket';
import { createId } from '@paralleldrive/cuid2';
import { env } from '~/configs/env.config';

export const mediaRouter = createAuthRouter();

mediaRouter.openapi(createPresignedUrl, async (c) => {
  const { fileName, fileType } = c.req.valid('json');
  const key = `${createId()}-${fileName}.${fileType}`;

  const expiresIn = 60;
  return c.json(
    {
      presignedUrl: await createPutObjectPresignedUrl(key, expiresIn),
      mediaUrl: `${env.R2_PUBLIC_URL}/${key}`,
      expiresIn,
    },
    200,
  );
});
