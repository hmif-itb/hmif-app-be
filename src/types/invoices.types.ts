import { z } from 'zod';

export const InvoiceItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().positive(),
  unitPrice: z.number().positive(),
});

export const InvoiceResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  templateId: z.string(),
  invoiceNumber: z.string(),
  poNumber: z.string().nullable(),
  clientName: z.string(),
  clientAddress: z.string(),
  clientPostalCode: z.string(),
  currency: z.string(),
  subtotal: z.number(),
  vatRate: z.number(),
  vatAmount: z.number(),
  serviceFee: z.number(),
  totalAmount: z.number(),
  status: z.enum(['draft', 'sent', 'paid', 'cancelled']),
  issuedAt: z.string().datetime(),
  dueAt: z.string().datetime().nullable(),
  paidAt: z.string().datetime().nullable(),
  items: z.array(z.object({
    description: z.string(),
    quantity: z.number(),
    unitPrice: z.number(),
    totalPrice: z.number(),
  })),
});

export const ErrorResponseSchema = z.object({
  formErrors: z.array(z.string()),
  fieldErrors: z.record(z.array(z.string())),
});

export const CreateInvoiceRequestSchema = z.object({
  templateId: z.string(),
  clientName: z.string().min(1),
  clientAddress: z.string().min(1),
  clientPostalCode: z.string().min(1),
  poNumber: z.string().optional(),
  currency: z.string().default('IDR'),
  items: z.array(InvoiceItemSchema).min(1),
  vatRate: z.number().min(0).max(100).optional(),
  serviceFee: z.number().min(0).optional(),
  dueAt: z.string().datetime().optional(),
});

export const UpdateInvoiceRequestSchema = z.object({
  status: z.enum(['draft', 'sent', 'paid', 'cancelled']).optional(),
  paidAt: z.string().datetime().nullable().optional(),
});