'use client';

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
  Avatar,
  ActionIcon,
  Menu,
  Modal,
  SimpleGrid,
  Tabs,
  Alert,
  Divider,
  Paper,
  NumberInput,
  Textarea,
  Grid,
  RingProgress,
  Center
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import {
  IconSearch,
  IconPlus,
  IconCalendar,
  IconBed,
  IconPhone,
  IconMail,
  IconDots,
  IconEye,
  IconEdit,
  IconTrash,
  IconClock,
  IconCheck,
  IconX,
  IconCurrencyDollar,
  IconAlertCircle,
  IconCalendarEvent,
  IconUsers,
  IconMapPin,
  IconCreditCard,
  IconFileText,
  IconClockHour4,
  IconBellRinging
} from "@tabler/icons-react";
import React, { useState } from "react";
import { useApp } from "ui";

// Mock booking data
const mockBookingsData = {
  confirmed: [
    {
      id: 1,
      bookingReference: "BK001234",
      guestName: "John Mwangi",
      guestEmail: "john.mwangi@gmail.com",
      guestPhone: "+255 784 123 456",
      checkIn: "2025-09-15",
      checkOut: "2025-09-17",
      nights: 2,
      roomType: "Standard Double",
      roomNumber: "102",
      adults: 2,
      children: 1,
      totalAmount: 180000,
      paidAmount: 90000,
      paymentStatus: "partial",
      bookingStatus: "confirmed",
      bookingDate: "2025-09-01",
      source: "Direct",
      specialRequests: "Late check-in requested",
      nationality: "Tanzanian"
    },
    {
      id: 2,
      bookingReference: "BK001235",
      guestName: "Sarah Kimani",
      guestEmail: "sarah.k@yahoo.com",
      guestPhone: "+255 754 987 654",
      checkIn: "2025-09-14",
      checkOut: "2025-09-15",
      nights: 1,
      roomType: "Deluxe Single",
      roomNumber: "205",
      adults: 1,
      children: 0,
      totalAmount: 120000,
      paidAmount: 120000,
      paymentStatus: "paid",
      bookingStatus: "confirmed",
      bookingDate: "2025-08-28",
      source: "Booking.com",
      specialRequests: "Ground floor room preferred",
      nationality: "Kenyan"
    }
  ],
  pending: [
    {
      id: 3,
      bookingReference: "BK001236",
      guestName: "David Mbeki",
      guestEmail: "d.mbeki@gmail.com",
      guestPhone: "+255 765 456 789",
      checkIn: "2025-09-16",
      checkOut: "2025-09-19",
      nights: 3,
      roomType: "Suite",
      roomNumber: null,
      adults: 2,
      children: 2,
      totalAmount: 450000,
      paidAmount: 0,
      paymentStatus: "unpaid",
      bookingStatus: "pending",
      bookingDate: "2025-09-12",
      source: "Phone",
      specialRequests: "Extra beds for children",
      nationality: "South African"
    }
  ],
  cancelled: [
    {
      id: 4,
      bookingReference: "BK001237",
      guestName: "Mary Juma",
      guestEmail: "mary.juma@hotmail.com",
      guestPhone: "+255 678 123 456",
      checkIn: "2025-09-10",
      checkOut: "2025-09-12",
      nights: 2,
      roomType: "Standard Single",
      roomNumber: null,
      adults: 1,
      children: 0,
      totalAmount: 160000,
      paidAmount: 0,
      paymentStatus: "unpaid",
      bookingStatus: "cancelled",
      bookingDate: "2025-09-05",
      source: "Direct",
      specialRequests: null,
      nationality: "Tanzanian",
      cancellationReason: "Change of plans",
      cancellationDate: "2025-09-08"
    }
  ]
};

const roomTypes = [
  "Standard Single",
  "Standard Double", 
  "Deluxe Single",
  "Deluxe Double",
  "Suite",
  "Family Room"
];

const bookingSources = [
  "Direct",
  "Booking.com",
  "Expedia",
  "Agoda",
  "Phone",
  "Email",
  "Walk-in"
];

