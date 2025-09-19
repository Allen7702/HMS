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
  Center,
  Tooltip,
  Switch,
  ColorSwatch,
  Avatar,
  Progress
} from "@mantine/core";
import {
  IconSearch,
  IconPlus,
  IconBed,
  IconUsers,
  IconTools,
  IconDots,
  IconEye,
  IconEdit,
  IconTrash,
  IconCheck,
  IconX,
  IconClock,
  IconAlertCircle,
  IconSparkles,
  IconWifi,
  IconAirConditioning,
  IconDeviceTv,
  IconBath,
  IconCoffee,
  IconCar,
  IconPhone,
  IconMapPin,
  IconSettings,
  IconHome,
  IconKey,
  IconSpray,
  IconBug,
  IconPalette
} from "@tabler/icons-react";
import React, { useState } from "react";
import { useApp } from "ui";

// Mock rooms data
const mockRoomsData = {
  rooms: [
    {
      id: 1,
      number: "101",
      floor: 1,
      type: "Standard Single",
      status: "available",
      housekeepingStatus: "clean",
      maxOccupancy: 1,
      currentGuest: null,
      amenities: ["wifi", "tv", "ac", "phone"],
      rate: 80000,
      size: 25,
      bedType: "Single",
      lastCleaned: "2025-09-13T08:00:00Z",
      nextMaintenance: "2025-09-20",
      maintenanceIssues: [],
      notes: ""
    },
    {
      id: 2,
      number: "102",
      floor: 1,
      type: "Standard Double",
      status: "occupied",
      housekeepingStatus: "clean",
      maxOccupancy: 2,
      currentGuest: "John Mwangi",
      checkOutDate: "2025-09-17",
      amenities: ["wifi", "tv", "ac", "phone", "minibar"],
      rate: 120000,
      size: 30,
      bedType: "Double",
      lastCleaned: "2025-09-12T10:30:00Z",
      nextMaintenance: "2025-09-25",
      maintenanceIssues: [],
      notes: "Guest requested extra towels"
    },
    {
      id: 3,
      number: "103",
      floor: 1,
      type: "Standard Single",
      status: "maintenance",
      housekeepingStatus: "dirty",
      maxOccupancy: 1,
      currentGuest: null,
      amenities: ["wifi", "tv", "phone"],
      rate: 80000,
      size: 25,
      bedType: "Single",
      lastCleaned: "2025-09-11T14:00:00Z",
      nextMaintenance: "2025-09-14",
      maintenanceIssues: ["AC not working", "Bathroom tap leaking"],
      notes: "Maintenance scheduled for tomorrow"
    },
    {
      id: 4,
      number: "201",
      floor: 2,
      type: "Deluxe Single",
      status: "available",
      housekeepingStatus: "clean",
      maxOccupancy: 1,
      currentGuest: null,
      amenities: ["wifi", "tv", "ac", "phone", "minibar", "balcony"],
      rate: 100000,
      size: 35,
      bedType: "Queen",
      lastCleaned: "2025-09-13T09:15:00Z",
      nextMaintenance: "2025-09-30",
      maintenanceIssues: [],
      notes: ""
    },
    {
      id: 5,
      number: "202",
      floor: 2,
      type: "Deluxe Double",
      status: "checkout",
      housekeepingStatus: "dirty",
      maxOccupancy: 2,
      currentGuest: null,
      amenities: ["wifi", "tv", "ac", "phone", "minibar", "balcony"],
      rate: 150000,
      size: 40,
      bedType: "King",
      lastCleaned: "2025-09-12T16:00:00Z",
      nextMaintenance: "2025-10-05",
      maintenanceIssues: [],
      notes: "Guest checked out this morning, needs cleaning"
    },
    {
      id: 6,
      number: "301",
      floor: 3,
      type: "Suite",
      status: "occupied",
      housekeepingStatus: "clean",
      maxOccupancy: 4,
      currentGuest: "David Mbeki",
      checkOutDate: "2025-09-19",
      amenities: ["wifi", "tv", "ac", "phone", "minibar", "balcony", "kitchenette", "living_area"],
      rate: 250000,
      size: 60,
      bedType: "King + Sofa bed",
      lastCleaned: "2025-09-13T07:00:00Z",
      nextMaintenance: "2025-10-15",
      maintenanceIssues: [],
      notes: "VIP guest, extra attention required"
    }
  ],
  roomTypes: [
    {
      name: "Standard Single",
      baseRate: 80000,
      maxOccupancy: 1,
      size: 25,
      amenities: ["wifi", "tv", "ac", "phone"],
      description: "Comfortable single room with essential amenities"
    },
    {
      name: "Standard Double", 
      baseRate: 120000,
      maxOccupancy: 2,
      size: 30,
      amenities: ["wifi", "tv", "ac", "phone", "minibar"],
      description: "Spacious double room perfect for couples"
    },
    {
      name: "Deluxe Single",
      baseRate: 100000,
      maxOccupancy: 1,
      size: 35,
      amenities: ["wifi", "tv", "ac", "phone", "minibar", "balcony"],
      description: "Premium single room with balcony view"
    },
    {
      name: "Deluxe Double",
      baseRate: 150000,
      maxOccupancy: 2,
      size: 40,
      amenities: ["wifi", "tv", "ac", "phone", "minibar", "balcony"],
      description: "Luxury double room with scenic balcony"
    },
    {
      name: "Suite",
      baseRate: 250000,
      maxOccupancy: 4,
      size: 60,
      amenities: ["wifi", "tv", "ac", "phone", "minibar", "balcony", "kitchenette", "living_area"],
      description: "Spacious suite with separate living area and kitchenette"
    }
  ]
};

