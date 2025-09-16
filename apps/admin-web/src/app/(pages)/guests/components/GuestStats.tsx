'use client';

import React from 'react';
import {
  SimpleGrid,
  Paper,
  Group,
  Text,
} from '@mantine/core';
import {
  IconUsers,
  IconBed,
  IconClock,
  IconCheck,
} from '@tabler/icons-react';

interface GuestStatsProps {
  totalGuests: number;
  currentGuests: number;
  arrivingGuests: number;
  departingGuests: number;
  searchValue?: string;
  filterStatus?: string | null;
}

export function GuestStats({ 
  totalGuests, 
  currentGuests, 
  arrivingGuests, 
  departingGuests,
  searchValue,
  filterStatus 
}: GuestStatsProps) {
  const getTitle = () => {
    if (searchValue?.trim()) return "Search Results";
    if (filterStatus && filterStatus !== 'all') return "Filtered Results";
    return "Total Guests";
  };

  const stats = [
    {
      title: getTitle(),
      value: totalGuests.toString(),
      icon: IconUsers,
      color: "blue",
    },
    {
      title: "Current Guests",
      value: currentGuests.toString(),
      icon: IconBed,
      color: "green",
    },
    {
      title: "Upcoming Arrivals",
      value: arrivingGuests.toString(),
      icon: IconClock,
      color: "orange",
    },
    {
      title: "Departures Today",
      value: departingGuests.toString(),
      icon: IconCheck,
      color: "red",
    },
  ];

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
      {stats.map((stat) => (
        <Paper key={stat.title} p="md" radius="md" withBorder>
          <Group justify="space-between">
            <div>
              <Text c="dimmed" size="sm" tt="uppercase" fw={700}>
                {stat.title}
              </Text>
              <Text fw={700} size="xl">
                {stat.value}
              </Text>
            </div>
            <stat.icon size={32} color={`var(--mantine-color-${stat.color}-6)`} />
          </Group>
        </Paper>
      ))}
    </SimpleGrid>
  );
}
