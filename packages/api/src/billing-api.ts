import { supabase } from './supabase-api';
import { 
  invoiceInsertSchema, 
  invoiceUpdateSchema, 
  paymentInsertSchema, 
  paymentUpdateSchema,
  type Invoice,
  type Payment,
  type InvoiceInsert,
  type InvoiceUpdate,
  type PaymentInsert,
  type PaymentUpdate
} from 'db';

// Extended types for API responses
export interface InvoiceWithDetails extends Invoice {
  booking?: {
    id: number;
    checkInDate: string;
    checkOutDate: string;
    guest?: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
    };
    room?: {
      id: number;
      number: string;
      type: string;
    };
  };
  payments?: Payment[];
  totalPaid?: number;
  remainingBalance?: number;
}

export interface PaymentWithDetails extends Payment {
  invoice?: {
    id: number;
    invoiceNumber: string;
    amount: number;
    booking?: {
      id: number;
      guest?: {
        firstName: string;
        lastName: string;
      };
    };
  };
}

// History tracking interface
export interface InvoiceHistoryEntry {
  timestamp: string;
  action: string;
  details: string;
  userId?: number;
  userName?: string;
}

export interface PaymentHistoryEntry {
  timestamp: string;
  action: string;
  details: string;
  userId?: number;
  userName?: string;
}

// Statistics interfaces
export interface InvoiceStats {
  totalInvoices: number;
  totalRevenue: number;
  draftInvoices: number;
  unpaidInvoices: number;
  paidInvoices: number;
  voidInvoices: number;
  overdueInvoices: number;
  averageInvoiceAmount: number;
}

export interface PaymentStats {
  totalPayments: number;
  totalProcessed: number;
  pendingPayments: number;
  completedPayments: number;
  failedPayments: number;
  refundedPayments: number;
  averagePaymentAmount: number;
}

