import { PostgresError } from 'postgres';
import { db } from '~/db/drizzle';
import { eq } from 'drizzle-orm';
import {
  createInvoice,
  getInvoiceById,
  getInvoices,
  updateInvoiceStatus,
} from '~/repositories/invoice.repo';
import {
  createInvoiceRoute,
  getInvoiceByIdRoute,
  getInvoicesRoute,
  updateInvoiceRoute,
} from '~/routes/invoice.routes';
import { createAuthRouter } from './router-factory';
import { invoiceItems } from '~/db/schema';

export const invoiceRouter = createAuthRouter();

invoiceRouter.openapi(getInvoicesRoute, async (c) => {
  const userId = c.var.user.id;
  const { status, page = 1, limit = 10 } = c.req.valid('query');

  try {
    console.log('Fetching invoices for user:', userId, 'Page:', page, 'Limit:', limit); // Log userId, page, and limit
    const invoices = await getInvoices(userId, { page, limit });

    console.log('Fetched invoices:', invoices);

    return c.json(invoices, 200);
  } catch (err) {
    console.error('Error fetching invoices:', err);
    return c.json({ error: 'Failed to fetch invoices' }, 500);
  }
});


invoiceRouter.openapi(getInvoiceByIdRoute, async (c) => {
  const userId = c.var.user.id;
  const { id } = c.req.valid('param');

  try {
    const invoice = await getInvoiceById(userId, id);
    if (!invoice) {
      return c.json({ error: 'Invoice not found' }, 404);
    }
    return c.json(invoice, 200);
  } catch (err) {
    console.error(`Error fetching invoice ${id}:`, err);
    return c.json({ error: 'Failed to fetch invoice' }, 500);
  }
});

invoiceRouter.openapi(createInvoiceRoute, async (c) => {
    const userId = c.var.user.id;
    const data = c.req.valid('json');
  
    try {
      const invoice = await createInvoice(userId, {
        ...data,
        dueAt: data.dueAt ? new Date(data.dueAt) : undefined,
      });
  
      const items = await db.query.invoiceItems.findMany({
        where: eq(invoiceItems.invoiceId, invoice.id),
      });
  
      const responseData = {
        ...invoice,
        subtotal: Number(invoice.subtotal),
        vatRate: Number(invoice.vatRate),
        vatAmount: Number(invoice.vatAmount),
        serviceFee: Number(invoice.serviceFee),
        totalAmount: Number(invoice.totalAmount),
        items: items.map(item => ({
          description: item.description,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          totalPrice: Number(item.totalPrice),
        })),
      };
  
      return c.json(responseData, 201);
    } catch (error) {
      console.error('Error creating invoice:', error);
  
      return c.json({
        formErrors: [],
        fieldErrors: {
          _global: [error instanceof Error ? error.message : 'Failed to create invoice'],
        },
      }, 400);
    }
  });
  

invoiceRouter.openapi(updateInvoiceRoute, async (c) => {
    const userId = c.var.user.id;
    const { id } = c.req.valid('param');
  
    const body = c.req.valid('json') as {
      status?: 'draft' | 'sent' | 'paid' | 'cancelled';
      paidAt?: string | null;
    };
    const { status, paidAt } = body;
  
    try {
      const updateData = {
        status,
        paidAt: paidAt ? new Date(paidAt) : undefined,
      };
  
      const invoice = await updateInvoiceStatus(userId, id, updateData);
  
      if (!invoice) {
        return c.json({ error: 'Invoice not found' }, 404);
      }
  
      return c.json(invoice, 200);
    } catch (err) {
      console.error(`Error updating invoice ${id}:`, err);
  
      if (err instanceof PostgresError) {
        return c.json({ error: err.message }, 400);
      }
  
      return c.json({ error: 'Failed to update invoice' }, 500);
    }
  });
   