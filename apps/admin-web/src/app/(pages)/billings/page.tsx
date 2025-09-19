'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Title,
  Card,
  Table,
  Group,
  Stack,
  Button,
  Badge,
  Text,
  TextInput,
  Select,
  ActionIcon,
  Menu,
  Modal,
  SimpleGrid,
  Tabs,
  NumberInput,
  Grid,
  Center,
  Tooltip,
  Avatar,
  Divider,
  Loader,
  Container,
  Timeline,
  ThemeIcon,
  ScrollArea,
  Alert,
  Paper,
} from "@mantine/core";
import {
  IconSearch,
  IconPlus,
  IconFileText,
  IconCreditCard,
  IconDots,
  IconEye,
  IconEdit,
  IconTrash,
  IconCheck,
  IconX,
  IconClock,
  IconAlertCircle,
  IconExclamationMark,
  IconUser,
  IconReceipt,
  IconCashBanknote,
  IconFilter,
  IconRefresh,
  IconDownload,
  IconHistory,
  IconArrowUp,
  IconArrowDown,
  IconMinus,
  IconCalendar,
  IconBuildingBank,
  IconWallet,
} from "@tabler/icons-react";
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { DatePickerInput } from '@mantine/dates';
import { 
  InvoiceAPI, 
  PaymentAPI, 
  type InvoiceWithDetails, 
  type PaymentWithDetails,
  type InvoiceStats,
  type PaymentStats
} from 'api';
import { type InvoiceInsert, type InvoiceUpdate, type PaymentInsert, type PaymentUpdate } from 'db';

interface Booking {
  id: number;
  checkInDate: string;
  checkOutDate: string;
  guest: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  room: {
    id: number;
    number: string;
    type: string;
  };
}