// Invoice API
export const InvoiceAPI = {
  // Get all invoices with filtering and pagination
  async getInvoices(params?: {
    status?: string;
    bookingId?: number;
    limit?: number;
    offset?: number;
    search?: string;
  }): Promise<InvoiceWithDetails[]> {
    try {
      let query = supabase
        .from('invoices')
        .select(`
          *,
          booking:bookings!inner(
            id,
            checkInDate:check_in_date,
            checkOutDate:check_out_date,
            guest:guests(
              id,
              firstName:first_name,
              lastName:last_name,
              email
            ),
            room:rooms(
              id,
              number,
              type
            )
          )
        `);

      // Apply filters
      if (params?.status && params.status !== 'all') {
        query = query.eq('status', params.status);
      }

      if (params?.bookingId) {
        query = query.eq('booking_id', params.bookingId);
      }

      if (params?.search) {
        query = query.or(`invoice_number.ilike.%${params.search}%`);
      }

      // Apply pagination
      if (params?.limit) {
        query = query.limit(params.limit);
      }
      if (params?.offset) {
        query = query.range(params.offset, (params.offset + (params.limit || 50)) - 1);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching invoices:', error);
        throw new Error(`Failed to fetch invoices: ${error.message}`);
      }

      // Fetch payments for each invoice and calculate totals
      const invoicesWithDetails = await Promise.all(
        (data || []).map(async (invoice) => {
          const { data: payments } = await supabase
            .from('payments')
            .select('*')
            .eq('invoice_id', invoice.id);

          const totalPaid = payments?.reduce((sum, payment) => 
            payment.status === 'Completed' ? sum + payment.amount : sum, 0
          ) || 0;

          const remainingBalance = invoice.amount - totalPaid;

          return {
            ...invoice,
            payments: payments || [],
            totalPaid,
            remainingBalance,
          };
        })
      );

      return invoicesWithDetails;
    } catch (error) {
      console.error('Error in getInvoices:', error);
      throw error;
    }
  },

  // Get single invoice by ID
  async getInvoiceById(id: number): Promise<InvoiceWithDetails | null> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          booking:bookings!inner(
            id,
            checkInDate:check_in_date,
            checkOutDate:check_out_date,
            guest:guests(
              id,
              firstName:first_name,
              lastName:last_name,
              email
            ),
            room:rooms(
              id,
              number,
              type
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching invoice:', error);
        return null;
      }

      // Fetch payments for this invoice
      const { data: payments } = await supabase
        .from('payments')
        .select('*')
        .eq('invoice_id', id);

      const totalPaid = payments?.reduce((sum, payment) => 
        payment.status === 'Completed' ? sum + payment.amount : sum, 0
      ) || 0;

      const remainingBalance = data.amount - totalPaid;

      return {
        ...data,
        payments: payments || [],
        totalPaid,
        remainingBalance,
      };
    } catch (error) {
      console.error('Error in getInvoiceById:', error);
      throw error;
    }
  },

  // Create new invoice
  async createInvoice(invoiceData: InvoiceInsert): Promise<Invoice> {
    try {
      // Validate data
      const validatedData = invoiceInsertSchema.parse(invoiceData);

      // Generate invoice number if not provided
      if (!validatedData.invoiceNumber) {
        const timestamp = Date.now();
        validatedData.invoiceNumber = `INV-${timestamp}`;
      }

      const { data, error } = await supabase
        .from('invoices')
        .insert([{
          ...validatedData,
          booking_id: validatedData.bookingId,
          invoice_number: validatedData.invoiceNumber,
          issue_date: validatedData.issueDate,
          due_date: validatedData.dueDate,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating invoice:', error);
        throw new Error(`Failed to create invoice: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in createInvoice:', error);
      throw error;
    }
  },

  // Update invoice
  async updateInvoice(id: number, invoiceData: InvoiceUpdate): Promise<Invoice> {
    try {
      // Validate data
      const validatedData = invoiceUpdateSchema.parse(invoiceData);

      const { data, error } = await supabase
        .from('invoices')
        .update({
          ...validatedData,
          booking_id: validatedData.bookingId,
          invoice_number: validatedData.invoiceNumber,
          issue_date: validatedData.issueDate,
          due_date: validatedData.dueDate,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating invoice:', error);
        throw new Error(`Failed to update invoice: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in updateInvoice:', error);
      throw error;
    }
  },

  // Delete invoice
  async deleteInvoice(id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting invoice:', error);
        throw new Error(`Failed to delete invoice: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in deleteInvoice:', error);
      throw error;
    }
  },

  // Mark invoice as paid
  async markAsPaid(id: number): Promise<Invoice> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .update({
          status: 'Paid',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error marking invoice as paid:', error);
        throw new Error(`Failed to mark invoice as paid: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in markAsPaid:', error);
      throw error;
    }
  },

  // Void invoice
  async voidInvoice(id: number): Promise<Invoice> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .update({
          status: 'Void',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error voiding invoice:', error);
        throw new Error(`Failed to void invoice: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in voidInvoice:', error);
      throw error;
    }
  },

  // Get invoice statistics
  async getInvoiceStats(): Promise<InvoiceStats> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('amount, status, due_date');

      if (error) {
        console.error('Error fetching invoice stats:', error);
        throw new Error(`Failed to fetch invoice stats: ${error.message}`);
      }

      const invoices = data || [];
      const now = new Date();

      const stats = invoices.reduce((acc, invoice) => {
        acc.totalInvoices += 1;
        acc.totalRevenue += invoice.amount;

        switch (invoice.status) {
          case 'Draft':
            acc.draftInvoices += 1;
            break;
          case 'Unpaid':
            acc.unpaidInvoices += 1;
            if (invoice.due_date && new Date(invoice.due_date) < now) {
              acc.overdueInvoices += 1;
            }
            break;
          case 'Paid':
            acc.paidInvoices += 1;
            break;
          case 'Void':
            acc.voidInvoices += 1;
            break;
        }

        return acc;
      }, {
        totalInvoices: 0,
        totalRevenue: 0,
        draftInvoices: 0,
        unpaidInvoices: 0,
        paidInvoices: 0,
        voidInvoices: 0,
        overdueInvoices: 0,
        averageInvoiceAmount: 0,
      });

      stats.averageInvoiceAmount = stats.totalInvoices > 0 ? 
        stats.totalRevenue / stats.totalInvoices : 0;

      return stats;
    } catch (error) {
      console.error('Error in getInvoiceStats:', error);
      throw error;
    }
  },
};

// Payment API
export const PaymentAPI = {
  // Get all payments with filtering and pagination
  async getPayments(params?: {
    status?: string;
    method?: string;
    invoiceId?: number;
    limit?: number;
    offset?: number;
    search?: string;
  }): Promise<PaymentWithDetails[]> {
    try {
      let query = supabase
        .from('payments')
        .select(`
          *,
          invoice:invoices!inner(
            id,
            invoice_number,
            amount,
            booking:bookings(
              id,
              guest:guests(
                firstName:first_name,
                lastName:last_name
              )
            )
          )
        `);

      // Apply filters
      if (params?.status && params.status !== 'all') {
        query = query.eq('status', params.status);
      }

      if (params?.method && params.method !== 'all') {
        query = query.eq('method', params.method);
      }

      if (params?.invoiceId) {
        query = query.eq('invoice_id', params.invoiceId);
      }

      if (params?.search) {
        query = query.or(`transaction_id.ilike.%${params.search}%`);
      }

      // Apply pagination
      if (params?.limit) {
        query = query.limit(params.limit);
      }
      if (params?.offset) {
        query = query.range(params.offset, (params.offset + (params.limit || 50)) - 1);
      }

      query = query.order('processed_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching payments:', error);
        throw new Error(`Failed to fetch payments: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getPayments:', error);
      throw error;
    }
  },

  // Get single payment by ID
  async getPaymentById(id: number): Promise<PaymentWithDetails | null> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          invoice:invoices!inner(
            id,
            invoice_number,
            amount,
            booking:bookings(
              id,
              guest:guests(
                firstName:first_name,
                lastName:last_name
              )
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching payment:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getPaymentById:', error);
      throw error;
    }
  },

  // Create new payment
  async createPayment(paymentData: PaymentInsert): Promise<Payment> {
    try {
      // Validate data
      const validatedData = paymentInsertSchema.parse(paymentData);

      const { data, error } = await supabase
        .from('payments')
        .insert([{
          ...validatedData,
          invoice_id: validatedData.invoiceId,
          transaction_id: validatedData.transactionId,
          processed_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating payment:', error);
        throw new Error(`Failed to create payment: ${error.message}`);
      }

      // If payment is completed, check if invoice should be marked as paid
      if (data.status === 'Completed' && data.invoice_id) {
        await this.checkAndUpdateInvoiceStatus(data.invoice_id);
      }

      return data;
    } catch (error) {
      console.error('Error in createPayment:', error);
      throw error;
    }
  },

  // Update payment
  async updatePayment(id: number, paymentData: PaymentUpdate): Promise<Payment> {
    try {
      // Validate data
      const validatedData = paymentUpdateSchema.parse(paymentData);

      const { data, error } = await supabase
        .from('payments')
        .update({
          ...validatedData,
          invoice_id: validatedData.invoiceId,
          transaction_id: validatedData.transactionId,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating payment:', error);
        throw new Error(`Failed to update payment: ${error.message}`);
      }

      // Check if invoice status needs to be updated
      if (data.invoice_id) {
        await this.checkAndUpdateInvoiceStatus(data.invoice_id);
      }

      return data;
    } catch (error) {
      console.error('Error in updatePayment:', error);
      throw error;
    }
  },

  // Delete payment
  async deletePayment(id: number): Promise<void> {
    try {
      // Get payment details first for invoice status update
      const payment = await this.getPaymentById(id);

      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting payment:', error);
        throw new Error(`Failed to delete payment: ${error.message}`);
      }

      // Update invoice status if needed
      if (payment?.invoice?.id) {
        await this.checkAndUpdateInvoiceStatus(payment.invoice.id);
      }
    } catch (error) {
      console.error('Error in deletePayment:', error);
      throw error;
    }
  },

  // Check and update invoice status based on payments
  async checkAndUpdateInvoiceStatus(invoiceId: number): Promise<void> {
    try {
      // Get invoice details
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('id, amount, status')
        .eq('id', invoiceId)
        .single();

      if (invoiceError || !invoice) {
        console.error('Error fetching invoice for status update:', invoiceError);
        return;
      }

      // Get completed payments for this invoice
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('amount')
        .eq('invoice_id', invoiceId)
        .eq('status', 'Completed');

      if (paymentsError) {
        console.error('Error fetching payments for status update:', paymentsError);
        return;
      }

      const totalPaid = payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;

      // Determine new status
      let newStatus = invoice.status;
      if (totalPaid >= invoice.amount && invoice.status !== 'Paid') {
        newStatus = 'Paid';
      } else if (totalPaid > 0 && totalPaid < invoice.amount && invoice.status === 'Paid') {
        newStatus = 'Unpaid';
      }

      // Update status if changed
      if (newStatus !== invoice.status) {
        await supabase
          .from('invoices')
          .update({
            status: newStatus,
            updated_at: new Date().toISOString(),
          })
          .eq('id', invoiceId);
      }
    } catch (error) {
      console.error('Error in checkAndUpdateInvoiceStatus:', error);
    }
  },

  // Get payment statistics
  async getPaymentStats(): Promise<PaymentStats> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('amount, status');

      if (error) {
        console.error('Error fetching payment stats:', error);
        throw new Error(`Failed to fetch payment stats: ${error.message}`);
      }

      const payments = data || [];

      const stats = payments.reduce((acc, payment) => {
        acc.totalPayments += 1;
        if (payment.status === 'Completed') {
          acc.totalProcessed += payment.amount;
        }

        switch (payment.status) {
          case 'Pending':
            acc.pendingPayments += 1;
            break;
          case 'Completed':
            acc.completedPayments += 1;
            break;
          case 'Failed':
            acc.failedPayments += 1;
            break;
          case 'Refunded':
            acc.refundedPayments += 1;
            break;
        }

        return acc;
      }, {
        totalPayments: 0,
        totalProcessed: 0,
        pendingPayments: 0,
        completedPayments: 0,
        failedPayments: 0,
        refundedPayments: 0,
        averagePaymentAmount: 0,
      });

      stats.averagePaymentAmount = stats.completedPayments > 0 ? 
        stats.totalProcessed / stats.completedPayments : 0;

      return stats;
    } catch (error) {
      console.error('Error in getPaymentStats:', error);
      throw error;
    }
  },

  // Process refund
  async processRefund(id: number, refundAmount?: number): Promise<Payment> {
    try {
      const payment = await this.getPaymentById(id);
      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.status !== 'Completed') {
        throw new Error('Only completed payments can be refunded');
      }

      const amount = refundAmount || payment.amount;

      const { data, error } = await supabase
        .from('payments')
        .update({
          status: 'Refunded',
          amount: amount,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error processing refund:', error);
        throw new Error(`Failed to process refund: ${error.message}`);
      }

      // Update invoice status
      if (data.invoice_id) {
        await this.checkAndUpdateInvoiceStatus(data.invoice_id);
      }

      return data;
    } catch (error) {
      console.error('Error in processRefund:', error);
      throw error;
    }
  },
};
