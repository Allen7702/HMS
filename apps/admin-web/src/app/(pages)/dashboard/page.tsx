'use client';

import { 
  Button, 
  Text, 
  Title, 
  Card, 
  SimpleGrid, 
  Group, 
  Stack,
  Badge,
  Progress,
  Avatar,
  Table,
  ActionIcon,
  Menu,
  Divider,
  Alert,
  Grid,
  Paper,
  RingProgress,
  Center
} from "@mantine/core";
import { 
  IconBed, 
  IconUsers, 
  IconCurrencyDollar, 
  IconCalendar,
  IconTrendingUp,
  IconTrendingDown,
  IconDots,
  IconEye,
  IconEdit,
  IconTrash,
  IconBell,
  IconClock,
  IconCheck,
  IconX,
  IconPlus
} from "@tabler/icons-react";
import React, { useState, useEffect } from "react";
import { useApp } from "ui";

// Mock data tailored for receptionist dashboard
const mockReceptionistData = {
  stats: {
    arrivalsToday: 8,
    departureToday: 5,
    inHouseGuests: 12,
    availableRooms: 6,
    totalRooms: 18,
    pendingCheckIns: 3,
    pendingCheckOuts: 2,
    roomMaintenanceIssues: 1
  },
  todayArrivals: [
    {
      id: 1,
      guestName: "John Mwangi",
      roomNumber: "102",
      arrivalTime: "14:00",
      status: "pending",
      phoneNumber: "+255 784 123 456",
      nights: 2,
      roomType: "Standard Double"
    },
    {
      id: 2,
      guestName: "Sarah Kimani", 
      roomNumber: "205",
      arrivalTime: "15:30",
      status: "checked-in",
      phoneNumber: "+255 754 987 654",
      nights: 1,
      roomType: "Deluxe Single"
    },
    {
      id: 3,
      guestName: "David Mbeki",
      roomNumber: "301",
      arrivalTime: "16:00",
      status: "pending",
      phoneNumber: "+255 765 456 789",
      nights: 3,
      roomType: "Suite"
    }
  ],
  todayDepartures: [
    {
      id: 4,
      guestName: "Mary Juma",
      roomNumber: "108",
      departureTime: "11:00",
      status: "checked-out",
      finalBill: 125000,
      paymentStatus: "paid"
    },
    {
      id: 5,
      guestName: "James Msomi",
      roomNumber: "203",
      departureTime: "12:00", 
      status: "pending-checkout",
      finalBill: 89000,
      paymentStatus: "pending"
    }
  ],
  roomStatus: [
    // Floor 1 - Standard Rooms
    { room: "101", status: "occupied", guest: "Alice Mushi", checkOut: "Tomorrow", floor: 1, type: "Standard" },
    { room: "102", status: "ready", guest: null, checkOut: null, floor: 1, type: "Standard" },
    { room: "103", status: "cleaning", guest: null, checkOut: null, floor: 1, type: "Standard" },
    { room: "104", status: "maintenance", guest: null, checkOut: null, floor: 1, type: "Standard" },
    { room: "105", status: "occupied", guest: "Peter Kima", checkOut: "Today", floor: 1, type: "Standard" },
    { room: "106", status: "ready", guest: null, checkOut: null, floor: 1, type: "Standard" },
    { room: "107", status: "occupied", guest: "Grace Nkomo", checkOut: "Tomorrow", floor: 1, type: "Standard" },
    { room: "108", status: "ready", guest: null, checkOut: null, floor: 1, type: "Standard" },
    
    // Floor 2 - Deluxe Rooms
    { room: "201", status: "occupied", guest: "Michael Johnson", checkOut: "Today", floor: 2, type: "Deluxe" },
    { room: "202", status: "ready", guest: null, checkOut: null, floor: 2, type: "Deluxe" },
    { room: "203", status: "occupied", guest: "James Msomi", checkOut: "Today", floor: 2, type: "Deluxe" },
    { room: "204", status: "cleaning", guest: null, checkOut: null, floor: 2, type: "Deluxe" },
    { room: "205", status: "occupied", guest: "Sarah Kimani", checkOut: "Tomorrow", floor: 2, type: "Deluxe" },
    { room: "206", status: "ready", guest: null, checkOut: null, floor: 2, type: "Deluxe" },
    { room: "207", status: "ready", guest: null, checkOut: null, floor: 2, type: "Deluxe" },
    { room: "208", status: "cleaning", guest: null, checkOut: null, floor: 2, type: "Deluxe" },
    
    // Floor 3 - Suites
    { room: "301", status: "occupied", guest: "David Mbeki", checkOut: "Sep 16", floor: 3, type: "Suite" },
    { room: "302", status: "ready", guest: null, checkOut: null, floor: 3, type: "Suite" },
    { room: "303", status: "maintenance", guest: null, checkOut: null, floor: 3, type: "Suite" },
    { room: "304", status: "ready", guest: null, checkOut: null, floor: 3, type: "Suite" },
    { room: "305", status: "occupied", guest: "Emma Wilson", checkOut: "Tomorrow", floor: 3, type: "Suite" },
    { room: "306", status: "ready", guest: null, checkOut: null, floor: 3, type: "Suite" }
  ],
  recentActivities: [
    { time: "16:45", activity: "Sarah Kimani checked into Room 205", type: "check-in", urgent: false },
    { time: "16:30", activity: "Room 203 checkout pending - payment required", type: "payment", urgent: true },
    { time: "15:20", activity: "Room 104 reported maintenance issue", type: "maintenance", urgent: true },
    { time: "14:15", activity: "Mary Juma checked out of Room 108", type: "check-out", urgent: false },
    { time: "13:30", activity: "Housekeeping completed Room 102", type: "housekeeping", urgent: false }
  ]
};