export default function BookingsPage() {
  const { currentHotel } = useApp();
  const [activeTab, setActiveTab] = useState("confirmed");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterSource, setFilterSource] = useState("");
  const [newBookingOpened, setNewBookingOpened] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingDetailsOpened, setBookingDetailsOpened] = useState(false);

  // Get bookings based on active tab
  const getBookings = () => {
    return mockBookingsData[activeTab] || [];
  };

  // Filter bookings based on search and filters
  const filteredBookings = getBookings().filter(booking => {
    const matchesSearch = 
      booking.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.bookingReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.guestPhone.includes(searchQuery) ||
      booking.guestEmail.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !filterStatus || booking.paymentStatus === filterStatus;
    const matchesSource = !filterSource || booking.source === filterSource;
    
    return matchesSearch && matchesStatus && matchesSource;
  });

  // Get booking statistics
  const getBookingStats = () => {
    const allBookings = [...mockBookingsData.confirmed, ...mockBookingsData.pending, ...mockBookingsData.cancelled];
    const totalRevenue = mockBookingsData.confirmed.reduce((sum, booking) => sum + booking.totalAmount, 0);
    const pendingPayments = mockBookingsData.confirmed.reduce((sum, booking) => 
      sum + (booking.totalAmount - booking.paidAmount), 0);
    
    return {
      totalBookings: allBookings.length,
      confirmedBookings: mockBookingsData.confirmed.length,
      pendingBookings: mockBookingsData.pending.length,
      cancelledBookings: mockBookingsData.cancelled.length,
      totalRevenue,
      pendingPayments,
      occupancyRate: Math.round((mockBookingsData.confirmed.length / 18) * 100) // Assuming 18 total rooms
    };
  };

  const stats = getBookingStats();

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmed': return 'green';
      case 'pending': return 'yellow'; 
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch(status) {
      case 'paid': return 'green';
      case 'partial': return 'yellow';
      case 'unpaid': return 'red';
      default: return 'gray';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('sw-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('sw-TZ', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
    setBookingDetailsOpened(true);
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="center">
        <Title order={1}>Bookings Management</Title>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => setNewBookingOpened(true)}
        >
          New Booking
        </Button>
      </Group>

      {/* Statistics Cards */}
      <SimpleGrid cols={{ base: 2, sm: 4 }}>
        <Card withBorder>
          <Group justify="space-between">
            <Stack gap="xs">
              <Text size="sm" c="dimmed">Total Bookings</Text>
              <Text size="xl" fw={700}>{stats.totalBookings}</Text>
            </Stack>
            <IconCalendarEvent size={24} color="blue" />
          </Group>
        </Card>

        <Card withBorder>
          <Group justify="space-between">
            <Stack gap="xs">
              <Text size="sm" c="dimmed">Confirmed</Text>
              <Text size="xl" fw={700} c="green">{stats.confirmedBookings}</Text>
            </Stack>
            <IconCheck size={24} color="green" />
          </Group>
        </Card>

        <Card withBorder>
          <Group justify="space-between">
            <Stack gap="xs">
              <Text size="sm" c="dimmed">Total Revenue</Text>
              <Text size="lg" fw={700}>{formatCurrency(stats.totalRevenue)}</Text>
            </Stack>
            <IconCurrencyDollar size={24} color="green" />
          </Group>
        </Card>

        <Card withBorder>
          <Group justify="space-between">
            <Stack gap="xs">
              <Text size="sm" c="dimmed">Occupancy Rate</Text>
              <Group gap="xs">
                <RingProgress
                  size={50}
                  thickness={6}
                  sections={[{ value: stats.occupancyRate, color: 'blue' }]}
                />
                <Text size="xl" fw={700}>{stats.occupancyRate}%</Text>
              </Group>
            </Stack>
          </Group>
        </Card>
      </SimpleGrid>

      {/* Outstanding Payments Alert */}
      {stats.pendingPayments > 0 && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Outstanding Payments"
          color="yellow"
        >
          Total pending payments: <strong>{formatCurrency(stats.pendingPayments)}</strong>
        </Alert>
      )}

      {/* Search and Filters */}
      <Card withBorder>
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              placeholder="Search by guest name, booking reference, phone, or email"
              leftSection={<IconSearch size={16} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 6, md: 3 }}>
            <Select
              placeholder="Payment Status"
              data={[
                { value: '', label: 'All Payment Status' },
                { value: 'paid', label: 'Paid' },
                { value: 'partial', label: 'Partial Payment' },
                { value: 'unpaid', label: 'Unpaid' }
              ]}
              value={filterStatus}
              onChange={setFilterStatus}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 6, md: 3 }}>
            <Select
              placeholder="Booking Source"
              data={[
                { value: '', label: 'All Sources' },
                ...bookingSources.map(source => ({ value: source, label: source }))
              ]}
              value={filterSource}
              onChange={setFilterSource}
            />
          </Grid.Col>
        </Grid>
      </Card>

      {/* Bookings Tabs */}
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="confirmed" leftSection={<IconCheck size={16} />}>
            Confirmed ({mockBookingsData.confirmed.length})
          </Tabs.Tab>
          <Tabs.Tab value="pending" leftSection={<IconClock size={16} />}>
            Pending ({mockBookingsData.pending.length})
          </Tabs.Tab>
          <Tabs.Tab value="cancelled" leftSection={<IconX size={16} />}>
            Cancelled ({mockBookingsData.cancelled.length})
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value={activeTab} pt="md">
          <Card withBorder>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Guest</Table.Th>
                  <Table.Th>Booking Ref</Table.Th>
                  <Table.Th>Check-in / Check-out</Table.Th>
                  <Table.Th>Room</Table.Th>
                  <Table.Th>Guests</Table.Th>
                  <Table.Th>Amount</Table.Th>
                  <Table.Th>Payment</Table.Th>
                  <Table.Th>Source</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredBookings.map((booking) => (
                  <Table.Tr key={booking.id}>
                    <Table.Td>
                      <Group gap="sm">
                        <Avatar color="blue" radius="xl">
                          {booking.guestName.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                        <Stack gap={0}>
                          <Text size="sm" fw={500}>{booking.guestName}</Text>
                          <Text size="xs" c="dimmed">{booking.guestPhone}</Text>
                        </Stack>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Stack gap={0}>
                        <Text size="sm" fw={500}>{booking.bookingReference}</Text>
                        <Text size="xs" c="dimmed">
                          {formatDate(booking.bookingDate)}
                        </Text>
                      </Stack>
                    </Table.Td>
                    <Table.Td>
                      <Stack gap={0}>
                        <Text size="sm">{formatDate(booking.checkIn)}</Text>
                        <Text size="sm">{formatDate(booking.checkOut)}</Text>
                        <Text size="xs" c="dimmed">{booking.nights} nights</Text>
                      </Stack>
                    </Table.Td>
                    <Table.Td>
                      <Stack gap={0}>
                        <Text size="sm">{booking.roomType}</Text>
                        {booking.roomNumber && (
                          <Badge size="sm" variant="light">
                            Room {booking.roomNumber}
                          </Badge>
                        )}
                      </Stack>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">
                        {booking.adults} Adult{booking.adults !== 1 ? 's' : ''}
                        {booking.children > 0 && `, ${booking.children} Child${booking.children !== 1 ? 'ren' : ''}`}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Stack gap={0}>
                        <Text size="sm" fw={500}>
                          {formatCurrency(booking.totalAmount)}
                        </Text>
                        {booking.paidAmount > 0 && (
                          <Text size="xs" c="dimmed">
                            Paid: {formatCurrency(booking.paidAmount)}
                          </Text>
                        )}
                      </Stack>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={getPaymentStatusColor(booking.paymentStatus)} size="sm">
                        {booking.paymentStatus}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="light" size="sm">
                        {booking.source}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Menu shadow="md" width={200}>
                        <Menu.Target>
                          <ActionIcon variant="subtle">
                            <IconDots size={16} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item 
                            leftSection={<IconEye size={16} />}
                            onClick={() => handleViewBooking(booking)}
                          >
                            View Details
                          </Menu.Item>
                          <Menu.Item leftSection={<IconEdit size={16} />}>
                            Edit Booking
                          </Menu.Item>
                          {activeTab === 'pending' && (
                            <Menu.Item leftSection={<IconCheck size={16} />} color="green">
                              Confirm Booking
                            </Menu.Item>
                          )}
                          {activeTab !== 'cancelled' && (
                            <Menu.Item leftSection={<IconX size={16} />} color="red">
                              Cancel Booking
                            </Menu.Item>
                          )}
                          {booking.paymentStatus !== 'paid' && (
                            <>
                              <Menu.Divider />
                              <Menu.Item leftSection={<IconCurrencyDollar size={16} />} color="blue">
                                Record Payment
                              </Menu.Item>
                            </>
                          )}
                        </Menu.Dropdown>
                      </Menu>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
            
            {filteredBookings.length === 0 && (
              <Center py="xl">
                <Stack align="center" gap="sm">
                  <IconCalendarEvent size={48} color="gray" />
                  <Text c="dimmed">No bookings found</Text>
                </Stack>
              </Center>
            )}
          </Card>
        </Tabs.Panel>
      </Tabs>

      {/* New Booking Modal */}
      <Modal
        opened={newBookingOpened}
        onClose={() => setNewBookingOpened(false)}
        title="Create New Booking"
        size="xl"
      >
        <Stack gap="md">
          <Grid>
            <Grid.Col span={6}>
              <TextInput
                label="Guest Name"
                placeholder="Enter guest name"
                required
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="Phone Number"
                placeholder="+255 xxx xxx xxx"
                required
              />
            </Grid.Col>
          </Grid>
          
          <Grid>
            <Grid.Col span={6}>
              <TextInput
                label="Email"
                placeholder="guest@example.com"
                type="email"
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="Nationality"
                placeholder="Enter nationality"
              />
            </Grid.Col>
          </Grid>

          <Grid>
            <Grid.Col span={6}>
              <DatePickerInput
                label="Check-in Date"
                placeholder="Select check-in date"
                required
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <DatePickerInput
                label="Check-out Date"
                placeholder="Select check-out date"
                required
              />
            </Grid.Col>
          </Grid>

          <Grid>
            <Grid.Col span={4}>
              <Select
                label="Room Type"
                placeholder="Select room type"
                data={roomTypes}
                required
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <NumberInput
                label="Adults"
                placeholder="Number of adults"
                min={1}
                max={6}
                required
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <NumberInput
                label="Children"
                placeholder="Number of children"
                min={0}
                max={4}
              />
            </Grid.Col>
          </Grid>

          <Grid>
            <Grid.Col span={6}>
              <NumberInput
                label="Total Amount (TZS)"
                placeholder="Enter total amount"
                min={0}
                hideControls
                required
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Select
                label="Booking Source"
                placeholder="Select booking source"
                data={bookingSources}
                required
              />
            </Grid.Col>
          </Grid>

          <Textarea
            label="Special Requests"
            placeholder="Any special requests from the guest"
            rows={3}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={() => setNewBookingOpened(false)}>
              Cancel
            </Button>
            <Button onClick={() => setNewBookingOpened(false)}>
              Create Booking
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <Modal
          opened={bookingDetailsOpened}
          onClose={() => {
            setBookingDetailsOpened(false);
            setSelectedBooking(null);
          }}
          title={`Booking Details - ${selectedBooking.bookingReference}`}
          size="lg"
        >
          <Stack gap="md">
            <SimpleGrid cols={2}>
              <Paper p="md" withBorder>
                <Stack gap="xs">
                  <Text size="sm" c="dimmed">Guest Information</Text>
                  <Text fw={500}>{selectedBooking.guestName}</Text>
                  <Group gap="xs">
                    <IconPhone size={14} />
                    <Text size="sm">{selectedBooking.guestPhone}</Text>
                  </Group>
                  <Group gap="xs">
                    <IconMail size={14} />
                    <Text size="sm">{selectedBooking.guestEmail}</Text>
                  </Group>
                  <Group gap="xs">
                    <IconMapPin size={14} />
                    <Text size="sm">{selectedBooking.nationality}</Text>
                  </Group>
                </Stack>
              </Paper>

              <Paper p="md" withBorder>
                <Stack gap="xs">
                  <Text size="sm" c="dimmed">Booking Information</Text>
                  <Text fw={500}>{selectedBooking.bookingReference}</Text>
                  <Group gap="xs">
                    <IconCalendar size={14} />
                    <Text size="sm">
                      {formatDate(selectedBooking.checkIn)} - {formatDate(selectedBooking.checkOut)}
                    </Text>
                  </Group>
                  <Group gap="xs">
                    <IconClockHour4 size={14} />
                    <Text size="sm">{selectedBooking.nights} nights</Text>
                  </Group>
                  <Badge color={getStatusColor(selectedBooking.bookingStatus)}>
                    {selectedBooking.bookingStatus}
                  </Badge>
                </Stack>
              </Paper>
            </SimpleGrid>

            <SimpleGrid cols={2}>
              <Paper p="md" withBorder>
                <Stack gap="xs">
                  <Text size="sm" c="dimmed">Room Information</Text>
                  <Text fw={500}>{selectedBooking.roomType}</Text>
                  {selectedBooking.roomNumber && (
                    <Group gap="xs">
                      <IconBed size={14} />
                      <Text size="sm">Room {selectedBooking.roomNumber}</Text>
                    </Group>
                  )}
                  <Group gap="xs">
                    <IconUsers size={14} />
                    <Text size="sm">
                      {selectedBooking.adults} Adult{selectedBooking.adults !== 1 ? 's' : ''}
                      {selectedBooking.children > 0 && `, ${selectedBooking.children} Child${selectedBooking.children !== 1 ? 'ren' : ''}`}
                    </Text>
                  </Group>
                </Stack>
              </Paper>

              <Paper p="md" withBorder>
                <Stack gap="xs">
                  <Text size="sm" c="dimmed">Payment Information</Text>
                  <Text fw={500}>{formatCurrency(selectedBooking.totalAmount)}</Text>
                  <Group gap="xs">
                    <IconCreditCard size={14} />
                    <Text size="sm">Paid: {formatCurrency(selectedBooking.paidAmount)}</Text>
                  </Group>
                  {selectedBooking.totalAmount > selectedBooking.paidAmount && (
                    <Text size="sm" c="red">
                      Balance: {formatCurrency(selectedBooking.totalAmount - selectedBooking.paidAmount)}
                    </Text>
                  )}
                  <Badge color={getPaymentStatusColor(selectedBooking.paymentStatus)}>
                    {selectedBooking.paymentStatus}
                  </Badge>
                </Stack>
              </Paper>
            </SimpleGrid>

            {selectedBooking.specialRequests && (
              <Paper p="md" withBorder>
                <Stack gap="xs">
                  <Text size="sm" c="dimmed">Special Requests</Text>
                  <Text size="sm">{selectedBooking.specialRequests}</Text>
                </Stack>
              </Paper>
            )}

            {selectedBooking.bookingStatus === 'cancelled' && (
              <Paper p="md" withBorder bg="red.0">
                <Stack gap="xs">
                  <Text size="sm" c="red" fw={500}>Cancellation Details</Text>
                  <Text size="sm">Reason: {selectedBooking.cancellationReason}</Text>
                  <Text size="sm">Date: {formatDate(selectedBooking.cancellationDate)}</Text>
                </Stack>
              </Paper>
            )}

            <Group justify="flex-end" mt="md">
              <Button variant="subtle" onClick={() => setBookingDetailsOpened(false)}>
                Close
              </Button>
              <Button>Edit Booking</Button>
            </Group>
          </Stack>
        </Modal>
      )}
    </Stack>
  );
}
