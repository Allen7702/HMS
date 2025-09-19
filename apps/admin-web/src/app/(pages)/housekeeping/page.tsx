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
  NumberInput,
  Textarea,
  Grid,
  RingProgress,
  Center,
  Tooltip,
  Progress,
  Avatar,
  Divider,
  Loader,
  Container,
  MultiSelect,
} from "@mantine/core";
// import { DatePickerInput } from '@mantine/dates';
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
  IconCalendar,
  IconUser,
  IconClipboardCheck,
  IconClipboardX,
  IconFilter,
  IconRefresh,
} from "@tabler/icons-react";
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { HousekeepingAPI, type Housekeeping } from 'api';

interface HousekeepingStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
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

export default function HousekeepingPage() {
  // State management
  const [housekeepingTasks, setHousekeepingTasks] = useState<Housekeeping[]>([]);
  const [stats, setStats] = useState<HousekeepingStats>({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  // Filters
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [roomFilter, setRoomFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<Date | null>(null);

  // Modal states
  const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] = useDisclosure(false);
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);
  const [viewModalOpened, { open: openViewModal, close: closeViewModal }] = useDisclosure(false);
  const [selectedTask, setSelectedTask] = useState<Housekeeping | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    roomId: '',
    status: 'Pending' as 'Pending' | 'In Progress' | 'Completed',
    assigneeId: '',
    scheduledDate: new Date(),
    notes: '',
  });

  // Active tab
  const [activeTab, setActiveTab] = useState<string>('all');

  // Load initial data
  useEffect(() => {
    loadHousekeepingData();
    loadSupportingData();
  }, []);

  // Load housekeeping tasks and stats
  const loadHousekeepingData = async () => {
    try {
      setLoading(true);
      const [tasksData, statsData] = await Promise.all([
        HousekeepingAPI.getHousekeepingTasks(),
        HousekeepingAPI.getHousekeepingStats(),
      ]);
      
      setHousekeepingTasks(tasksData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading housekeeping data:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load housekeeping data',
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
      ]);
      
      setUsers([
        { id: 1, firstName: 'John', lastName: 'Doe', email: 'john.doe@hotel.com' },
        { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@hotel.com' },
      ]);
    } catch (error) {
      console.error('Error loading supporting data:', error);
    }
  };

  // Filter tasks based on current filters
  const filteredTasks = useMemo(() => {
    return housekeepingTasks.filter((task) => {
      // Search filter
      if (searchValue) {
        const searchLower = searchValue.toLowerCase();
        const roomNumber = task.room?.number?.toLowerCase() || '';
        const assigneeName = task.assignee ? 
          `${task.assignee.firstName} ${task.assignee.lastName}`.toLowerCase() : '';
        const notes = task.notes?.toLowerCase() || '';
        
        if (!roomNumber.includes(searchLower) && 
            !assigneeName.includes(searchLower) && 
            !notes.includes(searchLower)) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'all' && task.status !== statusFilter) {
        return false;
      }

      // Assignee filter
      if (assigneeFilter !== 'all' && task.assigneeId?.toString() !== assigneeFilter) {
        return false;
      }

      // Room filter
      if (roomFilter !== 'all' && task.roomId?.toString() !== roomFilter) {
        return false;
      }

      // Date filter
      if (dateFilter && task.scheduledDate) {
        const taskDate = new Date(task.scheduledDate);
        const filterDate = new Date(dateFilter);
        if (taskDate.toDateString() !== filterDate.toDateString()) {
          return false;
        }
      }

      return true;
    });
  }, [housekeepingTasks, searchValue, statusFilter, assigneeFilter, roomFilter, dateFilter]);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'orange';
      case 'In Progress': return 'blue';
      case 'Completed': return 'green';
      default: return 'gray';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending': return <IconClock size={16} />;
      case 'In Progress': return <IconSparkles size={16} />;
      case 'Completed': return <IconCheck size={16} />;
      default: return <IconAlertCircle size={16} />;
    }
  };

  // Handle create task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await HousekeepingAPI.createHousekeepingTask({
        roomId: parseInt(formData.roomId),
        status: formData.status,
        assigneeId: formData.assigneeId ? parseInt(formData.assigneeId) : null,
        scheduledDate: formData.scheduledDate.toISOString(),
        completedAt: null,
        notes: formData.notes,
      });

      notifications.show({
        title: 'Success',
        message: 'Housekeeping task created successfully',
        color: 'green',
      });

      closeCreateModal();
      resetForm();
      loadHousekeepingData();
    } catch (error) {
      console.error('Error creating task:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to create housekeeping task',
        color: 'red',
      });
    }
  };

  // Handle update task
  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    try {
      await HousekeepingAPI.updateHousekeepingTask(selectedTask.id, {
        roomId: parseInt(formData.roomId),
        status: formData.status,
        assigneeId: formData.assigneeId ? parseInt(formData.assigneeId) : null,
        scheduledDate: formData.scheduledDate.toISOString(),
        notes: formData.notes,
      });

      notifications.show({
        title: 'Success',
        message: 'Housekeeping task updated successfully',
        color: 'green',
      });

      closeEditModal();
      resetForm();
      loadHousekeepingData();
    } catch (error) {
      console.error('Error updating task:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to update housekeeping task',
        color: 'red',
      });
    }
  };

  // Handle complete task
  const handleCompleteTask = async (taskId: number) => {
    try {
      await HousekeepingAPI.completeTask(taskId);
      notifications.show({
        title: 'Success',
        message: 'Task marked as completed',
        color: 'green',
      });
      loadHousekeepingData();
    } catch (error) {
      console.error('Error completing task:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to complete task',
        color: 'red',
      });
    }
  };

  // Handle delete task
  const handleDeleteTask = async (taskId: number) => {
    try {
      await HousekeepingAPI.deleteHousekeepingTask(taskId);
      notifications.show({
        title: 'Success',
        message: 'Housekeeping task deleted successfully',
        color: 'green',
      });
      loadHousekeepingData();
    } catch (error) {
      console.error('Error deleting task:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to delete housekeeping task',
        color: 'red',
      });
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      roomId: '',
      status: 'Pending' as 'Pending' | 'In Progress' | 'Completed',
      assigneeId: '',
      scheduledDate: new Date(),
      notes: '',
    });
    setSelectedTask(null);
  };

  // Open edit modal with task data
  const openEditWithTask = (task: Housekeeping) => {
    setSelectedTask(task);
    setFormData({
      roomId: task.roomId?.toString() || '',
      status: task.status,
      assigneeId: task.assigneeId?.toString() || '',
      scheduledDate: task.scheduledDate ? new Date(task.scheduledDate) : new Date(),
      notes: task.notes || '',
    });
    openEditModal();
  };

  // Open view modal with task data
  const openViewWithTask = (task: Housekeeping) => {
    setSelectedTask(task);
    openViewModal();
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
          <Title order={2}>Housekeeping Management</Title>
          <Group>
            <Button
              leftSection={<IconRefresh size={16} />}
              variant="light"
              onClick={loadHousekeepingData}
            >
              Refresh
            </Button>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={openCreateModal}
            >
              Add Task
            </Button>
          </Group>
        </Group>

        {/* Stats Cards */}
        <SimpleGrid cols={{ base: 2, sm: 3, lg: 5 }}>
          <Card padding="lg" radius="md" withBorder>
            <Group justify="space-between">
              <div>
                <Text c="dimmed" size="sm" fw={500}>
                  Total Tasks
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
                  Pending
                </Text>
                <Text fw={700} size="xl" c="orange">
                  {stats.pending}
                </Text>
              </div>
              <IconClock size={32} color="var(--mantine-color-orange-6)" />
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
              <IconSparkles size={32} color="var(--mantine-color-blue-6)" />
            </Group>
          </Card>

          <Card padding="lg" radius="md" withBorder>
            <Group justify="space-between">
              <div>
                <Text c="dimmed" size="sm" fw={500}>
                  Completed
                </Text>
                <Text fw={700} size="xl" c="green">
                  {stats.completed}
                </Text>
              </div>
              <IconCheck size={32} color="var(--mantine-color-green-6)" />
            </Group>
          </Card>

          <Card padding="lg" radius="md" withBorder>
            <Group justify="space-between">
              <div>
                <Text c="dimmed" size="sm" fw={500}>
                  Overdue
                </Text>
                <Text fw={700} size="xl" c="red">
                  {stats.overdue}
                </Text>
              </div>
              <IconAlertCircle size={32} color="var(--mantine-color-red-6)" />
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
                  placeholder="Search tasks..."
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
                    { value: 'Pending', label: 'Pending' },
                    { value: 'In Progress', label: 'In Progress' },
                    { value: 'Completed', label: 'Completed' },
                  ]}
                  value={statusFilter}
                  onChange={(value) => setStatusFilter(value || 'all')}
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
              <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
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
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <TextInput
                  placeholder="Filter by date (YYYY-MM-DD)"
                  type="date"
                  value={dateFilter ? dateFilter.toISOString().split('T')[0] : ''}
                  onChange={(e) => setDateFilter(e.target.value ? new Date(e.target.value) : null)}
                />
              </Grid.Col>
            </Grid>
          </Stack>
        </Card>

        {/* Tasks Table */}
        <Card padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Group justify="space-between">
              <Text fw={500} size="lg">Housekeeping Tasks</Text>
              <Text c="dimmed" size="sm">
                {filteredTasks.length} of {housekeepingTasks.length} tasks
              </Text>
            </Group>

            <Table.ScrollContainer minWidth={800}>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Room</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Assignee</Table.Th>
                    <Table.Th>Scheduled Date</Table.Th>
                    <Table.Th>Notes</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filteredTasks.map((task) => (
                    <Table.Tr key={task.id}>
                      <Table.Td>
                        <Group gap="xs">
                          <IconBed size={16} />
                          <div>
                            <Text size="sm" fw={500}>
                              Room {task.room?.number || 'N/A'}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {task.room?.type}
                            </Text>
                          </div>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          color={getStatusColor(task.status)}
                          variant="light"
                          leftSection={getStatusIcon(task.status)}
                        >
                          {task.status}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        {task.assignee ? (
                          <Group gap="xs">
                            <Avatar size="sm" radius="xl">
                              {(task.assignee.firstName?.[0] || '') + (task.assignee.lastName?.[0] || '')}
                            </Avatar>
                            <div>
                              <Text size="sm" fw={500}>
                                {task.assignee.firstName} {task.assignee.lastName}
                              </Text>
                              <Text size="xs" c="dimmed">
                                {task.assignee.email}
                              </Text>
                            </div>
                          </Group>
                        ) : (
                          <Text size="sm" c="dimmed">Unassigned</Text>
                        )}
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">
                          {task.scheduledDate ? 
                            new Date(task.scheduledDate).toLocaleDateString() : 
                            'Not scheduled'
                          }
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" lineClamp={2}>
                          {task.notes || 'No notes'}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <ActionIcon
                            variant="light"
                            color="blue"
                            size="sm"
                            onClick={() => openViewWithTask(task)}
                          >
                            <IconEye size={14} />
                          </ActionIcon>
                          
                          {task.status !== 'Completed' && (
                            <ActionIcon
                              variant="light"
                              color="green"
                              size="sm"
                              onClick={() => handleCompleteTask(task.id)}
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
                                onClick={() => openViewWithTask(task)}
                              >
                                View Details
                              </Menu.Item>
                              <Menu.Item
                                leftSection={<IconEdit size={16} />}
                                onClick={() => openEditWithTask(task)}
                              >
                                Edit Task
                              </Menu.Item>
                              {task.status !== 'Completed' && (
                                <Menu.Item
                                  leftSection={<IconCheck size={16} />}
                                  onClick={() => handleCompleteTask(task.id)}
                                >
                                  Mark Complete
                                </Menu.Item>
                              )}
                              <Menu.Divider />
                              <Menu.Item
                                color="red"
                                leftSection={<IconTrash size={16} />}
                                onClick={() => handleDeleteTask(task.id)}
                              >
                                Delete Task
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

            {filteredTasks.length === 0 && (
              <Center py="xl">
                <Stack align="center" gap="md">
                  <IconClipboardX size={48} color="var(--mantine-color-gray-4)" />
                  <Text c="dimmed">No housekeeping tasks found</Text>
                </Stack>
              </Center>
            )}
          </Stack>
        </Card>
      </Stack>

      {/* Create Task Modal */}
      <Modal
        opened={createModalOpened}
        onClose={closeCreateModal}
        title="Create Housekeeping Task"
        size="md"
      >
        <form onSubmit={handleCreateTask}>
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

            <Select
              label="Status"
              required
              data={[
                { value: 'Pending', label: 'Pending' },
                { value: 'In Progress', label: 'In Progress' },
                { value: 'Completed', label: 'Completed' },
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

            <TextInput
              label="Scheduled Date"
              type="date"
              required
              value={formData.scheduledDate.toISOString().split('T')[0]}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                scheduledDate: e.target.value ? new Date(e.target.value) : new Date() 
              }))}
            />

            <Textarea
              label="Notes"
              placeholder="Additional notes (optional)"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />

            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={closeCreateModal}>
                Cancel
              </Button>
              <Button type="submit">
                Create Task
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Edit Task Modal */}
      <Modal
        opened={editModalOpened}
        onClose={closeEditModal}
        title="Edit Housekeeping Task"
        size="md"
      >
        <form onSubmit={handleUpdateTask}>
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

            <Select
              label="Status"
              required
              data={[
                { value: 'Pending', label: 'Pending' },
                { value: 'In Progress', label: 'In Progress' },
                { value: 'Completed', label: 'Completed' },
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

            <TextInput
              label="Scheduled Date"
              type="date"
              required
              value={formData.scheduledDate.toISOString().split('T')[0]}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                scheduledDate: e.target.value ? new Date(e.target.value) : new Date() 
              }))}
            />

            <Textarea
              label="Notes"
              placeholder="Additional notes (optional)"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />

            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={closeEditModal}>
                Cancel
              </Button>
              <Button type="submit">
                Update Task
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* View Task Modal */}
      <Modal
        opened={viewModalOpened}
        onClose={closeViewModal}
        title="Task Details"
        size="md"
      >
        {selectedTask && (
          <Stack gap="md">
            <Group justify="space-between">
              <Text fw={500}>Task #{selectedTask.id}</Text>
              <Badge
                color={getStatusColor(selectedTask.status)}
                variant="light"
                leftSection={getStatusIcon(selectedTask.status)}
              >
                {selectedTask.status}
              </Badge>
            </Group>

            <Divider />

            <Grid>
              <Grid.Col span={6}>
                <Text size="sm" c="dimmed">Room</Text>
                <Text fw={500}>
                  Room {selectedTask.room?.number || 'N/A'} ({selectedTask.room?.type})
                </Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm" c="dimmed">Assignee</Text>
                <Text fw={500}>
                  {selectedTask.assignee ? 
                    `${selectedTask.assignee.firstName} ${selectedTask.assignee.lastName}` : 
                    'Unassigned'
                  }
                </Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm" c="dimmed">Scheduled Date</Text>
                <Text fw={500}>
                  {selectedTask.scheduledDate ? 
                    new Date(selectedTask.scheduledDate).toLocaleDateString() : 
                    'Not scheduled'
                  }
                </Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm" c="dimmed">Completed Date</Text>
                <Text fw={500}>
                  {selectedTask.completedAt ? 
                    new Date(selectedTask.completedAt).toLocaleDateString() : 
                    'Not completed'
                  }
                </Text>
              </Grid.Col>
            </Grid>

            {selectedTask.notes && (
              <>
                <Divider />
                <div>
                  <Text size="sm" c="dimmed" mb="xs">Notes</Text>
                  <Text>{selectedTask.notes}</Text>
                </div>
              </>
            )}

            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={closeViewModal}>
                Close
              </Button>
              {selectedTask.status !== 'Completed' && (
                <Button
                  onClick={() => {
                    closeViewModal();
                    openEditWithTask(selectedTask);
                  }}
                >
                  Edit Task
                </Button>
              )}
            </Group>
          </Stack>
        )}
      </Modal>
    </Container>
  );
}
