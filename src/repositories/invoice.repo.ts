import { db } from '~/db/drizzle';
import { invoices, invoiceItems, invoiceTemplates } from '~/db/schema';
import { eq, and, inArray, desc, gte, lte } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import type { InferInsertModel } from 'drizzle-orm';

type InvoiceItem = {
  description: string;
  quantity: number;
  unitPrice: number;
};

type CreateInvoiceData = {
  templateId: string;
  clientName: string;
  clientAddress: string;
  clientPostalCode: string;
  poNumber?: string;
  currency?: string;
  items: InvoiceItem[];
  vatRate?: number;
  serviceFee?: number;
  dueAt?: Date;
};

export async function createInvoice(
  userId: string,
  data: CreateInvoiceData
) {
  try {
    return await db.transaction(async (tx) => {
      const template = await tx.query.invoiceTemplates.findFirst({
        where: eq(invoiceTemplates.id, data.templateId),
      });

      if (!template) {
        throw new Error('Invoice template not found');
      }

      const subtotal = data.items.reduce(
        (sum, item) => sum + (item.quantity * item.unitPrice),
        0
      );
      
      const vatRate = data.vatRate ?? Number(template.defaultVatRate);
      const vatAmount = subtotal * (vatRate / 100);
      const serviceFee = data.serviceFee ?? Number(template.defaultServiceFee);
      const totalAmount = subtotal + vatAmount + serviceFee;

      const invoiceNumber = `INV-${Date.now().toString().slice(-4)}`;

      const [invoice] = await tx.insert(invoices)
        .values({
          id: createId(),
          userId,
          templateId: template.id,
          invoiceNumber,
          poNumber: data.poNumber,
          clientName: data.clientName,
          clientAddress: data.clientAddress,
          clientPostalCode: data.clientPostalCode,
          currency: data.currency ?? 'IDR',
          subtotal: subtotal.toString(),
          vatRate: vatRate.toString(),
          vatAmount: vatAmount.toString(),
          serviceFee: serviceFee.toString(),
          totalAmount: totalAmount.toString(),
          dueAt: data.dueAt,
          status: 'draft',
        })
        .returning();

      await tx.insert(invoiceItems).values(
        data.items.map(item => ({
          id: createId(),
          invoiceId: invoice.id,
          description: item.description,
          quantity: item.quantity.toString(),
          unitPrice: item.unitPrice.toString(),
          totalPrice: (item.quantity * item.unitPrice).toString(),
        }))
      );

      return {
        ...invoice,
        subtotal: Number(invoice.subtotal),
        vatRate: Number(invoice.vatRate),
        vatAmount: Number(invoice.vatAmount),
        serviceFee: Number(invoice.serviceFee),
        totalAmount: Number(invoice.totalAmount),
      };
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw new Error('Failed to create invoice');
  }
}

export async function getInvoices(
  userId: string,
  filters: {
    page?: number;
    limit?: number;
    fromDate?: Date;
    toDate?: Date;
    status?: 'draft' | 'sent' | 'paid' | 'cancelled';
  } = {}
) {
  const limit = Math.min(filters.limit ?? 10, 100);
  const offset = ((filters.page ?? 1) - 1) * limit;

  try {
    const conditions = [eq(invoices.userId, userId)];
    
    if (filters.fromDate) {
      conditions.push(gte(invoices.issuedAt, filters.fromDate));
    }
    if (filters.toDate) {
      conditions.push(lte(invoices.issuedAt, filters.toDate));
    }
    if (filters.status) {
      conditions.push(eq(invoices.status, filters.status));
    }

    const invoicesData = await db.select()
      .from(invoices)
      .where(and(...conditions))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(invoices.issuedAt));

    const invoiceIds = invoicesData.map(inv => inv.id);
    const itemsData = invoiceIds.length > 0
      ? await db.select()
          .from(invoiceItems)
          .where(inArray(invoiceItems.invoiceId, invoiceIds))
      : [];

    return invoicesData.map(invoice => {
      const items = itemsData
        .filter(item => item.invoiceId === invoice.id)
        .map(item => ({
          ...item,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          totalPrice: Number(item.totalPrice),
        }));

      return {
        ...invoice,
        subtotal: Number(invoice.subtotal),
        vatRate: Number(invoice.vatRate),
        vatAmount: Number(invoice.vatAmount),
        serviceFee: Number(invoice.serviceFee),
        totalAmount: Number(invoice.totalAmount),
        items,
      };
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    throw new Error('Failed to fetch invoices');
  }
}

export async function getInvoiceById(
    userId: string,
    invoiceId: string,
    includeItems: boolean = true
  ) {
    try {
      const [invoice] = await db.select()
        .from(invoices)
        .where(and(
          eq(invoices.id, invoiceId),
          eq(invoices.userId, userId)
        ))
        .limit(1);
  
      if (!invoice) {
        throw new Error('Invoice not found');
      }
  
      let items: InvoiceItem[] = [];
      if (includeItems) {
          const rawItems = await db.select()
            .from(invoiceItems)
            .where(eq(invoiceItems.invoiceId, invoice.id));
        
          items = rawItems.map(item => ({
            ...item,
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice),
            totalPrice: Number(item.totalPrice),
          }));
        }
        
  
      return {
        ...invoice,
        subtotal: Number(invoice.subtotal),
        vatRate: Number(invoice.vatRate),
        vatAmount: Number(invoice.vatAmount),
        serviceFee: Number(invoice.serviceFee),
        totalAmount: Number(invoice.totalAmount),
        items: items.map(item => ({
          ...item,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          description: Number(item.description),
        })),
      };
    } catch (error) {
      console.error('Error fetching invoice:', error);
      throw new Error('Failed to fetch invoice');
    }
  }

export async function updateInvoiceStatus(
  userId: string,
  invoiceId: string,
  data: {
    status?: 'draft' | 'sent' | 'paid' | 'cancelled';
    paidAt?: Date | null;
  }
) {
  try {
    const updateData: Partial<InferInsertModel<typeof invoices>> = {
      updatedAt: new Date(),
    };

    if (data.status) {
      updateData.status = data.status;
    }
    if (data.paidAt !== undefined) {
      updateData.paidAt = data.paidAt;
    }

    const [invoice] = await db.update(invoices)
      .set(updateData)
      .where(and(
        eq(invoices.id, invoiceId),
        eq(invoices.userId, userId)
      ))
      .returning();

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    return {
      ...invoice,
      subtotal: Number(invoice.subtotal),
      vatRate: Number(invoice.vatRate),
      vatAmount: Number(invoice.vatAmount),
      serviceFee: Number(invoice.serviceFee),
      totalAmount: Number(invoice.totalAmount),
    };
  } catch (error) {
    console.error('Error updating invoice:', error);
    throw new Error('Failed to update invoice');
  }
}