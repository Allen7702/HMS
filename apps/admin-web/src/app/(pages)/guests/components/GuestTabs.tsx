'use client';

import React from 'react';
import {
  Tabs,
  Card,
  Alert,
  Avatar,
  Group,
  Text,
  Badge,
  ActionIcon,
} from '@mantine/core';
import {
  IconUsers,
  IconBed,
  IconClock,
  IconCheck,
  IconMail,
  IconPhone,
  IconLocation,
  IconEye,
  IconEdit,
  IconLogout,
  IconLogin,
} from '@tabler/icons-react';
import { PaginatedTable } from 'ui';
import type { Guest } from 'db';
import { createGuestTableRow } from './GuestTableRow';
import { getRoomInfo, getTotalStayDuration } from '../utils/guestUtils';
import { TABLE_COLUMNS, GUEST_STATUSES } from '../constants';

interface GuestTabsProps {
  allGuests: any[];
  currentGuests: any[];
  arrivingGuests: any[];
  departingGuests: any[];
  bookings: any[];
  isLoading: boolean;
  searchValue: string;
  filterStatus: string | null;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  onViewProfile: (guest: Guest) => void;
  onEdit: (guest: Guest) => void;
  onDelete: (guestId: number) => void;
  onViewBookingHistory?: (guest: Guest) => void;
}

//TODO: support for booking actions (check-in/check-out) directly from the tabs

function createTabTableRow(guest: any, status: string, bookings: any[], onViewProfile: any, onEdit: any) {
  const roomInfo = getRoomInfo(guest, status, bookings);
  const stayInfo = getTotalStayDuration(guest, status, bookings);

  return {
    id: guest.id.toString(),
    avatar: (
      <Avatar size="sm" radius="xl">
        {guest.fullName?.charAt(0)?.toUpperCase()}
      </Avatar>
    ),
    name: (
      <div>
        <Text size="sm" fw={500}>
          {guest.fullName}
        </Text>
        <Text size="xs" c="dimmed">
          {(guest.preferences as any)?.nationality || "N/A"}
        </Text>
      </div>
    ),
    contact: (
      <div>
        <Group gap={4}>
          <IconMail size={12} />
          <Text size="xs">{guest.email}</Text>
        </Group>
        <Group gap={4}>
          <IconPhone size={12} />
          <Text size="xs">{guest.phone || "N/A"}</Text>
        </Group>
        <Group gap={4}>
          <IconLocation size={12} />
          <Text size="xs">{guest.address || "N/A"}</Text>
        </Group>
      </div>
    ),
    status: (
      <Badge 
        color={
          status === 'checked-in' ? 'green' : 
          status === 'upcoming' ? 'orange' : 
          guest.booking?.status === 'CheckedOut' ? 'gray' : 'red'
        } 
        variant="light" 
        size="sm"
      >
        {status === 'checked-in' ? 'Checked In' : 
         status === 'upcoming' ? 'Upcoming Arrival' :
         guest.booking?.status === 'CheckedOut' ? 'Departed Today' : 'Departing Today'}
      </Badge>
    ),
    room: (
      <div>
        <Text size="sm" fw={500}>
          {roomInfo.room}
        </Text>
        <Text size="xs" c="dimmed">
          {status === 'departing' && guest.booking?.status === 'CheckedOut' ? 'Departed today' : 
           status === 'departing' ? 'Check-out today' : roomInfo.dates}
        </Text>
      </div>
    ),
    stayDuration: (
      <div>
        <Text size="sm" fw={500}>
          {stayInfo.total > 0 ? `${stayInfo.total} days total` : stayInfo.description}
        </Text>
        <Text size="xs" c="dimmed">
          {status === 'checked-in' && stayInfo.current > 0 
            ? `Current stay: ${stayInfo.current} days`
            : status === 'upcoming' 
              ? 'Upcoming arrival'
              : status === 'departing' && guest.booking?.status === 'CheckedOut'
                ? 'Departed today'
                : status === 'departing'
                  ? 'Departing today'
                  : 'Currently staying'
          }
        </Text>
      </div>
    ),
    actions: (
      <Group gap="xs">
        <ActionIcon 
          variant="light" 
          color="green" 
          size="sm"
          onClick={() => onViewProfile(guest)}
          title="View Profile"
        >
          <IconEye size={14} />
        </ActionIcon>
        <ActionIcon 
          variant="light" 
          color="blue" 
          size="sm"
          onClick={() => onEdit(guest)}
          title="Edit Guest"
        >
          <IconEdit size={14} />
        </ActionIcon>
        {status === 'upcoming' && (
          <ActionIcon 
            variant="light" 
            color="green" 
            size="sm"
            onClick={() => {/* Check in guest */}}
            title="Check In"
          >
            <IconLogin size={14} />
          </ActionIcon>
        )}
        {(status === 'checked-in' || status === 'departing') && (
          <ActionIcon 
            variant="light" 
            color="orange" 
            size="sm"
            onClick={() => {/* Check out guest */}}
            title="Check Out"
          >
            <IconLogout size={14} />
          </ActionIcon>
        )}
      </Group>
    ),
  };
}