const roomStatusColors = {
  available: 'green',
  occupied: 'blue', 
  maintenance: 'red',
  checkout: 'yellow',
  blocked: 'gray'
};

const housekeepingStatusColors = {
  clean: 'green',
  dirty: 'red',
  cleaning: 'yellow',
  inspected: 'blue'
};

const amenityIcons: Record<string, any> = {
  wifi: IconWifi,
  tv: IconDeviceTv,
  ac: IconAirConditioning,
  phone: IconPhone,
  minibar: IconCoffee,
  balcony: IconHome,
  kitchenette: IconCoffee,
  living_area: IconUsers,
  parking: IconCar,
  bathtub: IconBath
};

export default function RoomsPage() {
  const { currentHotel } = useApp();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterFloor, setFilterFloor] = useState("");
  const [filterType, setFilterType] = useState("");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomDetailsOpened, setRoomDetailsOpened] = useState(false);
  const [newRoomOpened, setNewRoomOpened] = useState(false);
  const [bulkActionOpened, setBulkActionOpened] = useState(false);

  // Get filtered rooms
  const filteredRooms = mockRoomsData.rooms.filter(room => {
    const matchesSearch = 
      room.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (room.currentGuest && room.currentGuest.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = !filterStatus || room.status === filterStatus;
    const matchesFloor = !filterFloor || room.floor.toString() === filterFloor;
    const matchesType = !filterType || room.type === filterType;
    
    return matchesSearch && matchesStatus && matchesFloor && matchesType;
  });

  // Get room statistics
  const getRoomStats = () => {
    const totalRooms = mockRoomsData.rooms.length;
    const availableRooms = mockRoomsData.rooms.filter(r => r.status === 'available').length;
    const occupiedRooms = mockRoomsData.rooms.filter(r => r.status === 'occupied').length;
    const maintenanceRooms = mockRoomsData.rooms.filter(r => r.status === 'maintenance').length;
    const checkoutRooms = mockRoomsData.rooms.filter(r => r.status === 'checkout').length;
    const dirtyRooms = mockRoomsData.rooms.filter(r => r.housekeepingStatus === 'dirty').length;
    const occupancyRate = Math.round((occupiedRooms / totalRooms) * 100);
    
    const totalRevenue = mockRoomsData.rooms
      .filter(r => r.status === 'occupied')
      .reduce((sum, room) => sum + room.rate, 0);

    return {
      totalRooms,
      availableRooms,
      occupiedRooms,
      maintenanceRooms,
      checkoutRooms,
      dirtyRooms,
      occupancyRate,
      totalRevenue
    };
  };

  const stats = getRoomStats();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('sw-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('sw-TZ', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewRoom = (room) => {
    setSelectedRoom(room);
    setRoomDetailsOpened(true);
  };

  const getStatusBadge = (status) => (
    <Badge color={roomStatusColors[status]} size="sm">
      {status}
    </Badge>
  );

  const getHousekeepingBadge = (status) => (
    <Badge color={housekeepingStatusColors[status]} size="sm" variant="light">
      {status}
    </Badge>
  );

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="center">
        <Title order={1}>Room Management</Title>
        <Group>
          <Button
            variant="light"
            leftSection={<IconSettings size={16} />}
            onClick={() => setBulkActionOpened(true)}
          >
            Bulk Actions
          </Button>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => setNewRoomOpened(true)}
          >
            Add Room
          </Button>
        </Group>
      </Group>

      {/* Statistics Cards */}
      <SimpleGrid cols={{ base: 2, sm: 4 }}>
        <Card withBorder>
          <Group justify="space-between">
            <Stack gap="xs">
              <Text size="sm" c="dimmed">Total Rooms</Text>
              <Text size="xl" fw={700}>{stats.totalRooms}</Text>
            </Stack>
            <IconBed size={24} color="blue" />
          </Group>
        </Card>

        <Card withBorder>
          <Group justify="space-between">
            <Stack gap="xs">
              <Text size="sm" c="dimmed">Available</Text>
              <Text size="xl" fw={700} c="green">{stats.availableRooms}</Text>
            </Stack>
            <IconCheck size={24} color="green" />
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

        <Card withBorder>
          <Group justify="space-between">
            <Stack gap="xs">
              <Text size="sm" c="dimmed">Daily Revenue</Text>
              <Text size="lg" fw={700}>{formatCurrency(stats.totalRevenue)}</Text>
            </Stack>
            <IconUsers size={24} color="green" />
          </Group>
        </Card>
      </SimpleGrid>

      {/* Maintenance Alert */}
      {stats.maintenanceRooms > 0 && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Rooms Requiring Attention"
          color="orange"
        >
          <Group>
            <Text>
              {stats.maintenanceRooms} room{stats.maintenanceRooms !== 1 ? 's' : ''} in maintenance
            </Text>
            {stats.dirtyRooms > 0 && (
              <Text>
                • {stats.dirtyRooms} room{stats.dirtyRooms !== 1 ? 's' : ''} need cleaning
              </Text>
            )}
          </Group>
        </Alert>
      )}

      {/* Search and Filters */}
      <Card withBorder>
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              placeholder="Search by room number, type, or current guest"
              leftSection={<IconSearch size={16} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 6, md: 2 }}>
            <Select
              placeholder="Status"
              data={[
                { value: '', label: 'All Status' },
                { value: 'available', label: 'Available' },
                { value: 'occupied', label: 'Occupied' },
                { value: 'maintenance', label: 'Maintenance' },
                { value: 'checkout', label: 'Checkout' }
              ]}
              value={filterStatus}
              onChange={setFilterStatus}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 6, md: 2 }}>
            <Select
              placeholder="Floor"
              data={[
                { value: '', label: 'All Floors' },
                { value: '1', label: 'Floor 1' },
                { value: '2', label: 'Floor 2' },
                { value: '3', label: 'Floor 3' }
              ]}
              value={filterFloor}
              onChange={setFilterFloor}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 2 }}>
            <Select
              placeholder="Room Type"
              data={[
                { value: '', label: 'All Types' },
                ...mockRoomsData.roomTypes.map(type => ({ value: type.name, label: type.name }))
              ]}
              value={filterType}
              onChange={setFilterType}
            />
          </Grid.Col>
        </Grid>
      </Card>

      {/* Room Management Tabs */}
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="overview" leftSection={<IconBed size={16} />}>
            Room Overview
          </Tabs.Tab>
          <Tabs.Tab value="housekeeping" leftSection={<IconSparkles size={16} />}>
            Housekeeping ({stats.dirtyRooms})
          </Tabs.Tab>
          <Tabs.Tab value="maintenance" leftSection={<IconTools size={16} />}>
            Maintenance ({stats.maintenanceRooms})
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview" pt="md">
          <Card withBorder>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Room</Table.Th>
                  <Table.Th>Type</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Housekeeping</Table.Th>
                  <Table.Th>Current Guest</Table.Th>
                  <Table.Th>Rate</Table.Th>
                  <Table.Th>Amenities</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredRooms.map((room) => (
                  <Table.Tr key={room.id}>
                    <Table.Td>
                      <Group gap="sm">
                        <Avatar color="blue" radius="xl" size="sm">
                          {room.number}
                        </Avatar>
                        <Stack gap={0}>
                          <Text size="sm" fw={500}>Room {room.number}</Text>
                          <Text size="xs" c="dimmed">Floor {room.floor}</Text>
                        </Stack>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Stack gap={0}>
                        <Text size="sm">{room.type}</Text>
                        <Text size="xs" c="dimmed">{room.size}m² • {room.bedType}</Text>
                      </Stack>
                    </Table.Td>
                    <Table.Td>
                      {getStatusBadge(room.status)}
                    </Table.Td>
                    <Table.Td>
                      {getHousekeepingBadge(room.housekeepingStatus)}
                    </Table.Td>
                    <Table.Td>
                      {room.currentGuest ? (
                        <Stack gap={0}>
                          <Text size="sm" fw={500}>{room.currentGuest}</Text>
                          {room.checkOutDate && (
                            <Text size="xs" c="dimmed">
                              Until {new Date(room.checkOutDate).toLocaleDateString()}
                            </Text>
                          )}
                        </Stack>
                      ) : (
                        <Text size="sm" c="dimmed">Vacant</Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" fw={500}>{formatCurrency(room.rate)}</Text>
                      <Text size="xs" c="dimmed">per night</Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        {room.amenities.slice(0, 3).map((amenity) => {
                          const Icon = amenityIcons[amenity];
                          return Icon ? (
                            <Tooltip key={amenity} label={amenity}>
                              <Icon size={16} />
                            </Tooltip>
                          ) : null;
                        })}
                        {room.amenities.length > 3 && (
                          <Text size="xs" c="dimmed">+{room.amenities.length - 3}</Text>
                        )}
                      </Group>
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
                            onClick={() => handleViewRoom(room)}
                          >
                            View Details
                          </Menu.Item>
                          <Menu.Item leftSection={<IconEdit size={16} />}>
                            Edit Room
                          </Menu.Item>
                          <Menu.Divider />
                          {room.status === 'available' && (
                            <Menu.Item leftSection={<IconKey size={16} />} color="blue">
                              Check In Guest
                            </Menu.Item>
                          )}
                          {room.status === 'occupied' && (
                            <Menu.Item leftSection={<IconCheck size={16} />} color="green">
                              Check Out Guest
                            </Menu.Item>
                          )}
                          {room.housekeepingStatus === 'dirty' && (
                            <Menu.Item leftSection={<IconSpray size={16} />} color="orange">
                              Mark as Cleaned
                            </Menu.Item>
                          )}
                          <Menu.Item leftSection={<IconTools size={16} />} color="red">
                            Report Maintenance
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
            
            {filteredRooms.length === 0 && (
              <Center py="xl">
                <Stack align="center" gap="sm">
                  <IconBed size={48} color="gray" />
                  <Text c="dimmed">No rooms found</Text>
                </Stack>
              </Center>
            )}
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="housekeeping" pt="md">
          <Card withBorder>
            <Stack gap="md">
              <Text fw={500}>Rooms Requiring Housekeeping Attention</Text>
              <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }}>
                {mockRoomsData.rooms
                  .filter(room => room.housekeepingStatus === 'dirty' || room.status === 'checkout')
                  .map(room => (
                    <Paper key={room.id} p="md" withBorder>
                      <Group justify="space-between" mb="xs">
                        <Text fw={500}>Room {room.number}</Text>
                        {getHousekeepingBadge(room.housekeepingStatus)}
                      </Group>
                      <Stack gap="xs">
                        <Text size="sm" c="dimmed">{room.type}</Text>
                        <Text size="sm">Last cleaned: {formatDateTime(room.lastCleaned)}</Text>
                        {room.notes && (
                          <Text size="sm" c="orange">{room.notes}</Text>
                        )}
                        <Button size="xs" variant="light" leftSection={<IconSpray size={14} />}>
                          Assign Cleaning
                        </Button>
                      </Stack>
                    </Paper>
                  ))}
              </SimpleGrid>
            </Stack>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="maintenance" pt="md">
          <Card withBorder>
            <Stack gap="md">
              <Text fw={500}>Rooms with Maintenance Issues</Text>
              <SimpleGrid cols={{ base: 1, md: 2 }}>
                {mockRoomsData.rooms
                  .filter(room => room.status === 'maintenance' || room.maintenanceIssues.length > 0)
                  .map(room => (
                    <Paper key={room.id} p="md" withBorder>
                      <Group justify="space-between" mb="xs">
                        <Text fw={500}>Room {room.number}</Text>
                        <Badge color="red" size="sm">Maintenance</Badge>
                      </Group>
                      <Stack gap="xs">
                        <Text size="sm" c="dimmed">{room.type}</Text>
                        {room.maintenanceIssues.length > 0 && (
                          <Stack gap="xs">
                            <Text size="sm" fw={500}>Issues:</Text>
                            {room.maintenanceIssues.map((issue, index) => (
                              <Group key={index} gap="xs">
                                <IconBug size={14} color="red" />
                                <Text size="sm">{issue}</Text>
                              </Group>
                            ))}
                          </Stack>
                        )}
                        <Text size="sm">
                          Scheduled: {new Date(room.nextMaintenance).toLocaleDateString()}
                        </Text>
                        <Group>
                          <Button size="xs" variant="light">Assign Technician</Button>
                          <Button size="xs" variant="outline">Mark Resolved</Button>
                        </Group>
                      </Stack>
                    </Paper>
                  ))}
              </SimpleGrid>
            </Stack>
          </Card>
        </Tabs.Panel>
      </Tabs>

      {/* Room Details Modal */}
      {selectedRoom && (
        <Modal
          opened={roomDetailsOpened}
          onClose={() => {
            setRoomDetailsOpened(false);
            setSelectedRoom(null);
          }}
          title={`Room ${selectedRoom.number} Details`}
          size="lg"
        >
          <Stack gap="md">
            <SimpleGrid cols={2}>
              <Paper p="md" withBorder>
                <Stack gap="xs">
                  <Text size="sm" c="dimmed">Room Information</Text>
                  <Text fw={500}>Room {selectedRoom.number}</Text>
                  <Text size="sm">Floor {selectedRoom.floor}</Text>
                  <Text size="sm">{selectedRoom.type}</Text>
                  <Text size="sm">{selectedRoom.size}m² • {selectedRoom.bedType}</Text>
                  <Text size="sm">Max occupancy: {selectedRoom.maxOccupancy}</Text>
                </Stack>
              </Paper>

              <Paper p="md" withBorder>
                <Stack gap="xs">
                  <Text size="sm" c="dimmed">Current Status</Text>
                  {getStatusBadge(selectedRoom.status)}
                  {getHousekeepingBadge(selectedRoom.housekeepingStatus)}
                  <Text size="sm" fw={500}>{formatCurrency(selectedRoom.rate)}/night</Text>
                  {selectedRoom.currentGuest && (
                    <Text size="sm">Guest: {selectedRoom.currentGuest}</Text>
                  )}
                </Stack>
              </Paper>
            </SimpleGrid>

            <Paper p="md" withBorder>
              <Stack gap="xs">
                <Text size="sm" c="dimmed">Amenities</Text>
                <Group>
                  {selectedRoom.amenities.map((amenity) => {
                    const Icon = amenityIcons[amenity];
                    return (
                      <Group key={amenity} gap="xs">
                        {Icon && <Icon size={16} />}
                        <Text size="sm">{amenity}</Text>
                      </Group>
                    );
                  })}
                </Group>
              </Stack>
            </Paper>

            <SimpleGrid cols={2}>
              <Paper p="md" withBorder>
                <Stack gap="xs">
                  <Text size="sm" c="dimmed">Housekeeping</Text>
                  <Text size="sm">Last cleaned: {formatDateTime(selectedRoom.lastCleaned)}</Text>
                  <Text size="sm">Status: {selectedRoom.housekeepingStatus}</Text>
                </Stack>
              </Paper>

              <Paper p="md" withBorder>
                <Stack gap="xs">
                  <Text size="sm" c="dimmed">Maintenance</Text>
                  <Text size="sm">
                    Next scheduled: {new Date(selectedRoom.nextMaintenance).toLocaleDateString()}
                  </Text>
                  {selectedRoom.maintenanceIssues.length > 0 && (
                    <Text size="sm" c="red">
                      {selectedRoom.maintenanceIssues.length} active issue{selectedRoom.maintenanceIssues.length !== 1 ? 's' : ''}
                    </Text>
                  )}
                </Stack>
              </Paper>
            </SimpleGrid>

            {selectedRoom.notes && (
              <Paper p="md" withBorder>
                <Stack gap="xs">
                  <Text size="sm" c="dimmed">Notes</Text>
                  <Text size="sm">{selectedRoom.notes}</Text>
                </Stack>
              </Paper>
            )}

            <Group justify="flex-end" mt="md">
              <Button variant="subtle" onClick={() => setRoomDetailsOpened(false)}>
                Close
              </Button>
              <Button>Edit Room</Button>
            </Group>
          </Stack>
        </Modal>
      )}

      {/* New Room Modal */}
      <Modal
        opened={newRoomOpened}
        onClose={() => setNewRoomOpened(false)}
        title="Add New Room"
        size="lg"
      >
        <Stack gap="md">
          <Grid>
            <Grid.Col span={6}>
              <TextInput
                label="Room Number"
                placeholder="Enter room number"
                required
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Select
                label="Floor"
                placeholder="Select floor"
                data={[
                  { value: '1', label: 'Floor 1' },
                  { value: '2', label: 'Floor 2' },
                  { value: '3', label: 'Floor 3' }
                ]}
                required
              />
            </Grid.Col>
          </Grid>

          <Grid>
            <Grid.Col span={6}>
              <Select
                label="Room Type"
                placeholder="Select room type"
                data={mockRoomsData.roomTypes.map(type => ({ value: type.name, label: type.name }))}
                required
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <NumberInput
                label="Rate per Night (TZS)"
                placeholder="Enter rate"
                min={0}
                hideControls
                required
              />
            </Grid.Col>
          </Grid>

          <Grid>
            <Grid.Col span={4}>
              <NumberInput
                label="Size (m²)"
                placeholder="Room size"
                min={1}
                required
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <NumberInput
                label="Max Occupancy"
                placeholder="Max guests"
                min={1}
                max={8}
                required
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <TextInput
                label="Bed Type"
                placeholder="e.g., King, Queen"
                required
              />
            </Grid.Col>
          </Grid>

          <Textarea
            label="Description"
            placeholder="Room description and features"
            rows={3}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={() => setNewRoomOpened(false)}>
              Cancel
            </Button>
            <Button onClick={() => setNewRoomOpened(false)}>
              Add Room
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Bulk Actions Modal */}
      <Modal
        opened={bulkActionOpened}
        onClose={() => setBulkActionOpened(false)}
        title="Bulk Room Actions"
        size="md"
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Perform actions on multiple rooms at once
          </Text>
          
          <Button.Group orientation="vertical">
            <Button variant="light" leftSection={<IconSpray size={16} />}>
              Mark Selected as Clean
            </Button>
            <Button variant="light" leftSection={<IconTools size={16} />}>
              Schedule Maintenance
            </Button>
            <Button variant="light" leftSection={<IconX size={16} />}>
              Block Selected Rooms
            </Button>
          </Button.Group>

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={() => setBulkActionOpened(false)}>
              Cancel
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
