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
  Alert,
  Paper,
  Textarea,
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
  IconExclamationMark,
  IconUser,
  IconClipboardCheck,
  IconClipboardX,
  IconFilter,
  IconRefresh,
  IconSettings,
  IconHistory,
  IconArrowUp,
  IconArrowDown,
  IconMinus,
} from "@tabler/icons-react";
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { MaintenanceAPI, type Maintenance, type MaintenanceHistoryEntry } from 'api';

interface MaintenanceStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
}

interface Room {
  id: number;
  number: string;
  type: string;
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export default function MaintenancePage() {
  // State management
  const [maintenanceRequests, setMaintenanceRequests] = useState<Maintenance[]>([]);
  const [stats, setStats] = useState<MaintenanceStats>({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    highPriority: 0,
    mediumPriority: 0,
    lowPriority: 0,
  });
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  // Filters
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [roomFilter, setRoomFilter] = useState<string>('all');

  // Modal states
  const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] = useDisclosure(false);
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);
  const [viewModalOpened, { open: openViewModal, close: closeViewModal }] = useDisclosure(false);
  const [historyModalOpened, { open: openHistoryModal, close: closeHistoryModal }] = useDisclosure(false);
  const [selectedRequest, setSelectedRequest] = useState<Maintenance | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    roomId: '',
    description: '',
    status: 'Open' as 'Open' | 'In Progress' | 'Resolved',
    priority: 'Medium' as 'Low' | 'Medium' | 'High',
    assigneeId: '',
  });

  // Active tab
  const [activeTab, setActiveTab] = useState<string>('all');

  // Load initial data
  useEffect(() => {
    loadMaintenanceData();
    loadSupportingData();
  }, []);

  // Load maintenance requests and stats
  const loadMaintenanceData = async () => {
    try {
      setLoading(true);
      const [requestsData, statsData] = await Promise.all([
        MaintenanceAPI.getMaintenanceRequests(),
        MaintenanceAPI.getMaintenanceStats(),
      ]);
      
      setMaintenanceRequests(requestsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading maintenance data:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load maintenance data',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  // Load supporting data (rooms, users)
  const loadSupportingData = async () => {
    try {
      // TODO: Replace with actual API calls when available
      // For now, using mock data
      setRooms([
        { id: 1, number: '101', type: 'Standard' },
        { id: 2, number: '102', type: 'Deluxe' },
        { id: 3, number: '201', type: 'Suite' },
        { id: 4, number: '202', type: 'Standard' },
        { id: 5, number: '301', type: 'Suite' },
      ]);
      
      setUsers([
        { id: 1, firstName: 'John', lastName: 'Doe', email: 'john.doe@hotel.com' },
        { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@hotel.com' },
        { id: 3, firstName: 'Mike', lastName: 'Johnson', email: 'mike.johnson@hotel.com' },
      ]);
    } catch (error) {
      console.error('Error loading supporting data:', error);
    }
  };

  // Filter requests based on current filters
  const filteredRequests = useMemo(() => {
    return maintenanceRequests.filter((request) => {
      // Search filter
      if (searchValue) {
        const searchLower = searchValue.toLowerCase();
        const roomNumber = request.room?.number?.toLowerCase() || '';
        const assigneeName = request.assignee ? 
          `${request.assignee.firstName} ${request.assignee.lastName}`.toLowerCase() : '';
        const description = request.description?.toLowerCase() || '';
        
        if (!roomNumber.includes(searchLower) && 
            !assigneeName.includes(searchLower) && 
            !description.includes(searchLower)) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'all' && request.status !== statusFilter) {
        return false;
      }

      // Priority filter
      if (priorityFilter !== 'all' && request.priority !== priorityFilter) {
        return false;
      }

      // Assignee filter
      if (assigneeFilter !== 'all' && request.assigneeId?.toString() !== assigneeFilter) {
        return false;
      }

      // Room filter
      if (roomFilter !== 'all' && request.roomId?.toString() !== roomFilter) {
        return false;
      }

      return true;
    });
  }, [maintenanceRequests, searchValue, statusFilter, priorityFilter, assigneeFilter, roomFilter]);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'red';
      case 'In Progress': return 'blue';
      case 'Resolved': return 'green';
      default: return 'gray';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'red';
      case 'Medium': return 'orange';
      case 'Low': return 'green';
      default: return 'gray';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Open': return <IconAlertCircle size={16} />;
      case 'In Progress': return <IconSettings size={16} />;
      case 'Resolved': return <IconCheck size={16} />;
      default: return <IconClock size={16} />;
    }
  };

  // Get priority icon
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'High': return <IconArrowUp size={16} />;
      case 'Medium': return <IconMinus size={16} />;
      case 'Low': return <IconArrowDown size={16} />;
      default: return <IconMinus size={16} />;
    }
  };

  // Handle create request
  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await MaintenanceAPI.createMaintenanceRequest({
        roomId: parseInt(formData.roomId),
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        assigneeId: formData.assigneeId ? parseInt(formData.assigneeId) : null,
        history: null,
      });

      notifications.show({
        title: 'Success',
        message: 'Maintenance request created successfully',
        color: 'green',
      });

      closeCreateModal();
      resetForm();
      loadMaintenanceData();
    } catch (error) {
      console.error('Error creating request:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to create maintenance request',
        color: 'red',
      });
    }
  };

  // Handle update request
  const handleUpdateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    try {
      await MaintenanceAPI.updateMaintenanceRequest(selectedRequest.id, {
        roomId: parseInt(formData.roomId),
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        assigneeId: formData.assigneeId ? parseInt(formData.assigneeId) : null,
      });

      notifications.show({
        title: 'Success',
        message: 'Maintenance request updated successfully',
        color: 'green',
      });

      closeEditModal();
      resetForm();
      loadMaintenanceData();
    } catch (error) {
      console.error('Error updating request:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to update maintenance request',
        color: 'red',
      });
    }
  };

  // Handle resolve request
  const handleResolveRequest = async (requestId: number) => {
    try {
      await MaintenanceAPI.resolveRequest(requestId);
      notifications.show({
        title: 'Success',
        message: 'Request marked as resolved',
        color: 'green',
      });
      loadMaintenanceData();
    } catch (error) {
      console.error('Error resolving request:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to resolve request',
        color: 'red',
      });
    }
  };

  // Handle delete request
  const handleDeleteRequest = async (requestId: number) => {
    try {
      await MaintenanceAPI.deleteMaintenanceRequest(requestId);
      notifications.show({
        title: 'Success',
        message: 'Maintenance request deleted successfully',
        color: 'green',
      });
      loadMaintenanceData();
    } catch (error) {
      console.error('Error deleting request:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to delete maintenance request',
        color: 'red',
      });
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      roomId: '',
      description: '',
      status: 'Open' as 'Open' | 'In Progress' | 'Resolved',
      priority: 'Medium' as 'Low' | 'Medium' | 'High',
      assigneeId: '',
    });
    setSelectedRequest(null);
  };

  // Open edit modal with request data
  const openEditWithRequest = (request: Maintenance) => {
    setSelectedRequest(request);
    setFormData({
      roomId: request.roomId?.toString() || '',
      description: request.description,
      status: request.status,
      priority: request.priority,
      assigneeId: request.assigneeId?.toString() || '',
    });
    openEditModal();
  };

  // Open view modal with request data
  const openViewWithRequest = (request: Maintenance) => {
    setSelectedRequest(request);
    openViewModal();
  };

  // Open history modal with request data
  const openHistoryWithRequest = (request: Maintenance) => {
    setSelectedRequest(request);
    openHistoryModal();
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
          <Title order={2}>Maintenance Management</Title>
          <Group>
            <Button
              leftSection={<IconRefresh size={16} />}
              variant="light"
              onClick={loadMaintenanceData}
            >
              Refresh
            </Button>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={openCreateModal}
            >
              Add Request
            </Button>
          </Group>
        </Group>

        {/* Stats Cards */}
        <SimpleGrid cols={{ base: 2, sm: 3, lg: 7 }}>
          <Card padding="lg" radius="md" withBorder>
            <Group justify="space-between">
              <div>
                <Text c="dimmed" size="sm" fw={500}>
                  Total
                </Text>
                <Text fw={700} size="xl">
                  {stats.total}
                </Text>
              </div>
              <IconClipboardCheck size={32} color="var(--mantine-color-blue-6)" />
            </Group>
          </Card>

          <Card padding="lg" radius="md" withBorder>
            <Group justify="space-between">
              <div>
                <Text c="dimmed" size="sm" fw={500}>
                  Open
                </Text>
                <Text fw={700} size="xl" c="red">
                  {stats.open}
                </Text>
              </div>
              <IconAlertCircle size={32} color="var(--mantine-color-red-6)" />
            </Group>
          </Card>

          <Card padding="lg" radius="md" withBorder>
            <Group justify="space-between">
              <div>
                <Text c="dimmed" size="sm" fw={500}>
                  In Progress
                </Text>
                <Text fw={700} size="xl" c="blue">
                  {stats.inProgress}
                </Text>
              </div>
              <IconSettings size={32} color="var(--mantine-color-blue-6)" />
            </Group>
          </Card>

          <Card padding="lg" radius="md" withBorder>
            <Group justify="space-between">
              <div>
                <Text c="dimmed" size="sm" fw={500}>
                  Resolved
                </Text>
                <Text fw={700} size="xl" c="green">
                  {stats.resolved}
                </Text>
              </div>
              <IconCheck size={32} color="var(--mantine-color-green-6)" />
            </Group>
          </Card>

          <Card padding="lg" radius="md" withBorder>
            <Group justify="space-between">
              <div>
                <Text c="dimmed" size="sm" fw={500}>
                  High Priority
                </Text>
                <Text fw={700} size="xl" c="red">
                  {stats.highPriority}
                </Text>
              </div>
              <IconArrowUp size={32} color="var(--mantine-color-red-6)" />
            </Group>
          </Card>

          <Card padding="lg" radius="md" withBorder>
            <Group justify="space-between">
              <div>
                <Text c="dimmed" size="sm" fw={500}>
                  Medium Priority
                </Text>
                <Text fw={700} size="xl" c="orange">
                  {stats.mediumPriority}
                </Text>
              </div>
              <IconMinus size={32} color="var(--mantine-color-orange-6)" />
            </Group>
          </Card>

          <Card padding="lg" radius="md" withBorder>
            <Group justify="space-between">
              <div>
                <Text c="dimmed" size="sm" fw={500}>
                  Low Priority
                </Text>
                <Text fw={700} size="xl" c="green">
                  {stats.lowPriority}
                </Text>
              </div>
              <IconArrowDown size={32} color="var(--mantine-color-green-6)" />
            </Group>
          </Card>
        </SimpleGrid>

        {/* Filters */}
        <Card padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Text fw={500}>Filters</Text>
            <Grid>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <TextInput
                  placeholder="Search requests..."
                  leftSection={<IconSearch size={16} />}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
                <Select
                  placeholder="Status"
                  data={[
                    { value: 'all', label: 'All Status' },
                    { value: 'Open', label: 'Open' },
                    { value: 'In Progress', label: 'In Progress' },
                    { value: 'Resolved', label: 'Resolved' },
                  ]}
                  value={statusFilter}
                  onChange={(value) => setStatusFilter(value || 'all')}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
                <Select
                  placeholder="Priority"
                  data={[
                    { value: 'all', label: 'All Priorities' },
                    { value: 'High', label: 'High' },
                    { value: 'Medium', label: 'Medium' },
                    { value: 'Low', label: 'Low' },
                  ]}
                  value={priorityFilter}
                  onChange={(value) => setPriorityFilter(value || 'all')}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
                <Select
                  placeholder="Assignee"
                  data={[
                    { value: 'all', label: 'All Assignees' },
                    ...users.map(user => ({
                      value: user.id.toString(),
                      label: `${user.firstName} ${user.lastName}`,
                    })),
                  ]}
                  value={assigneeFilter}
                  onChange={(value) => setAssigneeFilter(value || 'all')}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Select
                  placeholder="Room"
                  data={[
                    { value: 'all', label: 'All Rooms' },
                    ...rooms.map(room => ({
                      value: room.id.toString(),
                      label: `Room ${room.number}`,
                    })),
                  ]}
                  value={roomFilter}
                  onChange={(value) => setRoomFilter(value || 'all')}
                />
              </Grid.Col>
            </Grid>
          </Stack>
        </Card>

        {/* Requests Table */}
        <Card padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Group justify="space-between">
              <Text fw={500} size="lg">Maintenance Requests</Text>
              <Text c="dimmed" size="sm">
                {filteredRequests.length} of {maintenanceRequests.length} requests
              </Text>
            </Group>

            <Table.ScrollContainer minWidth={1000}>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Room</Table.Th>
                    <Table.Th>Description</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Priority</Table.Th>
                    <Table.Th>Assignee</Table.Th>
                    <Table.Th>Created</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filteredRequests.map((request) => (
                    <Table.Tr key={request.id}>
                      <Table.Td>
                        <Group gap="xs">
                          <IconBed size={16} />
                          <div>
                            <Text size="sm" fw={500}>
                              Room {request.room?.number || 'N/A'}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {request.room?.type}
                            </Text>
                          </div>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" lineClamp={2}>
                          {request.description}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          color={getStatusColor(request.status)}
                          variant="light"
                          leftSection={getStatusIcon(request.status)}
                        >
                          {request.status}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          color={getPriorityColor(request.priority)}
                          variant="light"
                          leftSection={getPriorityIcon(request.priority)}
                        >
                          {request.priority}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        {request.assignee ? (
                          <Group gap="xs">
                            <Avatar size="sm" radius="xl">
                              {(request.assignee.firstName?.[0] || '') + (request.assignee.lastName?.[0] || '')}
                            </Avatar>
                            <div>
                              <Text size="sm" fw={500}>
                                {request.assignee.firstName} {request.assignee.lastName}
                              </Text>
                              <Text size="xs" c="dimmed">
                                {request.assignee.email}
                              </Text>
                            </div>
                          </Group>
                        ) : (
                          <Text size="sm" c="dimmed">Unassigned</Text>
                        )}
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <ActionIcon
                            variant="light"
                            color="blue"
                            size="sm"
                            onClick={() => openViewWithRequest(request)}
                          >
                            <IconEye size={14} />
                          </ActionIcon>
                          
                          <ActionIcon
                            variant="light"
                            color="gray"
                            size="sm"
                            onClick={() => openHistoryWithRequest(request)}
                          >
                            <IconHistory size={14} />
                          </ActionIcon>
                          
                          {request.status !== 'Resolved' && (
                            <ActionIcon
                              variant="light"
                              color="green"
                              size="sm"
                              onClick={() => handleResolveRequest(request.id)}
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
                                onClick={() => openViewWithRequest(request)}
                              >
                                View Details
                              </Menu.Item>
                              <Menu.Item
                                leftSection={<IconHistory size={16} />}
                                onClick={() => openHistoryWithRequest(request)}
                              >
                                View History
                              </Menu.Item>
                              <Menu.Item
                                leftSection={<IconEdit size={16} />}
                                onClick={() => openEditWithRequest(request)}
                              >
                                Edit Request
                              </Menu.Item>
                              {request.status !== 'Resolved' && (
                                <Menu.Item
                                  leftSection={<IconCheck size={16} />}
                                  onClick={() => handleResolveRequest(request.id)}
                                >
                                  Mark Resolved
                                </Menu.Item>
                              )}
                              <Menu.Divider />
                              <Menu.Item
                                color="red"
                                leftSection={<IconTrash size={16} />}
                                onClick={() => handleDeleteRequest(request.id)}
                              >
                                Delete Request
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

            {filteredRequests.length === 0 && (
              <Center py="xl">
                <Stack align="center" gap="md">
                  <IconClipboardX size={48} color="var(--mantine-color-gray-4)" />
                  <Text c="dimmed">No maintenance requests found</Text>
                </Stack>
              </Center>
            )}
          </Stack>
        </Card>
      </Stack>

      {/* Create Request Modal */}
      <Modal
        opened={createModalOpened}
        onClose={closeCreateModal}
        title="Create Maintenance Request"
        size="md"
      >
        <form onSubmit={handleCreateRequest}>
          <Stack gap="md">
            <Select
              label="Room"
              placeholder="Select room"
              required
              data={rooms.map(room => ({
                value: room.id.toString(),
                label: `Room ${room.number} (${room.type})`,
              }))}
              value={formData.roomId}
              onChange={(value) => setFormData(prev => ({ ...prev, roomId: value || '' }))}
            />

            <Textarea
              label="Description"
              placeholder="Describe the maintenance issue"
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />

            <Select
              label="Priority"
              required
              data={[
                { value: 'Low', label: 'Low' },
                { value: 'Medium', label: 'Medium' },
                { value: 'High', label: 'High' },
              ]}
              value={formData.priority}
              onChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}
            />

            <Select
              label="Status"
              required
              data={[
                { value: 'Open', label: 'Open' },
                { value: 'In Progress', label: 'In Progress' },
                { value: 'Resolved', label: 'Resolved' },
              ]}
              value={formData.status}
              onChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
            />

            <Select
              label="Assignee"
              placeholder="Select assignee (optional)"
              clearable
              data={users.map(user => ({
                value: user.id.toString(),
                label: `${user.firstName} ${user.lastName}`,
              }))}
              value={formData.assigneeId}
              onChange={(value) => setFormData(prev => ({ ...prev, assigneeId: value || '' }))}
            />

            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={closeCreateModal}>
                Cancel
              </Button>
              <Button type="submit">
                Create Request
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Edit Request Modal */}
      <Modal
        opened={editModalOpened}
        onClose={closeEditModal}
        title="Edit Maintenance Request"
        size="md"
      >
        <form onSubmit={handleUpdateRequest}>
          <Stack gap="md">
            <Select
              label="Room"
              placeholder="Select room"
              required
              data={rooms.map(room => ({
                value: room.id.toString(),
                label: `Room ${room.number} (${room.type})`,
              }))}
              value={formData.roomId}
              onChange={(value) => setFormData(prev => ({ ...prev, roomId: value || '' }))}
            />

            <Textarea
              label="Description"
              placeholder="Describe the maintenance issue"
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />

            <Select
              label="Priority"
              required
              data={[
                { value: 'Low', label: 'Low' },
                { value: 'Medium', label: 'Medium' },
                { value: 'High', label: 'High' },
              ]}
              value={formData.priority}
              onChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}
            />

            <Select
              label="Status"
              required
              data={[
                { value: 'Open', label: 'Open' },
                { value: 'In Progress', label: 'In Progress' },
                { value: 'Resolved', label: 'Resolved' },
              ]}
              value={formData.status}
              onChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
            />

            <Select
              label="Assignee"
              placeholder="Select assignee (optional)"
              clearable
              data={users.map(user => ({
                value: user.id.toString(),
                label: `${user.firstName} ${user.lastName}`,
              }))}
              value={formData.assigneeId}
              onChange={(value) => setFormData(prev => ({ ...prev, assigneeId: value || '' }))}
            />

            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={closeEditModal}>
                Cancel
              </Button>
              <Button type="submit">
                Update Request
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* View Request Modal */}
      <Modal
        opened={viewModalOpened}
        onClose={closeViewModal}
        title="Request Details"
        size="md"
      >
        {selectedRequest && (
          <Stack gap="md">
            <Group justify="space-between">
              <Text fw={500}>Request #{selectedRequest.id}</Text>
              <Group>
                <Badge
                  color={getStatusColor(selectedRequest.status)}
                  variant="light"
                  leftSection={getStatusIcon(selectedRequest.status)}
                >
                  {selectedRequest.status}
                </Badge>
                <Badge
                  color={getPriorityColor(selectedRequest.priority)}
                  variant="light"
                  leftSection={getPriorityIcon(selectedRequest.priority)}
                >
                  {selectedRequest.priority}
                </Badge>
              </Group>
            </Group>

            <Divider />

            <Grid>
              <Grid.Col span={6}>
                <Text size="sm" c="dimmed">Room</Text>
                <Text fw={500}>
                  Room {selectedRequest.room?.number || 'N/A'} ({selectedRequest.room?.type})
                </Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm" c="dimmed">Assignee</Text>
                <Text fw={500}>
                  {selectedRequest.assignee ? 
                    `${selectedRequest.assignee.firstName} ${selectedRequest.assignee.lastName}` : 
                    'Unassigned'
                  }
                </Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm" c="dimmed">Created</Text>
                <Text fw={500}>
                  {new Date(selectedRequest.createdAt).toLocaleDateString()}
                </Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm" c="dimmed">Last Updated</Text>
                <Text fw={500}>
                  {new Date(selectedRequest.updatedAt).toLocaleDateString()}
                </Text>
              </Grid.Col>
            </Grid>

            <Divider />

            <div>
              <Text size="sm" c="dimmed" mb="xs">Description</Text>
              <Text>{selectedRequest.description}</Text>
            </div>

            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={closeViewModal}>
                Close
              </Button>
              <Button
                leftSection={<IconHistory size={16} />}
                onClick={() => {
                  closeViewModal();
                  openHistoryWithRequest(selectedRequest);
                }}
              >
                View History
              </Button>
              {selectedRequest.status !== 'Resolved' && (
                <Button
                  onClick={() => {
                    closeViewModal();
                    openEditWithRequest(selectedRequest);
                  }}
                >
                  Edit Request
                </Button>
              )}
            </Group>
          </Stack>
        )}
      </Modal>

      {/* History Modal */}
      <Modal
        opened={historyModalOpened}
        onClose={closeHistoryModal}
        title="Request History"
        size="lg"
      >
        {selectedRequest && (
          <Stack gap="md">
            <Group justify="space-between">
              <Text fw={500}>Request #{selectedRequest.id} History</Text>
              <Badge
                color={getStatusColor(selectedRequest.status)}
                variant="light"
              >
                {selectedRequest.status}
              </Badge>
            </Group>

            <ScrollArea h={400}>
              <Timeline active={-1} bulletSize={24} lineWidth={2}>
                {Array.isArray(selectedRequest.history) && selectedRequest.history.length > 0 ? (
                  (selectedRequest.history as unknown as MaintenanceHistoryEntry[]).map((entry, index) => (
                    <Timeline.Item
                      key={index}
                      bullet={
                        <ThemeIcon
                          size={20}
                          variant="filled"
                          color={entry.action === 'Created' ? 'blue' : 
                                 entry.action.includes('Status') ? 'green' : 
                                 entry.action.includes('Priority') ? 'orange' : 'gray'}
                        >
                          <IconHistory size={12} />
                        </ThemeIcon>
                      }
                      title={entry.action}
                    >
                      <Text c="dimmed" size="sm">
                        {entry.details}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {new Date(entry.timestamp).toLocaleString()}
                        {entry.userName && ` • by ${entry.userName}`}
                      </Text>
                    </Timeline.Item>
                  ))
                ) : (
                  <Timeline.Item
                    bullet={<ThemeIcon size={20} variant="filled" color="blue"><IconHistory size={12} /></ThemeIcon>}
                    title="Created"
                  >
                    <Text c="dimmed" size="sm">
                      Request was created
                    </Text>
                    <Text size="xs" c="dimmed">
                      {new Date(selectedRequest.createdAt).toLocaleString()}
                    </Text>
                  </Timeline.Item>
                )}
              </Timeline>
            </ScrollArea>

            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={closeHistoryModal}>
                Close
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Container>
  );
}