export function GuestTabs({
  allGuests,
  currentGuests,
  arrivingGuests,
  departingGuests,
  bookings,
  isLoading,
  searchValue,
  filterStatus,
  currentPage,
  setCurrentPage,
  pageSize,
  onViewProfile,
  onEdit,
  onDelete,
  onViewBookingHistory,
}: GuestTabsProps) {
  const allGuestRows = allGuests.map((guest) => 
    createGuestTableRow({ guest, bookings, onViewProfile, onEdit, onDelete, onViewBookingHistory })
  );

  const currentGuestRows = currentGuests.map((guest) => 
    createTabTableRow(guest, 'checked-in', bookings, onViewProfile, onEdit)
  );

  const arrivingGuestRows = arrivingGuests.map((guest) => 
    createTabTableRow(guest, 'upcoming', bookings, onViewProfile, onEdit)
  );

  const departingGuestRows = departingGuests.map((guest) => 
    createTabTableRow(guest, 'departing', bookings, onViewProfile, onEdit)
  );

  return (
    <Tabs defaultValue="all" keepMounted={false}>
      <Tabs.List>
        <Tabs.Tab value="all" leftSection={<IconUsers size={16} />}>
          All Guests ({allGuests.length})
        </Tabs.Tab>
        <Tabs.Tab value="current" leftSection={<IconBed size={16} />}>
          Current Guests ({currentGuests.length})
        </Tabs.Tab>
        <Tabs.Tab value="arriving" leftSection={<IconClock size={16} />}>
          Upcoming Arrivals ({arrivingGuests.length})
        </Tabs.Tab>
        <Tabs.Tab value="departing" leftSection={<IconCheck size={16} />}>
          Departures Today ({departingGuests.length})
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="all">
        <Card>
          <PaginatedTable
            columns={TABLE_COLUMNS}
            rows={allGuestRows}
            isLoading={isLoading}
            page={searchValue.trim() || (filterStatus && filterStatus !== 'all') ? 1 : currentPage}
            setPage={searchValue.trim() || (filterStatus && filterStatus !== 'all') ? () => {} : setCurrentPage}
            total={allGuests.length}
            pageSize={searchValue.trim() || (filterStatus && filterStatus !== 'all') ? allGuests.length : pageSize}
            minWidth={800}
          />
        </Card>
      </Tabs.Panel>

      <Tabs.Panel value="current">
        <Card>
          {currentGuests.length > 0 ? (
            <PaginatedTable
              columns={TABLE_COLUMNS}
              rows={currentGuestRows}
              isLoading={isLoading}
              page={1}
              setPage={() => {}}
              total={currentGuests.length}
              pageSize={currentGuests.length}
              minWidth={800}
            />
          ) : (
            <Alert icon={<IconBed size={16} />} title="No Current Guests" color="blue">
              No guests are currently checked in to the hotel
            </Alert>
          )}
        </Card>
      </Tabs.Panel>

      <Tabs.Panel value="arriving">
        <Card>
          {arrivingGuests.length > 0 ? (
            <PaginatedTable
              columns={TABLE_COLUMNS}
              rows={arrivingGuestRows}
              isLoading={isLoading}
              page={1}
              setPage={() => {}}
              total={arrivingGuests.length}
              pageSize={arrivingGuests.length}
              minWidth={800}
            />
          ) : (
            <Alert icon={<IconClock size={16} />} title="No Upcoming Arrivals" color="orange">
              No guests have confirmed upcoming reservations
            </Alert>
          )}
        </Card>
      </Tabs.Panel>

      <Tabs.Panel value="departing">
        <Card>
          {departingGuests.length > 0 ? (
            <PaginatedTable
              columns={TABLE_COLUMNS}
              rows={departingGuestRows}
              isLoading={isLoading}
              page={1}
              setPage={() => {}}
              total={departingGuests.length}
              pageSize={departingGuests.length}
              minWidth={800}
            />
          ) : (
            <Alert icon={<IconCheck size={16} />} title="No Departures Today" color="red">
              No guests are scheduled to check out or have departed today
            </Alert>
          )}
        </Card>
      </Tabs.Panel>
    </Tabs>
  );
}
