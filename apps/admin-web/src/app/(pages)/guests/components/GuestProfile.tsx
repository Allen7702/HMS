'use client';

import React from 'react';
import {
    Stack,
    Group,
    Text,
    Badge,
    Card,
    Avatar,
    SimpleGrid,
    Button,
    ActionIcon,
    Tabs,
    Paper,
    Progress,
    ThemeIcon,
} from '@mantine/core';
import {
    IconUser,
    IconMail,
    IconPhone,
    IconCalendar,
    IconBed,
    IconStar,
    IconEdit,
    IconMapPin,
    IconIdBadge2,
    IconWorld,
    IconClock,
    IconCheck,
    IconX,
    IconCurrency,
    IconTrendingUp,
    IconBookmark,
} from '@tabler/icons-react';
import type { Guest } from 'db';
import { BookingHistory } from './BookingHistory';
import { formatCurrency, formatDate, calculateGuestStats, getLoyaltyLevel } from '../utils/guestUtils';

interface GuestProfileProps {
    guest: Guest;
    bookings?: any[];
    onEdit?: () => void;
    onClose?: () => void;
}

//TODO: Intensive support for loyalty tiers and points system
//TODO: Avg Stay ???
export function GuestProfile({ guest, bookings = [], onEdit, onClose }: GuestProfileProps) {
    const preferences = guest.preferences as any || {};

    // Calculate guest statistics
    const guestStats = React.useMemo(() => calculateGuestStats(bookings), [bookings]);

    // Get guest status based on current booking state
    const getGuestStatus = () => {
        if (guestStats.currentBooking) return { status: 'Checked In', color: 'green' };
        if (guestStats.upcomingBookings.length > 0) return { status: 'Upcoming Stay', color: 'orange' };
        if (guestStats.completedStays > 0) return { status: 'Past Guest', color: 'gray' };
        return { status: 'New Guest', color: 'blue' };
    };

    const guestStatus = getGuestStatus();

     const loyaltyInfo = getLoyaltyLevel(guestStats.totalSpent);
 
    return (
        <Stack gap="lg">
             <Card p="lg" radius="md" withBorder>
                <Group justify="space-between" mb="md">
                    <Group>
                        <Avatar size="xl" radius="md">
                            {guest.fullName?.charAt(0)?.toUpperCase()}
                        </Avatar>
                        <div>
                            <Group gap="xs" align="center">
                                <Text size="xl" fw={600}>{guest.fullName}</Text>
                                <Badge color={guestStatus.color} variant="light" size="sm">
                                    {guestStatus.status}
                                </Badge>
                            </Group>
                            <Group gap="xs" mt={4}>
                                <IconMail size={14} />
                                <Text size="sm" c="dimmed">{guest.email}</Text>
                            </Group>
                            <Group gap="xs">
                                <IconPhone size={14} />
                                <Text size="sm" c="dimmed">{guest.phone || 'N/A'}</Text>
                            </Group>
                        </div>
                    </Group>
                    <Group>
                        {onEdit && (
                            <Button leftSection={<IconEdit size={16} />} variant="light" onClick={onEdit}>
                                Edit Profile
                            </Button>
                        )}
                        <ActionIcon variant="light" onClick={onClose}>
                            <IconX size={16} />
                        </ActionIcon>
                    </Group>
                </Group>

                {/* Guest Stats Cards */}
                <SimpleGrid cols={{ base: 2, sm: 4 }} mt="md">
                    <Paper p="sm" radius="md" bg="blue.0" c="blue.9">
                        <Group gap="xs">
                            <ThemeIcon color="blue" variant="light" size="sm">
                                <IconBookmark size={16} />
                            </ThemeIcon>
                            <div>
                                <Text size="xs" c="dimmed">Total Bookings</Text>
                                <Text fw={600}>{guestStats.totalBookings}</Text>
                            </div>
                        </Group>
                    </Paper>
                    <Paper p="sm" radius="md" bg="green.0" c="green.9">
                        <Group gap="xs">
                            <ThemeIcon color="green" variant="light" size="sm">
                                <IconBed size={16} />
                            </ThemeIcon>
                            <div>
                                <Text size="xs" c="dimmed">Nights Stayed</Text>
                                <Text fw={600}>{guestStats.totalNights}</Text>
                            </div>
                        </Group>
                    </Paper>
                    <Paper p="sm" radius="md" bg="yellow.0" c="yellow.9">
                        <Group gap="xs">
                            <ThemeIcon color="yellow" variant="light" size="sm">
                                <IconCurrency size={16} />
                            </ThemeIcon>
                            <div>
                                <Text size="xs" c="dimmed">Total Spent</Text>
                                <Text fw={600}>{formatCurrency(guestStats.totalSpent)}</Text>
                            </div>
                        </Group>
                    </Paper>
                    <Paper p="sm" radius="md" bg="purple.0" c="purple.9">
                        <Group gap="xs">
                            <ThemeIcon color="purple" variant="light" size="sm">
                                <IconTrendingUp size={16} />
                            </ThemeIcon>
                            <div>
                                <Text size="xs" c="dimmed">Avg Stay</Text>
                                <Text fw={600}>{guestStats.avgStayDuration.toFixed(1)} nights</Text>
                            </div>
                        </Group>
                    </Paper>
                </SimpleGrid>
            </Card>

            {/* Tabs for different sections */}
            <Tabs defaultValue="details" keepMounted={false}>
                <Tabs.List>
                    <Tabs.Tab value="details" leftSection={<IconUser size={16} />}>
                        Details
                    </Tabs.Tab>
                    <Tabs.Tab value="bookings" leftSection={<IconCalendar size={16} />}>
                        Booking History ({bookings.length})
                    </Tabs.Tab>
                    <Tabs.Tab value="loyalty" leftSection={<IconStar size={16} />}>
                        Loyalty & Rewards
                    </Tabs.Tab>
                </Tabs.List>

                {/* Details Tab */}
                <Tabs.Panel value="details">
                    <Stack gap="md">
                        <Card p="md" radius="md" withBorder>
                            <Text fw={500} mb="sm">Personal Information</Text>
                            <SimpleGrid cols={2}>
                                <Group gap="xs">
                                    <IconIdBadge2 size={16} color="gray" />
                                    <div>
                                        <Text size="xs" c="dimmed">ID/Passport</Text>
                                        <Text size="sm">{preferences.idNumber || 'N/A'}</Text>
                                    </div>
                                </Group>
                                <Group gap="xs">
                                    <IconWorld size={16} color="gray" />
                                    <div>
                                        <Text size="xs" c="dimmed">Nationality</Text>
                                        <Text size="sm">{preferences.nationality || 'N/A'}</Text>
                                    </div>
                                </Group>
                                <Group gap="xs">
                                    <IconMapPin size={16} color="gray" />
                                    <div>
                                        <Text size="xs" c="dimmed">Address</Text>
                                        <Text size="sm">{guest.address || 'N/A'}</Text>
                                    </div>
                                </Group>
                                <Group gap="xs">
                                    <IconCalendar size={16} color="gray" />
                                    <div>
                                        <Text size="xs" c="dimmed">Member Since</Text>
                                        <Text size="sm">{formatDate(guest.createdAt?.toString() || new Date().toISOString())}</Text>
                                    </div>
                                </Group>
                            </SimpleGrid>
                        </Card>

                        {preferences.specialRequests && (
                            <Card p="md" radius="md" withBorder>
                                <Text fw={500} mb="sm">Special Requests & Preferences</Text>
                                <Text size="sm">{preferences.specialRequests}</Text>
                            </Card>
                        )}

                        {guestStats.currentBooking && (
                            <Card p="md" radius="md" withBorder>
                                <Text fw={500} mb="sm">Current Stay</Text>
                                <Group justify="space-between">
                                    <div>
                                        <Text size="sm">Room {guestStats.currentBooking.roomId || guestStats.currentBooking.room_id}</Text>
                                        <Text size="xs" c="dimmed">
                                            {formatDate(guestStats.currentBooking.checkIn || guestStats.currentBooking.check_in)} - {formatDate(guestStats.currentBooking.checkOut || guestStats.currentBooking.check_out)}
                                        </Text>
                                    </div>
                                    <Badge color="green" variant="light">
                                        Currently Staying
                                    </Badge>
                                </Group>
                            </Card>
                        )}
                    </Stack>
                </Tabs.Panel>

                {/* Bookings Tab */}
                <Tabs.Panel value="bookings">
                    <BookingHistory
                        bookings={bookings}
                        guestId={guest.id}
                        title={`Booking History for ${guest.fullName}`}
                        showGuestColumn={false}
                    />
                </Tabs.Panel>
                    
                {/* Loyalty Tab */}
                <Tabs.Panel value="loyalty">
                    <Stack gap="md">
                        <Card p="md" radius="md" withBorder>
                            <Group justify="space-between" mb="sm">
                                <Text fw={500}>Loyalty Status</Text>
                                <Badge color={loyaltyInfo.color} variant="filled">
                                    {loyaltyInfo.level}
                                </Badge>
                            </Group>
                            <Progress value={loyaltyInfo.progress} color={loyaltyInfo.color} mb="xs" />
                            <Text size="xs" c="dimmed">
                                {loyaltyInfo.progress < 100
                                    ? `${Math.round(loyaltyInfo.progress)}% to next level`
                                    : 'Highest tier achieved!'
                                }
                            </Text>
                        </Card>

                        <SimpleGrid cols={2}>
                            <Card p="md" radius="md" withBorder>
                                <Text fw={500} mb="xs">Loyalty Points</Text>
                                <Text size="xl" fw={700} c="blue">
                                    {guest.loyaltyPoints || 0}
                                </Text>
                                <Text size="xs" c="dimmed">Available points</Text>
                            </Card>
                            <Card p="md" radius="md" withBorder>
                                <Text fw={500} mb="xs">Member Tier</Text>
                                <Text size="xl" fw={700} c={loyaltyInfo.color}>
                                    {guest.loyaltyTier || loyaltyInfo.level}
                                </Text>
                                <Text size="xs" c="dimmed">Current status</Text>
                            </Card>
                        </SimpleGrid>

                        {guestStats.completedStays > 0 && (
                            <Card p="md" radius="md" withBorder>
                                <Text fw={500} mb="sm">Achievements</Text>
                                <Stack gap="xs">
                                    {guestStats.completedStays >= 1 && (
                                        <Group gap="xs">
                                            <ThemeIcon color="green" size="sm" variant="light">
                                                <IconCheck size={16} />
                                            </ThemeIcon>
                                            <Text size="sm">First Stay Completed</Text>
                                        </Group>
                                    )}
                                    {guestStats.completedStays >= 5 && (
                                        <Group gap="xs">
                                            <ThemeIcon color="blue" size="sm" variant="light">
                                                <IconStar size={16} />
                                            </ThemeIcon>
                                            <Text size="sm">Frequent Guest (5+ stays)</Text>
                                        </Group>
                                    )}
                                    {guestStats.totalSpent >= 1000 && (
                                        <Group gap="xs">
                                            <ThemeIcon color="yellow" size="sm" variant="light">
                                                <IconCurrency size={16} />
                                            </ThemeIcon>
                                            <Text size="sm">High Value Guest ($1000+)</Text>
                                        </Group>
                                    )}
                                </Stack>
                            </Card>
                        )}
                    </Stack>
                </Tabs.Panel>
            </Tabs>
        </Stack>
    );
}
