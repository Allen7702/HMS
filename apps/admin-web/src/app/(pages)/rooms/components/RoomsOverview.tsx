import React from 'react';
import {
  Card,
  SimpleGrid,
  Group,
  Text,
  RingProgress,
  Center,
  Stack,
  Alert,
} from "@mantine/core";
import {
  IconBed,
  IconUsers,
  IconTools,
  IconAlertCircle,
} from "@tabler/icons-react";
import { RoomStats } from '../hooks/useRooms';

interface RoomsOverviewProps {
  stats: RoomStats;
  loading: boolean;
}

export const RoomsOverview: React.FC<RoomsOverviewProps> = ({ stats, loading }) => {
  if (loading) {
    return (
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} withBorder padding="lg" radius="md">
            <Center h={100}>
              <Text c="dimmed">Loading...</Text>
            </Center>
          </Card>
        ))}
      </SimpleGrid>
    );
  }

  return (
    <Stack gap="md">
      {/* Occupancy Rate Alert */}
      {stats.occupancyRate > 90 && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="High Occupancy Alert"
          color="orange"
        >
          Hotel occupancy is at {stats.occupancyRate}%. Consider preparing for potential overflow.
        </Alert>
      )}

      {/* Maintenance Alert */}
      {stats.maintenanceRooms > 0 && (
        <Alert
          icon={<IconTools size={16} />}
          title="Maintenance Required"
          color="red"
        >
          {stats.maintenanceRooms} room{stats.maintenanceRooms > 1 ? 's' : ''} currently require maintenance attention.
        </Alert>
      )}

      {/* Stats Cards */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
        {/* Total Rooms */}
        <Card withBorder padding="lg" radius="md">
          <Group justify="space-between">
            <div>
              <Text c="dimmed" size="sm" fw={500}>
                Total Rooms
              </Text>
              <Text fw={700} size="xl">
                {stats.totalRooms}
              </Text>
            </div>
            <IconBed size={32} color="var(--mantine-color-blue-6)" />
          </Group>
        </Card>

        {/* Occupancy Rate */}
        <Card withBorder padding="lg" radius="md">
          <Group justify="space-between">
            <div>
              <Text c="dimmed" size="sm" fw={500}>
                Occupancy Rate
              </Text>
              <Text fw={700} size="xl">
                {stats.occupancyRate}%
              </Text>
            </div>
            <RingProgress
              size={60}
              thickness={6}
              sections={[
                { value: stats.occupancyRate, color: stats.occupancyRate > 80 ? 'red' : 'blue' }
              ]}
              label={
                <Center>
                  <IconUsers size={18} />
                </Center>
              }
            />
          </Group>
        </Card>

        {/* Available Rooms */}
        <Card withBorder padding="lg" radius="md">
          <Group justify="space-between">
            <div>
              <Text c="dimmed" size="sm" fw={500}>
                Available
              </Text>
              <Text fw={700} size="xl" c="green">
                {stats.availableRooms}
              </Text>
            </div>
            <div>
              <Text size="xs" c="dimmed">
                {Math.round((stats.availableRooms / stats.totalRooms) * 100)}%
              </Text>
            </div>
          </Group>
        </Card>

        {/* Occupied Rooms */}
        <Card withBorder padding="lg" radius="md">
          <Group justify="space-between">
            <div>
              <Text c="dimmed" size="sm" fw={500}>
                Occupied
              </Text>
              <Text fw={700} size="xl" c="blue">
                {stats.occupiedRooms}
              </Text>
            </div>
            <div>
              <Text size="xs" c="dimmed">
                {Math.round((stats.occupiedRooms / stats.totalRooms) * 100)}%
              </Text>
            </div>
          </Group>
        </Card>

        {/* Maintenance Rooms */}
        {stats.maintenanceRooms > 0 && (
          <Card withBorder padding="lg" radius="md">
            <Group justify="space-between">
              <div>
                <Text c="dimmed" size="sm" fw={500}>
                  Maintenance
                </Text>
                <Text fw={700} size="xl" c="red">
                  {stats.maintenanceRooms}
                </Text>
              </div>
              <IconTools size={32} color="var(--mantine-color-red-6)" />
            </Group>
          </Card>
        )}

        {/* Dirty Rooms */}
        {stats.dirtyRooms > 0 && (
          <Card withBorder padding="lg" radius="md">
            <Group justify="space-between">
              <div>
                <Text c="dimmed" size="sm" fw={500}>
                  Needs Cleaning
                </Text>
                <Text fw={700} size="xl" c="yellow">
                  {stats.dirtyRooms}
                </Text>
              </div>
              <div>
                <Text size="xs" c="dimmed">
                  {Math.round((stats.dirtyRooms / stats.totalRooms) * 100)}%
                </Text>
              </div>
            </Group>
          </Card>
        )}
      </SimpleGrid>
    </Stack>
  );
};
