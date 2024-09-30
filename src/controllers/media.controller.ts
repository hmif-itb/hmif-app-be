import { createPresignedUrl } from '~/routes/media.route';
import { createAuthRouter } from './router-factory';
import { createPutObjectPresignedUrl } from '~/lib/r2-bucket';
import { env } from '~/configs/env.config';
import { createId } from '~/db/schema';

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
