import { createPresignedUrl } from '~/routes/media.route';
import { createAuthRouter } from './router-factory';
import { createPutObjectPresignedUrl } from '~/lib/r2-bucket';
import { createId } from '@paralleldrive/cuid2';

export const mediaRouter = createAuthRouter();

mediaRouter.openapi(createPresignedUrl, async (c) => {
  const { fileName, fileType } = c.req.valid('query');
  const key = `${createId()}-${fileName}.${fileType}`;

  const expiresIn = 3600;
  return c.json(
    {
      presignedUrl: await createPutObjectPresignedUrl(key, expiresIn),
      mediaUrl: `https://pub-45e54d5755814b02b87e024df83efb57.r2.dev/${key}`,
      expiresIn,
    },
    200,
  );
});