export default function DashboardPage() {
  const { hotel } = useApp();
  const [receptionistData, setReceptionistData] = useState(mockReceptionistData);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sw-TZ', {
      style: 'currency',
      currency: hotel?.settings?.currency || 'TZS'
    }).format(amount);
  };

  const occupancyRate = Math.round((receptionistData.stats.inHouseGuests / receptionistData.stats.totalRooms) * 100);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'blue';
      case 'checked-in': return 'green';
      case 'checked-out': return 'gray';
      case 'pending': return 'orange';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'check-in': return <IconCheck size={16} color="green" />;
      case 'check-out': return <IconX size={16} color="red" />;
      case 'booking': return <IconCalendar size={16} color="blue" />;
      case 'payment': return <IconCurrencyDollar size={16} color="green" />;
      case 'housekeeping': return <IconBed size={16} color="orange" />;
      default: return <IconBell size={16} />;
    }
  };

  return (
    <Stack gap="xl">
      {/* Receptionist Header */}
      <Group justify="space-between">
        <div>
          <Title order={1}>Reception Dashboard</Title>
          <Text size="sm" c="dimmed">
            Good morning! Manage check-ins, check-outs, and room status for {hotel?.name || 'your hotel'}.
          </Text>
        </div>
        <Group>
          <Button leftSection={<IconUsers size={16} />} variant="filled" color="green">
            Check In Guest
          </Button>
          <Button leftSection={<IconClock size={16} />} variant="outline" color="orange">
            Check Out Guest
          </Button>
          <Button leftSection={<IconPlus size={16} />} variant="light">
            Walk-in Booking
          </Button>
        </Group>
      </Group>

      {/* Receptionist Stats Cards */}
      <SimpleGrid cols={{ base: 2, sm: 2, md: 4 }} spacing="md">
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group justify="space-between" mb="xs">
            <Text size="sm" c="dimmed">Today's Arrivals</Text>
            <IconUsers size={20} color="blue" />
          </Group>
          <Text size="xl" fw={700}>{receptionistData.stats.arrivalsToday}</Text>
          <Group gap={4} mt="xs">
            <Badge size="xs" color="orange" variant="light">
              {receptionistData.stats.pendingCheckIns} pending
            </Badge>
          </Group>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group justify="space-between" mb="xs">
            <Text size="sm" c="dimmed">Today's Departures</Text>
            <IconClock size={20} color="orange" />
          </Group>
          <Text size="xl" fw={700}>{receptionistData.stats.departureToday}</Text>
          <Group gap={4} mt="xs">
            <Badge size="xs" color="red" variant="light">
              {receptionistData.stats.pendingCheckOuts} pending
            </Badge>
          </Group>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group justify="space-between" mb="xs">
            <Text size="sm" c="dimmed">Available Rooms</Text>
            <IconBed size={20} color="green" />
          </Group>
          <Text size="xl" fw={700}>{receptionistData.stats.availableRooms}</Text>
          <Progress 
            value={(receptionistData.stats.availableRooms / receptionistData.stats.totalRooms) * 100} 
            mt="xs" 
            size="sm" 
            color="green" 
          />
          <Text size="xs" c="dimmed" mt={4}>
            {receptionistData.stats.totalRooms - receptionistData.stats.availableRooms} occupied
          </Text>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group justify="space-between" mb="xs">
            <Text size="sm" c="dimmed">In-House Guests</Text>
            <IconUsers size={20} color="blue" />
          </Group>
          <Text size="xl" fw={700}>{receptionistData.stats.inHouseGuests}</Text>
          {receptionistData.stats.roomMaintenanceIssues > 0 && (
            <Group gap={4} mt="xs">
              <Badge size="xs" color="red" variant="light">
                {receptionistData.stats.roomMaintenanceIssues} maintenance issue
              </Badge>
            </Group>
          )}
        </Card>
      </SimpleGrid>

      <Grid>
        {/* Today's Arrivals */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between" mb="md">
              <Title order={3}>Today's Arrivals</Title>
              <Button variant="subtle" size="xs">View All Bookings</Button>
            </Group>
            
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Guest</Table.Th>
                  <Table.Th>Room</Table.Th>
                  <Table.Th>Expected Time</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Contact</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {receptionistData.todayArrivals.map((arrival) => (
                  <Table.Tr key={arrival.id}>
                    <Table.Td>
                      <Group gap="sm">
                        <Avatar size="sm" radius="xl" color="blue">
                          {arrival.guestName.split(' ').map((n: string) => n[0]).join('')}
                        </Avatar>
                        <div>
                          <Text size="sm" fw={500}>{arrival.guestName}</Text>
                          <Text size="xs" c="dimmed">{arrival.nights} night{arrival.nights > 1 ? 's' : ''} • {arrival.roomType}</Text>
                        </div>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="light" color="blue">
                        Room {arrival.roomNumber}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{arrival.arrivalTime}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={getStatusColor(arrival.status)} variant="light">
                        {arrival.status === 'pending' ? 'Expected' : 'Checked In'}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs">{arrival.phoneNumber}</Text>
                    </Table.Td>
                    <Table.Td>
                      {arrival.status === 'pending' ? (
                        <Button size="xs" color="green" variant="light">
                          Check In
                        </Button>
                      ) : (
                        <Badge color="green" variant="light">
                          Completed
                        </Badge>
                      )}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Card>
        </Grid.Col>

        {/* Recent Activities */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Title order={4} mb="md">Recent Activities</Title>
            <Stack gap="sm">
              {receptionistData.recentActivities.map((activity, index) => (
                <Group key={index} gap="sm" align="flex-start">
                  <div style={{ minWidth: 24 }}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <Group gap="xs" mb={2}>
                      <Text size="xs" c="dimmed">{activity.time}</Text>
                      {activity.urgent && (
                        <Badge size="xs" color="red" variant="light">Urgent</Badge>
                      )}
                    </Group>
                    <Text size="sm">{activity.activity}</Text>
                  </div>
                </Group>
              ))}
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Today's Departures */}
      <Grid>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Stack gap="sm">
            {/* Urgent Alerts */}
            {receptionistData.stats.pendingCheckOuts > 0 && (
              <Alert color="orange" title="Pending Check-outs" icon={<IconClock size={16} />}>
                {receptionistData.stats.pendingCheckOuts} guest{receptionistData.stats.pendingCheckOuts > 1 ? 's' : ''} ready for check-out. Process payment and room inspection.
              </Alert>
            )}
            
            {receptionistData.stats.roomMaintenanceIssues > 0 && (
              <Alert color="red" title="Room Maintenance Required" icon={<IconBell size={16} />}>
                Room 104 requires maintenance attention. Contact housekeeping team immediately.
              </Alert>
            )}
            
            {/* Today's Departures Table */}
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between" mb="md">
                <Title order={4}>Today's Departures</Title>
                <Badge color="orange" variant="light">
                  {receptionistData.todayDepartures.length} departures
                </Badge>
              </Group>
              
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Guest</Table.Th>
                    <Table.Th>Room</Table.Th>
                    <Table.Th>Departure Time</Table.Th>
                    <Table.Th>Bill Amount</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Action</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {receptionistData.todayDepartures.map((departure) => (
                    <Table.Tr key={departure.id}>
                      <Table.Td>
                        <Text size="sm" fw={500}>{departure.guestName}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge variant="light" color="orange">
                          Room {departure.roomNumber}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{departure.departureTime}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" fw={500}>{formatCurrency(departure.finalBill)}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge 
                          color={departure.paymentStatus === 'paid' ? 'green' : 'red'} 
                          variant="light"
                        >
                          {departure.paymentStatus}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        {departure.status === 'pending-checkout' ? (
                          <Button size="xs" color="orange" variant="light">
                            Process Checkout
                          </Button>
                        ) : (
                          <Badge color="green" variant="light">
                            Completed
                          </Badge>
                        )}
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Card>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack gap="md">
            {/* Reception Quick Actions */}
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Title order={4} mb="md">Reception Actions</Title>
              <Stack gap="sm">
                <Button variant="light" color="blue" fullWidth leftSection={<IconUsers size={16} />}>
                  Guest Directory
                </Button>
                <Button variant="light" color="green" fullWidth leftSection={<IconBed size={16} />}>
                  Room Management
                </Button>
                <Button variant="light" color="orange" fullWidth leftSection={<IconCurrencyDollar size={16} />}>
                  Payment Processing
                </Button>
                <Button variant="light" color="purple" fullWidth leftSection={<IconCalendar size={16} />}>
                  Booking Calendar
                </Button>
              </Stack>
            </Card>

            {/* Shift Summary */}
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Title order={4} mb="md">Today's Summary</Title>
              <Stack gap="sm">
                <Group justify="space-between">
                  <Text size="sm">Arrivals Processed</Text>
                  <Text size="sm" fw={500}>
                    {receptionistData.stats.arrivalsToday - receptionistData.stats.pendingCheckIns} / {receptionistData.stats.arrivalsToday}
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">Departures Processed</Text>
                  <Text size="sm" fw={500}>
                    {receptionistData.stats.departureToday - receptionistData.stats.pendingCheckOuts} / {receptionistData.stats.departureToday}
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">Occupancy Rate</Text>
                  <Badge color={occupancyRate > 80 ? 'green' : occupancyRate > 60 ? 'yellow' : 'orange'} variant="light">
                    {occupancyRate}%
                  </Badge>
                </Group>
                <Divider />
                <Group justify="space-between">
                  <Text size="sm" fw={500}>Rooms Available</Text>
                  <Text size="sm" fw={500} c="green">{receptionistData.stats.availableRooms}</Text>
                </Group>
              </Stack>
            </Card>
          </Stack>
        </Grid.Col>
      </Grid>

      {/* Rooms Grid by Floor */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Group mb="md">
          <IconBed size={24} />
          <Title order={3}>Room Status Overview</Title>
        </Group>

        {/* Status Legend */}
        <Group gap="lg" mb="xl">
          <Group gap="xs">
            <div style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: '#10b981' }}></div>
            <Text size="sm">Available</Text>
          </Group>
          <Group gap="xs">
            <div style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: '#ef4444' }}></div>
            <Text size="sm">Occupied</Text>
          </Group>
          <Group gap="xs">
            <div style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: '#f59e0b' }}></div>
            <Text size="sm">Cleaning</Text>
          </Group>
          <Group gap="xs">
            <div style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: '#3b82f6' }}></div>
            <Text size="sm">Out of Service</Text>
          </Group>
        </Group>

        {/* 1st Floor */}
        <div>
          <Title order={4} mb="md" c="gray.6">1st Floor</Title>
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" mb="xl">
            {receptionistData.roomStatus
              .filter((room) => room.floor === 1)
              .map((room, index) => (
                <Paper
                  key={index}
                   radius="md"
                  withBorder
                  style={{
                    backgroundColor: 
                      room.status === 'occupied' ? '#fee2e2' : 
                      room.status === 'ready' ? '#dcfce7' : 
                      room.status === 'cleaning' ? '#fef3c7' : 
                      room.status === 'maintenance' ? '#dbeafe' : '#f3f4f6',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <Text fw={500}>Room {room.room}</Text>
                  {room.guest && (
                    <Text size="xs" c="dimmed">{room.guest}</Text>
                  )}
                  <Text size="xs" c="dimmed">{room.type} Room</Text>
                </Paper>
              ))}
          </SimpleGrid>
        </div>

        {/* 2nd Floor */}
        <div>
          <Title order={4} mb="md" c="gray.6">2nd Floor</Title>
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" mb="xl">
            {receptionistData.roomStatus
              .filter((room) => room.floor === 2)
              .map((room, index) => (
                <Paper
                  key={index}
                   radius="md"
                  withBorder
                  style={{
                    backgroundColor: 
                      room.status === 'occupied' ? '#fee2e2' : 
                      room.status === 'ready' ? '#dcfce7' : 
                      room.status === 'cleaning' ? '#fef3c7' : 
                      room.status === 'maintenance' ? '#dbeafe' : '#f3f4f6',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <Text fw={500}>Room {room.room}</Text>
                  {room.guest && (
                    <Text size="xs" c="dimmed">{room.guest}</Text>
                  )}
                  <Text size="xs" c="dimmed">{room.type} Room</Text>
                </Paper>
              ))}
          </SimpleGrid>
        </div>

        {/* 3rd Floor */}
        <div>
          <Title order={4} mb="md" c="gray.6">3rd Floor</Title>
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
            {receptionistData.roomStatus
              .filter((room) => room.floor === 3)
              .map((room, index) => (
                <Paper
                  key={index}
                   radius="md"
                  withBorder
                  style={{
                    backgroundColor: 
                      room.status === 'occupied' ? '#fee2e2' : 
                      room.status === 'ready' ? '#dcfce7' : 
                      room.status === 'cleaning' ? '#fef3c7' : 
                      room.status === 'maintenance' ? '#dbeafe' : '#f3f4f6',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <Text fw={500}>Room {room.room}</Text>
                  {room.guest && (
                    <Text size="xs" c="dimmed">{room.guest}</Text>
                  )}
                  <Text size="xs" c="dimmed">{room.type} Room</Text>
                </Paper>
              ))}
          </SimpleGrid>
        </div>

        {receptionistData.roomStatus.length === 0 && (
          <Text c="dimmed">No rooms available</Text>
        )}
      </Card>
    </Stack>
  );
}