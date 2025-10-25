import { z } from 'zod';

export const PropertiSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  category: z.enum(['sekre', 'properti']),
  condition: z.enum(['good', 'broken', 'cant_be_used', 'lost']),
  quantity: z.number().int().min(0),
  location: z.enum(['Sekretariat 1', 'Sekretariat 2', 'Jatinangor']),
  photo: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const PropertiIdParamSchema = z.object({
  propertiId: z.string(),
});

export const GetPropertiParamsSchema = z.object({
  search: z.string().optional(),
  category: z.enum(['sekre', 'properti']).optional(),
  condition: z.enum(['good', 'broken', 'cant_be_used', 'lost']).optional(),
  sortBy: z.enum(['name_asc', 'name_desc']).optional().default('name_asc'),
}).openapi('GetPropertiParams');

export const CreatePropertiBodySchema = PropertiSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).openapi('CreatePropertiBodySchema');

export const UpdatePropertiBodySchema = CreatePropertiBodySchema.partial().openapi('UpdatePropertiBodySchema');