export default function BillingPage() {
  // State management
  const [activeTab, setActiveTab] = useState<string>('invoices');
  const [invoices, setInvoices] = useState<InvoiceWithDetails[]>([]);
  const [payments, setPayments] = useState<PaymentWithDetails[]>([]);
  const [invoiceStats, setInvoiceStats] = useState<InvoiceStats>({
    totalInvoices: 0,
    totalRevenue: 0,
    draftInvoices: 0,
    unpaidInvoices: 0,
    paidInvoices: 0,
    voidInvoices: 0,
    overdueInvoices: 0,
    averageInvoiceAmount: 0,
  });
  const [paymentStats, setPaymentStats] = useState<PaymentStats>({
    totalPayments: 0,
    totalProcessed: 0,
    pendingPayments: 0,
    completedPayments: 0,
    failedPayments: 0,
    refundedPayments: 0,
    averagePaymentAmount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  
  // Filters
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');

  // Modal states
  const [createInvoiceModalOpened, { open: openCreateInvoiceModal, close: closeCreateInvoiceModal }] = useDisclosure(false);
  const [editInvoiceModalOpened, { open: openEditInvoiceModal, close: closeEditInvoiceModal }] = useDisclosure(false);
  const [viewInvoiceModalOpened, { open: openViewInvoiceModal, close: closeViewInvoiceModal }] = useDisclosure(false);
  const [createPaymentModalOpened, { open: openCreatePaymentModal, close: closeCreatePaymentModal }] = useDisclosure(false);
  const [editPaymentModalOpened, { open: openEditPaymentModal, close: closeEditPaymentModal }] = useDisclosure(false);
  const [viewPaymentModalOpened, { open: openViewPaymentModal, close: closeViewPaymentModal }] = useDisclosure(false);
  
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceWithDetails | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentWithDetails | null>(null);

  // Form states
  const [invoiceFormData, setInvoiceFormData] = useState<Partial<InvoiceInsert>>({
    bookingId: undefined,
    amount: 0,
    tax: 0,
    invoiceNumber: '',
    status: 'Draft' as 'Draft' | 'Unpaid' | 'Paid' | 'Void',
    issueDate: new Date(),
    dueDate: undefined,
  });

  const [paymentFormData, setPaymentFormData] = useState<Partial<PaymentInsert>>({
    invoiceId: undefined,
    amount: 0,
    status: 'Pending' as 'Pending' | 'Completed' | 'Failed' | 'Refunded',
    method: undefined,
    transactionId: '',
  });

  // Load initial data
  useEffect(() => {
    loadBillingData();
    loadSupportingData();
  }, []);

  // Load billing data and stats
  const loadBillingData = async () => {
    try {
      setLoading(true);
      const [invoicesData, paymentsData, invoiceStatsData, paymentStatsData] = await Promise.all([
        InvoiceAPI.getInvoices(),
        PaymentAPI.getPayments(),
        InvoiceAPI.getInvoiceStats(),
        PaymentAPI.getPaymentStats(),
      ]);
      
      setInvoices(invoicesData);
      setPayments(paymentsData);
      setInvoiceStats(invoiceStatsData);
      setPaymentStats(paymentStatsData);
    } catch (error) {
      console.error('Error loading billing data:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load billing data',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  // Load supporting data (bookings)
  const loadSupportingData = async () => {
    try {
      // TODO: Replace with actual API calls when available
      // For now, using mock data
      setBookings([
        {
          id: 1,
          checkInDate: '2024-01-15',
          checkOutDate: '2024-01-18',
          guest: { id: 1, firstName: 'John', lastName: 'Doe', email: 'john.doe@email.com' },
          room: { id: 1, number: '101', type: 'Standard' },
        },
        {
          id: 2,
          checkInDate: '2024-01-20',
          checkOutDate: '2024-01-25',
          guest: { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@email.com' },
          room: { id: 2, number: '201', type: 'Deluxe' },
        },
      ]);
    } catch (error) {
      console.error('Error loading supporting data:', error);
    }
  };

  // Filter invoices based on current filters
  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      // Search filter
      if (searchValue) {
        const searchLower = searchValue.toLowerCase();
        const invoiceNumber = invoice.invoiceNumber?.toLowerCase() || '';
        const guestName = invoice.booking?.guest ? 
          `${invoice.booking.guest.firstName} ${invoice.booking.guest.lastName}`.toLowerCase() : '';
        
        if (!invoiceNumber.includes(searchLower) && !guestName.includes(searchLower)) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'all' && invoice.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [invoices, searchValue, statusFilter]);

  // Filter payments based on current filters
  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      // Search filter
      if (searchValue) {
        const searchLower = searchValue.toLowerCase();
        const transactionId = payment.transactionId?.toLowerCase() || '';
        const invoiceNumber = payment.invoice?.invoiceNumber?.toLowerCase() || '';
        
        if (!transactionId.includes(searchLower) && !invoiceNumber.includes(searchLower)) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'all' && payment.status !== statusFilter) {
        return false;
      }

      // Method filter
      if (methodFilter !== 'all' && payment.method !== methodFilter) {
        return false;
      }

      return true;
    });
  }, [payments, searchValue, statusFilter, methodFilter]);

  // Get status color
  const getInvoiceStatusColor = (status: string) => {
    switch (status) {
      case 'Draft': return 'gray';
      case 'Unpaid': return 'red';
      case 'Paid': return 'green';
      case 'Void': return 'dark';
      default: return 'gray';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'orange';
      case 'Completed': return 'green';
      case 'Failed': return 'red';
      case 'Refunded': return 'blue';
      default: return 'gray';
    }
  };

  // Get status icon
  const getInvoiceStatusIcon = (status: string) => {
    switch (status) {
      case 'Draft': return <IconFileText size={16} />;
      case 'Unpaid': return <IconAlertCircle size={16} />;
      case 'Paid': return <IconCheck size={16} />;
      case 'Void': return <IconX size={16} />;
      default: return <IconClock size={16} />;
    }
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending': return <IconClock size={16} />;
      case 'Completed': return <IconCheck size={16} />;
      case 'Failed': return <IconX size={16} />;
      case 'Refunded': return <IconArrowDown size={16} />;
      default: return <IconClock size={16} />;
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return `$${(amount / 100).toFixed(2)}`;
  };

  // Handle create invoice
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await InvoiceAPI.createInvoice(invoiceFormData as InvoiceInsert);

      notifications.show({
        title: 'Success',
        message: 'Invoice created successfully',
        color: 'green',
      });

      closeCreateInvoiceModal();
      resetInvoiceForm();
      loadBillingData();
    } catch (error) {
      console.error('Error creating invoice:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to create invoice',
        color: 'red',
      });
    }
  };

  // Handle update invoice
  const handleUpdateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    try {
      await InvoiceAPI.updateInvoice(selectedInvoice.id, invoiceFormData as InvoiceUpdate);

      notifications.show({
        title: 'Success',
        message: 'Invoice updated successfully',
        color: 'green',
      });

      closeEditInvoiceModal();
      resetInvoiceForm();
      loadBillingData();
    } catch (error) {
      console.error('Error updating invoice:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to update invoice',
        color: 'red',
      });
    }
  };

  // Handle create payment
  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await PaymentAPI.createPayment(paymentFormData as PaymentInsert);

      notifications.show({
        title: 'Success',
        message: 'Payment created successfully',
        color: 'green',
      });

      closeCreatePaymentModal();
      resetPaymentForm();
      loadBillingData();
    } catch (error) {
      console.error('Error creating payment:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to create payment',
        color: 'red',
      });
    }
  };

  // Handle mark invoice as paid
  const handleMarkInvoiceAsPaid = async (invoiceId: number) => {
    try {
      await InvoiceAPI.markAsPaid(invoiceId);
      notifications.show({
        title: 'Success',
        message: 'Invoice marked as paid',
        color: 'green',
      });
      loadBillingData();
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to mark invoice as paid',
        color: 'red',
      });
    }
  };

  // Handle void invoice
  const handleVoidInvoice = async (invoiceId: number) => {
    try {
      await InvoiceAPI.voidInvoice(invoiceId);
      notifications.show({
        title: 'Success',
        message: 'Invoice voided successfully',
        color: 'green',
      });
      loadBillingData();
    } catch (error) {
      console.error('Error voiding invoice:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to void invoice',
        color: 'red',
      });
    }
  };

  // Handle delete invoice
  const handleDeleteInvoice = async (invoiceId: number) => {
    try {
      await InvoiceAPI.deleteInvoice(invoiceId);
      notifications.show({
        title: 'Success',
        message: 'Invoice deleted successfully',
        color: 'green',
      });
      loadBillingData();
    } catch (error) {
      console.error('Error deleting invoice:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to delete invoice',
        color: 'red',
      });
    }
  };

  // Handle delete payment
  const handleDeletePayment = async (paymentId: number) => {
    try {
      await PaymentAPI.deletePayment(paymentId);
      notifications.show({
        title: 'Success',
        message: 'Payment deleted successfully',
        color: 'green',
      });
      loadBillingData();
    } catch (error) {
      console.error('Error deleting payment:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to delete payment',
        color: 'red',
      });
    }
  };

  // Handle process refund
  const handleProcessRefund = async (paymentId: number) => {
    try {
      await PaymentAPI.processRefund(paymentId);
      notifications.show({
        title: 'Success',
        message: 'Refund processed successfully',
        color: 'green',
      });
      loadBillingData();
    } catch (error) {
      console.error('Error processing refund:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to process refund',
        color: 'red',
      });
    }
  };

  // Reset forms
  const resetInvoiceForm = () => {
    setInvoiceFormData({
      bookingId: undefined,
      amount: 0,
      tax: 0,
      invoiceNumber: '',
      status: 'Draft' as 'Draft' | 'Unpaid' | 'Paid' | 'Void',
      issueDate: new Date(),
      dueDate: undefined,
    });
    setSelectedInvoice(null);
  };

  const resetPaymentForm = () => {
    setPaymentFormData({
      invoiceId: undefined,
      amount: 0,
      status: 'Pending' as 'Pending' | 'Completed' | 'Failed' | 'Refunded',
      method: undefined,
      transactionId: '',
    });
    setSelectedPayment(null);
  };

  // Open modals with data
  const openEditInvoiceWithData = (invoice: InvoiceWithDetails) => {
    setSelectedInvoice(invoice);
    setInvoiceFormData({
      bookingId: invoice.bookingId,
      amount: invoice.amount,
      tax: invoice.tax,
      invoiceNumber: invoice.invoiceNumber,
      status: invoice.status,
      issueDate: invoice.issueDate ? new Date(invoice.issueDate) : new Date(),
      dueDate: invoice.dueDate ? new Date(invoice.dueDate) : undefined,
    });
    openEditInvoiceModal();
  };

  const openViewInvoiceWithData = (invoice: InvoiceWithDetails) => {
    setSelectedInvoice(invoice);
    openViewInvoiceModal();
  };

  const openViewPaymentWithData = (payment: PaymentWithDetails) => {
    setSelectedPayment(payment);
    openViewPaymentModal();
  };

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Center h={400}>
          <Loader size="lg" />
        </Center>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between">
          <Title order={2}>Billing & Payments</Title>
          <Group>
            <Button
              leftSection={<IconRefresh size={16} />}
              variant="light"
              onClick={loadBillingData}
            >
              Refresh
            </Button>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={openCreateInvoiceModal}
            >
              Create Invoice
            </Button>
          </Group>
        </Group>

        {/* Stats Cards */}
        <SimpleGrid cols={{ base: 2, sm: 3, lg: 4 }}>
          <Card padding="lg" radius="md" withBorder>
            <Group justify="space-between">
              <div>
                <Text c="dimmed" size="sm" fw={500}>
                  Total Revenue
                </Text>
                <Text fw={700} size="xl">
                  {formatCurrency(invoiceStats.totalRevenue)}
                </Text>
              </div>
              <IconCashBanknote size={32} color="var(--mantine-color-green-6)" />
            </Group>
          </Card>

          <Card padding="lg" radius="md" withBorder>
            <Group justify="space-between">
              <div>
                <Text c="dimmed" size="sm" fw={500}>
                  Total Invoices
                </Text>
                <Text fw={700} size="xl">
                  {invoiceStats.totalInvoices}
                </Text>
              </div>
              <IconFileText size={32} color="var(--mantine-color-blue-6)" />
            </Group>
          </Card>

          <Card padding="lg" radius="md" withBorder>
            <Group justify="space-between">
              <div>
                <Text c="dimmed" size="sm" fw={500}>
                  Unpaid Invoices
                </Text>
                <Text fw={700} size="xl" c="red">
                  {invoiceStats.unpaidInvoices}
                </Text>
              </div>
              <IconAlertCircle size={32} color="var(--mantine-color-red-6)" />
            </Group>
          </Card>

          <Card padding="lg" radius="md" withBorder>
            <Group justify="space-between">
              <div>
                <Text c="dimmed" size="sm" fw={500}>
                  Payments Processed
                </Text>
                <Text fw={700} size="xl">
                  {formatCurrency(paymentStats.totalProcessed)}
                </Text>
              </div>
              <IconCreditCard size={32} color="var(--mantine-color-blue-6)" />
            </Group>
          </Card>
        </SimpleGrid>

        {/* Filters */}
        <Card padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Text fw={500}>Filters</Text>
            <Grid>
              <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                <TextInput
                  placeholder="Search..."
                  leftSection={<IconSearch size={16} />}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Select
                  placeholder="Status"
                  data={[
                    { value: 'all', label: 'All Status' },
                    ...(activeTab === 'invoices' ? [
                      { value: 'Draft', label: 'Draft' },
                      { value: 'Unpaid', label: 'Unpaid' },
                      { value: 'Paid', label: 'Paid' },
                      { value: 'Void', label: 'Void' },
                    ] : [
                      { value: 'Pending', label: 'Pending' },
                      { value: 'Completed', label: 'Completed' },
                      { value: 'Failed', label: 'Failed' },
                      { value: 'Refunded', label: 'Refunded' },
                    ]),
                  ]}
                  value={statusFilter}
                  onChange={(value) => setStatusFilter(value || 'all')}
                />
              </Grid.Col>
              {activeTab === 'payments' && (
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                  <Select
                    placeholder="Payment Method"
                    data={[
                      { value: 'all', label: 'All Methods' },
                      { value: 'Credit Card', label: 'Credit Card' },
                      { value: 'PayPal', label: 'PayPal' },
                      { value: 'Bank Transfer', label: 'Bank Transfer' },
                      { value: 'Cash', label: 'Cash' },
                    ]}
                    value={methodFilter}
                    onChange={(value) => setMethodFilter(value || 'all')}
                  />
                </Grid.Col>
              )}
            </Grid>
          </Stack>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'invoices')}>
          <Tabs.List>
            <Tabs.Tab value="invoices" leftSection={<IconFileText size={16} />}>
              Invoices ({invoices.length})
            </Tabs.Tab>
            <Tabs.Tab value="payments" leftSection={<IconCreditCard size={16} />}>
              Payments ({payments.length})
            </Tabs.Tab>
          </Tabs.List>

          {/* Invoices Tab */}
          <Tabs.Panel value="invoices">
            <Card padding="lg" radius="md" withBorder mt="md">
              <Stack gap="md">
                <Group justify="space-between">
                  <Text fw={500} size="lg">Invoices</Text>
                  <Group>
                    <Text c="dimmed" size="sm">
                      {filteredInvoices.length} of {invoices.length} invoices
                    </Text>
                    <Button
                      leftSection={<IconPlus size={16} />}
                      size="sm"
                      onClick={openCreateInvoiceModal}
                    >
                      Create Invoice
                    </Button>
                  </Group>
                </Group>

                <Table.ScrollContainer minWidth={1200}>
                  <Table striped highlightOnHover>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Invoice #</Table.Th>
                        <Table.Th>Guest</Table.Th>
                        <Table.Th>Room</Table.Th>
                        <Table.Th>Amount</Table.Th>
                        <Table.Th>Status</Table.Th>
                        <Table.Th>Balance</Table.Th>
                        <Table.Th>Issue Date</Table.Th>
                        <Table.Th>Due Date</Table.Th>
                        <Table.Th>Actions</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {filteredInvoices.map((invoice) => (
                        <Table.Tr key={invoice.id}>
                          <Table.Td>
                            <Text size="sm" fw={500}>
                              {invoice.invoiceNumber}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            {invoice.booking?.guest ? (
                              <Group gap="xs">
                                <Avatar size="sm" radius="xl">
                                  {(invoice.booking.guest.firstName?.[0] || '') + (invoice.booking.guest.lastName?.[0] || '')}
                                </Avatar>
                                <div>
                                  <Text size="sm" fw={500}>
                                    {invoice.booking.guest.firstName} {invoice.booking.guest.lastName}
                                  </Text>
                                  <Text size="xs" c="dimmed">
                                    {invoice.booking.guest.email}
                                  </Text>
                                </div>
                              </Group>
                            ) : (
                              <Text size="sm" c="dimmed">No guest</Text>
                            )}
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm" fw={500}>
                              Room {invoice.booking?.room?.number || 'N/A'}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {invoice.booking?.room?.type}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm" fw={500}>
                              {formatCurrency(invoice.amount)}
                            </Text>
                            {invoice.tax > 0 && (
                              <Text size="xs" c="dimmed">
                                +{formatCurrency(invoice.tax)} tax
                              </Text>
                            )}
                          </Table.Td>
                          <Table.Td>
                            <Badge
                              color={getInvoiceStatusColor(invoice.status)}
                              variant="light"
                              leftSection={getInvoiceStatusIcon(invoice.status)}
                            >
                              {invoice.status}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Text 
                              size="sm" 
                              fw={500}
                              c={invoice.remainingBalance && invoice.remainingBalance > 0 ? 'red' : 'green'}
                            >
                              {formatCurrency(invoice.remainingBalance || 0)}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">
                              {invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString() : 'N/A'}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">
                              {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Group gap="xs">
                              <ActionIcon
                                variant="light"
                                color="blue"
                                size="sm"
                                onClick={() => openViewInvoiceWithData(invoice)}
                              >
                                <IconEye size={14} />
                              </ActionIcon>
                              
                              {invoice.status !== 'Paid' && invoice.status !== 'Void' && (
                                <ActionIcon
                                  variant="light"
                                  color="green"
                                  size="sm"
                                  onClick={() => handleMarkInvoiceAsPaid(invoice.id)}
                                >
                                  <IconCheck size={14} />
                                </ActionIcon>
                              )}
                              
                              <Menu shadow="md" width={200}>
                                <Menu.Target>
                                  <ActionIcon variant="light" color="gray" size="sm">
                                    <IconDots size={14} />
                                  </ActionIcon>
                                </Menu.Target>
                                <Menu.Dropdown>
                                  <Menu.Item
                                    leftSection={<IconEye size={16} />}
                                    onClick={() => openViewInvoiceWithData(invoice)}
                                  >
                                    View Details
                                  </Menu.Item>
                                  <Menu.Item
                                    leftSection={<IconDownload size={16} />}
                                  >
                                    Download PDF
                                  </Menu.Item>
                                  <Menu.Item
                                    leftSection={<IconEdit size={16} />}
                                    onClick={() => openEditInvoiceWithData(invoice)}
                                  >
                                    Edit Invoice
                                  </Menu.Item>
                                  {invoice.status !== 'Paid' && invoice.status !== 'Void' && (
                                    <>
                                      <Menu.Item
                                        leftSection={<IconCheck size={16} />}
                                        onClick={() => handleMarkInvoiceAsPaid(invoice.id)}
                                      >
                                        Mark as Paid
                                      </Menu.Item>
                                      <Menu.Item
                                        leftSection={<IconX size={16} />}
                                        onClick={() => handleVoidInvoice(invoice.id)}
                                      >
                                        Void Invoice
                                      </Menu.Item>
                                    </>
                                  )}
                                  <Menu.Divider />
                                  <Menu.Item
                                    color="red"
                                    leftSection={<IconTrash size={16} />}
                                    onClick={() => handleDeleteInvoice(invoice.id)}
                                  >
                                    Delete Invoice
                                  </Menu.Item>
                                </Menu.Dropdown>
                              </Menu>
                            </Group>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Table.ScrollContainer>

                {filteredInvoices.length === 0 && (
                  <Center py="xl">
                    <Stack align="center" gap="md">
                      <IconFileText size={48} color="var(--mantine-color-gray-4)" />
                      <Text c="dimmed">No invoices found</Text>
                    </Stack>
                  </Center>
                )}
              </Stack>
            </Card>
          </Tabs.Panel>

          {/* Payments Tab */}
          <Tabs.Panel value="payments">
            <Card padding="lg" radius="md" withBorder mt="md">
              <Stack gap="md">
                <Group justify="space-between">
                  <Text fw={500} size="lg">Payments</Text>
                  <Group>
                    <Text c="dimmed" size="sm">
                      {filteredPayments.length} of {payments.length} payments
                    </Text>
                    <Button
                      leftSection={<IconPlus size={16} />}
                      size="sm"
                      onClick={openCreatePaymentModal}
                    >
                      Record Payment
                    </Button>
                  </Group>
                </Group>

                <Table.ScrollContainer minWidth={1000}>
                  <Table striped highlightOnHover>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Transaction ID</Table.Th>
                        <Table.Th>Invoice</Table.Th>
                        <Table.Th>Guest</Table.Th>
                        <Table.Th>Amount</Table.Th>
                        <Table.Th>Method</Table.Th>
                        <Table.Th>Status</Table.Th>
                        <Table.Th>Processed</Table.Th>
                        <Table.Th>Actions</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {filteredPayments.map((payment) => (
                        <Table.Tr key={payment.id}>
                          <Table.Td>
                            <Text size="sm" fw={500}>
                              {payment.transactionId || 'N/A'}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm" fw={500}>
                              {payment.invoice?.invoiceNumber || 'N/A'}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            {payment.invoice?.booking?.guest ? (
                              <Text size="sm">
                                {payment.invoice.booking.guest.firstName} {payment.invoice.booking.guest.lastName}
                              </Text>
                            ) : (
                              <Text size="sm" c="dimmed">No guest</Text>
                            )}
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm" fw={500}>
                              {formatCurrency(payment.amount)}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            {payment.method && (
                              <Badge variant="light">
                                {payment.method}
                              </Badge>
                            )}
                          </Table.Td>
                          <Table.Td>
                            <Badge
                              color={getPaymentStatusColor(payment.status)}
                              variant="light"
                              leftSection={getPaymentStatusIcon(payment.status)}
                            >
                              {payment.status}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">
                              {new Date(payment.processedAt).toLocaleDateString()}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Group gap="xs">
                              <ActionIcon
                                variant="light"
                                color="blue"
                                size="sm"
                                onClick={() => openViewPaymentWithData(payment)}
                              >
                                <IconEye size={14} />
                              </ActionIcon>
                              
                              {payment.status === 'Completed' && (
                                <ActionIcon
                                  variant="light"
                                  color="orange"
                                  size="sm"
                                  onClick={() => handleProcessRefund(payment.id)}
                                >
                                  <IconArrowDown size={14} />
                                </ActionIcon>
                              )}
                              
                              <Menu shadow="md" width={200}>
                                <Menu.Target>
                                  <ActionIcon variant="light" color="gray" size="sm">
                                    <IconDots size={14} />
                                  </ActionIcon>
                                </Menu.Target>
                                <Menu.Dropdown>
                                  <Menu.Item
                                    leftSection={<IconEye size={16} />}
                                    onClick={() => openViewPaymentWithData(payment)}
                                  >
                                    View Details
                                  </Menu.Item>
                                  {payment.status === 'Completed' && (
                                    <Menu.Item
                                      leftSection={<IconArrowDown size={16} />}
                                      onClick={() => handleProcessRefund(payment.id)}
                                    >
                                      Process Refund
                                    </Menu.Item>
                                  )}
                                  <Menu.Divider />
                                  <Menu.Item
                                    color="red"
                                    leftSection={<IconTrash size={16} />}
                                    onClick={() => handleDeletePayment(payment.id)}
                                  >
                                    Delete Payment
                                  </Menu.Item>
                                </Menu.Dropdown>
                              </Menu>
                            </Group>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Table.ScrollContainer>

                {filteredPayments.length === 0 && (
                  <Center py="xl">
                    <Stack align="center" gap="md">
                      <IconCreditCard size={48} color="var(--mantine-color-gray-4)" />
                      <Text c="dimmed">No payments found</Text>
                    </Stack>
                  </Center>
                )}
              </Stack>
            </Card>
          </Tabs.Panel>
        </Tabs>
      </Stack>

      {/* Create Invoice Modal */}
      <Modal
        opened={createInvoiceModalOpened}
        onClose={closeCreateInvoiceModal}
        title="Create Invoice"
        size="md"
      >
        <form onSubmit={handleCreateInvoice}>
          <Stack gap="md">
            <Select
              label="Booking"
              placeholder="Select booking"
              required
              data={bookings.map(booking => ({
                value: booking.id.toString(),
                label: `Booking #${booking.id} - ${booking.guest.firstName} ${booking.guest.lastName} (Room ${booking.room.number})`,
              }))}
              value={invoiceFormData.bookingId?.toString()}
              onChange={(value) => setInvoiceFormData(prev => ({ ...prev, bookingId: value ? parseInt(value) : undefined }))}
            />

            <NumberInput
              label="Amount"
              placeholder="Enter amount in cents"
              required
              min={0}
              value={invoiceFormData.amount}
              onChange={(value) => setInvoiceFormData(prev => ({ ...prev, amount: Number(value) }))}
            />

            <NumberInput
              label="Tax"
              placeholder="Enter tax amount in cents"
              min={0}
              value={invoiceFormData.tax}
              onChange={(value) => setInvoiceFormData(prev => ({ ...prev, tax: Number(value) }))}
            />

            <TextInput
              label="Invoice Number"
              placeholder="Auto-generated if empty"
              value={invoiceFormData.invoiceNumber || ''}
              onChange={(e) => setInvoiceFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
            />

            <Select
              label="Status"
              required
              data={[
                { value: 'Draft', label: 'Draft' },
                { value: 'Unpaid', label: 'Unpaid' },
                { value: 'Paid', label: 'Paid' },
                { value: 'Void', label: 'Void' },
              ]}
              value={invoiceFormData.status}
              onChange={(value: any) => setInvoiceFormData(prev => ({ ...prev, status: value }))}
            />

            <DatePickerInput
              label="Issue Date"
              required
              value={invoiceFormData.issueDate}
              onChange={(value) => setInvoiceFormData(prev => ({ ...prev, issueDate: value ? new Date(value) : undefined }))}
            />

            <DatePickerInput
              label="Due Date"
              value={invoiceFormData.dueDate}
              onChange={(value) => setInvoiceFormData(prev => ({ ...prev, dueDate: value ? new Date(value) : undefined }))}
            />

            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={closeCreateInvoiceModal}>
                Cancel
              </Button>
              <Button type="submit">
                Create Invoice
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Edit Invoice Modal */}
      <Modal
        opened={editInvoiceModalOpened}
        onClose={closeEditInvoiceModal}
        title="Edit Invoice"
        size="md"
      >
        <form onSubmit={handleUpdateInvoice}>
          <Stack gap="md">
            <Select
              label="Booking"
              placeholder="Select booking"
              required
              data={bookings.map(booking => ({
                value: booking.id.toString(),
                label: `Booking #${booking.id} - ${booking.guest.firstName} ${booking.guest.lastName} (Room ${booking.room.number})`,
              }))}
              value={invoiceFormData.bookingId?.toString()}
              onChange={(value) => setInvoiceFormData(prev => ({ ...prev, bookingId: value ? parseInt(value) : undefined }))}
            />

            <NumberInput
              label="Amount"
              placeholder="Enter amount in cents"
              required
              min={0}
              value={invoiceFormData.amount}
              onChange={(value) => setInvoiceFormData(prev => ({ ...prev, amount: Number(value) }))}
            />

            <NumberInput
              label="Tax"
              placeholder="Enter tax amount in cents"
              min={0}
              value={invoiceFormData.tax}
              onChange={(value) => setInvoiceFormData(prev => ({ ...prev, tax: Number(value) }))}
            />

            <TextInput
              label="Invoice Number"
              value={invoiceFormData.invoiceNumber || ''}
              onChange={(e) => setInvoiceFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
            />

            <Select
              label="Status"
              required
              data={[
                { value: 'Draft', label: 'Draft' },
                { value: 'Unpaid', label: 'Unpaid' },
                { value: 'Paid', label: 'Paid' },
                { value: 'Void', label: 'Void' },
              ]}
              value={invoiceFormData.status}
              onChange={(value: any) => setInvoiceFormData(prev => ({ ...prev, status: value }))}
            />

            <DatePickerInput
              label="Issue Date"
              required
              value={invoiceFormData.issueDate}
              onChange={(value) => setInvoiceFormData(prev => ({ ...prev, issueDate: value ? new Date(value) : undefined }))}
            />

            <DatePickerInput
              label="Due Date"
              value={invoiceFormData.dueDate}
              onChange={(value) => setInvoiceFormData(prev => ({ ...prev, dueDate: value ? new Date(value) : undefined }))}
            />

            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={closeEditInvoiceModal}>
                Cancel
              </Button>
              <Button type="submit">
                Update Invoice
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* View Invoice Modal */}
      <Modal
        opened={viewInvoiceModalOpened}
        onClose={closeViewInvoiceModal}
        title="Invoice Details"
        size="lg"
      >
        {selectedInvoice && (
          <Stack gap="md">
            <Group justify="space-between">
              <Text fw={500} size="lg">Invoice #{selectedInvoice.invoiceNumber}</Text>
              <Badge
                color={getInvoiceStatusColor(selectedInvoice.status)}
                variant="light"
                leftSection={getInvoiceStatusIcon(selectedInvoice.status)}
              >
                {selectedInvoice.status}
              </Badge>
            </Group>

            <Divider />

            <Grid>
              <Grid.Col span={6}>
                <Text size="sm" c="dimmed">Guest</Text>
                <Text fw={500}>
                  {selectedInvoice.booking?.guest ? 
                    `${selectedInvoice.booking.guest.firstName} ${selectedInvoice.booking.guest.lastName}` : 
                    'No guest'
                  }
                </Text>
                {selectedInvoice.booking?.guest?.email && (
                  <Text size="sm" c="dimmed">{selectedInvoice.booking.guest.email}</Text>
                )}
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm" c="dimmed">Room</Text>
                <Text fw={500}>
                  Room {selectedInvoice.booking?.room?.number || 'N/A'} ({selectedInvoice.booking?.room?.type})
                </Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm" c="dimmed">Amount</Text>
                <Text fw={500} size="lg">
                  {formatCurrency(selectedInvoice.amount)}
                </Text>
                {selectedInvoice.tax > 0 && (
                  <Text size="sm" c="dimmed">+{formatCurrency(selectedInvoice.tax)} tax</Text>
                )}
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm" c="dimmed">Balance</Text>
                <Text 
                  fw={500} 
                  size="lg"
                  c={selectedInvoice.remainingBalance && selectedInvoice.remainingBalance > 0 ? 'red' : 'green'}
                >
                  {formatCurrency(selectedInvoice.remainingBalance || 0)}
                </Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm" c="dimmed">Issue Date</Text>
                <Text fw={500}>
                  {selectedInvoice.issueDate ? new Date(selectedInvoice.issueDate).toLocaleDateString() : 'N/A'}
                </Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm" c="dimmed">Due Date</Text>
                <Text fw={500}>
                  {selectedInvoice.dueDate ? new Date(selectedInvoice.dueDate).toLocaleDateString() : 'N/A'}
                </Text>
              </Grid.Col>
            </Grid>

            {selectedInvoice.payments && selectedInvoice.payments.length > 0 && (
              <>
                <Divider />
                <Text fw={500}>Payments</Text>
                <Table>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Transaction ID</Table.Th>
                      <Table.Th>Amount</Table.Th>
                      <Table.Th>Method</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Date</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {selectedInvoice.payments.map((payment) => (
                      <Table.Tr key={payment.id}>
                        <Table.Td>{payment.transactionId || 'N/A'}</Table.Td>
                        <Table.Td>{formatCurrency(payment.amount)}</Table.Td>
                        <Table.Td>{payment.method || 'N/A'}</Table.Td>
                        <Table.Td>
                          <Badge
                            color={getPaymentStatusColor(payment.status)}
                            variant="light"
                            size="sm"
                          >
                            {payment.status}
                          </Badge>
                        </Table.Td>
                        <Table.Td>{new Date(payment.processedAt).toLocaleDateString()}</Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </>
            )}

            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={closeViewInvoiceModal}>
                Close
              </Button>
              <Button
                leftSection={<IconDownload size={16} />}
              >
                Download PDF
              </Button>
              {selectedInvoice.status !== 'Paid' && selectedInvoice.status !== 'Void' && (
                <Button
                  onClick={() => {
                    closeViewInvoiceModal();
                    openEditInvoiceWithData(selectedInvoice);
                  }}
                >
                  Edit Invoice
                </Button>
              )}
            </Group>
          </Stack>
        )}
      </Modal>

      {/* Create Payment Modal */}
      <Modal
        opened={createPaymentModalOpened}
        onClose={closeCreatePaymentModal}
        title="Record Payment"
        size="md"
      >
        <form onSubmit={handleCreatePayment}>
          <Stack gap="md">
            <Select
              label="Invoice"
              placeholder="Select invoice"
              required
              data={invoices
                .filter(inv => inv.status !== 'Paid' && inv.status !== 'Void')
                .map(invoice => ({
                  value: invoice.id.toString(),
                  label: `${invoice.invoiceNumber} - ${formatCurrency(invoice.amount)} (${invoice.booking?.guest?.firstName} ${invoice.booking?.guest?.lastName})`,
                }))}
              value={paymentFormData.invoiceId?.toString()}
              onChange={(value) => setPaymentFormData(prev => ({ ...prev, invoiceId: value ? parseInt(value) : undefined }))}
            />

            <NumberInput
              label="Amount"
              placeholder="Enter amount in cents"
              required
              min={0}
              value={paymentFormData.amount}
              onChange={(value) => setPaymentFormData(prev => ({ ...prev, amount: Number(value) }))}
            />

            <Select
              label="Payment Method"
              data={[
                { value: 'Credit Card', label: 'Credit Card' },
                { value: 'PayPal', label: 'PayPal' },
                { value: 'Bank Transfer', label: 'Bank Transfer' },
                { value: 'Cash', label: 'Cash' },
              ]}
              value={paymentFormData.method}
              onChange={(value: any) => setPaymentFormData(prev => ({ ...prev, method: value }))}
            />

            <Select
              label="Status"
              required
              data={[
                { value: 'Pending', label: 'Pending' },
                { value: 'Completed', label: 'Completed' },
                { value: 'Failed', label: 'Failed' },
                { value: 'Refunded', label: 'Refunded' },
              ]}
              value={paymentFormData.status}
              onChange={(value: any) => setPaymentFormData(prev => ({ ...prev, status: value }))}
            />

            <TextInput
              label="Transaction ID"
              placeholder="Payment provider transaction ID"
              value={paymentFormData.transactionId || ''}
              onChange={(e) => setPaymentFormData(prev => ({ ...prev, transactionId: e.target.value }))}
            />

            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={closeCreatePaymentModal}>
                Cancel
              </Button>
              <Button type="submit">
                Record Payment
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* View Payment Modal */}
      <Modal
        opened={viewPaymentModalOpened}
        onClose={closeViewPaymentModal}
        title="Payment Details"
        size="md"
      >
        {selectedPayment && (
          <Stack gap="md">
            <Group justify="space-between">
              <Text fw={500} size="lg">Payment #{selectedPayment.id}</Text>
              <Badge
                color={getPaymentStatusColor(selectedPayment.status)}
                variant="light"
                leftSection={getPaymentStatusIcon(selectedPayment.status)}
              >
                {selectedPayment.status}
              </Badge>
            </Group>

            <Divider />

            <Grid>
              <Grid.Col span={6}>
                <Text size="sm" c="dimmed">Transaction ID</Text>
                <Text fw={500}>
                  {selectedPayment.transactionId || 'N/A'}
                </Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm" c="dimmed">Amount</Text>
                <Text fw={500} size="lg">
                  {formatCurrency(selectedPayment.amount)}
                </Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm" c="dimmed">Payment Method</Text>
                <Text fw={500}>
                  {selectedPayment.method || 'N/A'}
                </Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm" c="dimmed">Processed Date</Text>
                <Text fw={500}>
                  {new Date(selectedPayment.processedAt).toLocaleDateString()}
                </Text>
              </Grid.Col>
              <Grid.Col span={12}>
                <Text size="sm" c="dimmed">Invoice</Text>
                <Text fw={500}>
                  {selectedPayment.invoice?.invoiceNumber || 'N/A'}
                </Text>
                {selectedPayment.invoice?.booking?.guest && (
                  <Text size="sm" c="dimmed">
                    {selectedPayment.invoice.booking.guest.firstName} {selectedPayment.invoice.booking.guest.lastName}
                  </Text>
                )}
              </Grid.Col>
            </Grid>

            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={closeViewPaymentModal}>
                Close
              </Button>
              {selectedPayment.status === 'Completed' && (
                <Button
                  color="orange"
                  leftSection={<IconArrowDown size={16} />}
                  onClick={() => {
                    closeViewPaymentModal();
                    handleProcessRefund(selectedPayment.id);
                  }}
                >
                  Process Refund
                </Button>
              )}
            </Group>
          </Stack>
        )}
      </Modal>
    </Container>
  );
}
