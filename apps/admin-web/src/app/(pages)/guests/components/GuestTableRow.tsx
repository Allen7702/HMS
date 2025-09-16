'use client';

import React from 'react';
import {
  Group,
  Text,
  Badge,
  Avatar,
  ActionIcon,
  Menu,
} from '@mantine/core';
import {
  IconMail,
  IconPhone,
  IconLocation,
  IconEye,
  IconEdit,
  IconTrash,
  IconLogin,
  IconLogout,
  IconDots,
  IconHistory,
  IconBookmark,
  IconBed,
  IconCalendar,
} from '@tabler/icons-react';
import type { Guest } from 'db';
import { getGuestStatus, getRoomInfo, getTotalStayDuration } from '../utils/guestUtils';
import { GUEST_STATUSES } from '../constants';

interface GuestTableRowProps {
  guest: Guest;
  bookings: any[];
  onViewProfile: (guest: Guest) => void;
  onEdit: (guest: Guest) => void;
  onDelete: (guestId: number) => void;
  onViewBookingHistory?: (guest: Guest) => void;
}
//TODO: Extend booking support after booking is implemented
export function createGuestTableRow({
  guest,
  bookings,
  onViewProfile,
  onEdit,
  onDelete,
  onViewBookingHistory,
}: GuestTableRowProps) {
  const status = getGuestStatus(guest, bookings);
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
          status === GUEST_STATUSES.CHECKED_IN ? 'green' : 
          status === GUEST_STATUSES.UPCOMING ? 'orange' : 
          'gray'
        }
        variant="light"
        size="sm"
      >
        {status === GUEST_STATUSES.CHECKED_IN ? 'Checked In' : 
         status === GUEST_STATUSES.UPCOMING ? 'Upcoming' : 
         'Past Guest'}
      </Badge>
    ),
    room: (
      <div>
        <Text size="sm" fw={500}>
          {roomInfo.room}
        </Text>
        <Text size="xs" c="dimmed">
          {roomInfo.dates}
        </Text>
      </div>
    ),
    stayDuration: (
      <div>
        <Text size="sm" fw={500}>
          {stayInfo.total > 0 ? `${stayInfo.total} days total` : stayInfo.description}
        </Text>
        <Text size="xs" c="dimmed">
          {status === GUEST_STATUSES.CHECKED_IN && stayInfo.current > 0
            ? `Current stay: ${stayInfo.current} days`
            : status === GUEST_STATUSES.PAST_GUEST
              ? `Across all visits`
              : 'No stays completed'
          }
        </Text>
      </div>
    ),
    actions: (
      <Group gap="xs">
        {/* Quick action buttons */}
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

        {status === GUEST_STATUSES.UPCOMING && (
          <ActionIcon
            variant="light"
            color="green"
            size="sm"
            onClick={() => {/* Check in guest */ }}
            title="Check In"
          >
            <IconLogin size={14} />
          </ActionIcon>
        )}

        {status === GUEST_STATUSES.CHECKED_IN && (
          <ActionIcon
            variant="light"
            color="orange"
            size="sm"
            onClick={() => {/* Check out guest */ }}
            title="Check Out"
          >
            <IconLogout size={14} />
          </ActionIcon>
        )}

        {/* More actions dropdown */}
        <Menu shadow="md" width={240} position="bottom-end">
          <Menu.Target>
            <ActionIcon variant="light" color="gray" size="sm">
              <IconDots size={14} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>Guest Information</Menu.Label>
            <Menu.Item
              leftSection={<IconEye size={16} />}
              onClick={() => onViewProfile(guest)}
            >
              View Full Profile
            </Menu.Item>
            <Menu.Item
              leftSection={<IconEdit size={16} />}
              onClick={() => onEdit(guest)}
            >
              Edit Guest Details
            </Menu.Item>
              <Menu.Item
                leftSection={<IconHistory size={16} />}
                onClick={() => onViewBookingHistory?.(guest)}
              >
                Booking History
              </Menu.Item>            <Menu.Divider />
            <Menu.Label>Booking Actions</Menu.Label>

            {status === GUEST_STATUSES.PAST_GUEST && (
              <Menu.Item
                leftSection={<IconBookmark size={16} />}
                onClick={() => {/* Create new booking */ }}
                color="blue"
              >
                Create New Booking
              </Menu.Item>
            )}

            {status === GUEST_STATUSES.UPCOMING && (
              <>
                <Menu.Item
                  leftSection={<IconLogin size={16} />}
                  onClick={() => {/* Check in early */ }}
                  color="green"
                >
                  Check In Now
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconEdit size={16} />}
                  onClick={() => {/* Modify booking */ }}
                >
                  Modify Booking
                </Menu.Item>
              </>
            )}

            {status === GUEST_STATUSES.CHECKED_IN && (
              <>
                <Menu.Item
                  leftSection={<IconLogout size={16} />}
                  onClick={() => {/* Check out */ }}
                  color="orange"
                >
                  Check Out
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconBed size={16} />}
                  onClick={() => {/* Change room */ }}
                >
                  Change Room
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconCalendar size={16} />}
                  onClick={() => {/* Extend stay */ }}
                >
                  Extend Stay
                </Menu.Item>
              </>
            )}

            <Menu.Divider />
            <Menu.Item
              color="red"
              leftSection={<IconTrash size={16} />}
              onClick={() => onDelete(guest.id)}
            >
              Delete Guest
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    ),
  };
}
