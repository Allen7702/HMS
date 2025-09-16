'use client';

import React, { useState, useMemo } from 'react';
import {
    Stack,
    Group,
    Text,
    Badge,
    Card,
    Button,
    ActionIcon,
    Menu,
    Paper,
    Select,
    TextInput,
    Modal,
    SimpleGrid,
    ThemeIcon,
    Anchor,
} from '@mantine/core';
import { PaginatedTable } from 'ui';
import {
    IconCalendar,
    IconBed,
    IconHistory,
    IconSearch,
    IconFilter,
    IconEye,
    IconEdit,
    IconTrash,
    IconDownload,
    IconPrinter,
    IconMail,
    IconDots,
    IconRefresh,
} from '@tabler/icons-react';
import { formatCurrency, formatDate } from '../utils/guestUtils';
import { BOOKING_STATUSES } from '../constants';

interface BookingHistoryProps {
    bookings: any[];
    guestId?: number;
    onViewBooking?: (booking: any) => void;
    onEditBooking?: (booking: any) => void;
    onDeleteBooking?: (bookingId: number) => void;
    onCreateBooking?: () => void;
    showGuestColumn?: boolean;
    title?: string;
}

interface BookingDetailsModalProps {
    booking: any;
    opened: boolean;
    onClose: () => void;
}

function BookingDetailsModal({ booking, opened, onClose }: BookingDetailsModalProps) {
    if (!booking) return null;

    const checkIn = new Date(booking.checkIn || booking.check_in);
    const checkOut = new Date(booking.checkOut || booking.check_out);
    const duration = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    const getStatusColor = (status: string) => {
        switch (status) {
            case BOOKING_STATUSES.CONFIRMED: return 'orange';
            case BOOKING_STATUSES.CHECKED_IN: return 'green';
            case BOOKING_STATUSES.CHECKED_OUT: return 'blue';
            case BOOKING_STATUSES.CANCELLED: return 'red';
            default: return 'gray';
        }
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={
                <Group>
                    <Text fw={600}>Booking Details</Text>
                    <Badge color={getStatusColor(booking.status)} variant="light">
                        {booking.status}
                    </Badge>
                </Group>
            }
            size="lg"
        >
            <Stack gap="md">
                <Card p="md" radius="md" withBorder>
                    <Text fw={500} mb="sm">Booking Information</Text>
                    <SimpleGrid cols={2}>
                        <div>
                            <Text size="xs" c="dimmed">Booking Number</Text>
                            <Text fw={500}>{booking.id || 'N/A'}</Text>
                        </div>
                        <div>
                            <Text size="xs" c="dimmed">Room Number</Text>
                            <Text fw={500}>Room {booking.roomId || booking.room_id || 'N/A'}</Text>
                        </div>
                        <div>
                            <Text size="xs" c="dimmed">Check-in Date</Text>
                            <Text fw={500}>{formatDate(checkIn)}</Text>
                        </div>
                        <div>
                            <Text size="xs" c="dimmed">Check-out Date</Text>
                            <Text fw={500}>{formatDate(checkOut)}</Text>
                        </div>
                        <div>
                            <Text size="xs" c="dimmed">Duration</Text>
                            <Text fw={500}>{duration} {duration === 1 ? 'night' : 'nights'}</Text>
                        </div>
                        <div>
                            <Text size="xs" c="dimmed">Guests</Text>
                            <Text fw={500}>{booking.guestCount || booking.guest_count || 1} guest(s)</Text>
                        </div>
                    </SimpleGrid>
                </Card>

                {booking.totalAmount && (
                    <Card p="md" radius="md" withBorder>
                        <Text fw={500} mb="sm">Financial Details</Text>
                        <SimpleGrid cols={2}>
                            <div>
                                <Text size="xs" c="dimmed">Room Rate</Text>
                                <Text fw={500}>{formatCurrency(booking.roomRate || 0)}</Text>
                            </div>
                            <div>
                                <Text size="xs" c="dimmed">Total Amount</Text>
                                <Text fw={500} size="lg" c="green">
                                    {formatCurrency(booking.totalAmount)}
                                </Text>
                            </div>
                            <div>
                                <Text size="xs" c="dimmed">Payment Status</Text>
                                <Badge
                                    color={booking.paymentStatus === 'Paid' ? 'green' : 'orange'}
                                    variant="light"
                                >
                                    {booking.paymentStatus || 'Pending'}
                                </Badge>
                            </div>
                            <div>
                                <Text size="xs" c="dimmed">Booking Date</Text>
                                <Text fw={500}>
                                    {booking.createdAt ? formatDate(booking.createdAt) : 'N/A'}
                                </Text>
                            </div>
                        </SimpleGrid>
                    </Card>
                )}

                {booking.specialRequests && (
                    <Card p="md" radius="md" withBorder>
                        <Text fw={500} mb="sm">Special Requests</Text>
                        <Text size="sm">{booking.specialRequests}</Text>
                    </Card>
                )}

                <Group justify="flex-end">
                    <Button leftSection={<IconDownload size={16} />} variant="light">
                        Download Invoice
                    </Button>
                    <Button leftSection={<IconPrinter size={16} />} variant="light">
                        Print Details
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}

export function BookingHistory({
    bookings = [],
    guestId,
    onViewBooking,
    onEditBooking,
    onDeleteBooking,
    onCreateBooking,
    showGuestColumn = false,
    title = ""
}: BookingHistoryProps) {
    const [statusFilter, setStatusFilter] = useState<string | null>('all');
    const [searchValue, setSearchValue] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [viewingBooking, setViewingBooking] = useState<any>(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const itemsPerPage = 10;

    const filteredBookings = useMemo(() => {
        let filtered = bookings;

        if (statusFilter && statusFilter !== 'all') {
            filtered = filtered.filter(booking => booking.status === statusFilter);
        }

        if (searchValue.trim()) {
            filtered = filtered.filter(booking =>
                booking.id?.toString().includes(searchValue) ||
                (booking.roomId || booking.room_id)?.toString().includes(searchValue) ||
                booking.status?.toLowerCase().includes(searchValue.toLowerCase())
            );
        }

        return filtered.sort((a, b) => {
            const aDate = new Date(a.checkIn || a.check_in);
            const bDate = new Date(b.checkIn || b.check_in);
            return bDate.getTime() - aDate.getTime()
        });
    }, [bookings, statusFilter, searchValue]);



    const getStatusColor = (status: string) => {
        switch (status) {
            case BOOKING_STATUSES.CONFIRMED: return 'orange';
            case BOOKING_STATUSES.CHECKED_IN: return 'green';
            case BOOKING_STATUSES.CHECKED_OUT: return 'blue';
            case BOOKING_STATUSES.CANCELLED: return 'red';
            default: return 'gray';
        }
    };

    const handleViewDetails = (booking: any) => {
        setViewingBooking(booking);
        setDetailsModalOpen(true);
        onViewBooking?.(booking);
    };

    const statusFilterOptions = [
        { value: 'all', label: 'All Statuses' },
        { value: BOOKING_STATUSES.CONFIRMED, label: 'Confirmed' },
        { value: BOOKING_STATUSES.CHECKED_IN, label: 'Checked In' },
        { value: BOOKING_STATUSES.CHECKED_OUT, label: 'Completed' },
        { value: BOOKING_STATUSES.CANCELLED, label: 'Cancelled' },
    ];

    const tableColumns = [
        { key: "bookingNumber", label: "Booking #" },
        { key: "dates", label: "Dates" },
        { key: "room", label: "Room" },
        { key: "duration", label: "Duration" },
        { key: "amount", label: "Amount" },
        { key: "status", label: "Status" },
        { key: "actions", label: "Actions" },
    ];

    const tableRows = filteredBookings.map((booking) => {
        const checkIn = new Date(booking.checkIn || booking.check_in);
        const checkOut = new Date(booking.checkOut || booking.check_out);
        const duration = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

        return {
            id: booking.id.toString(),
            bookingNumber: (
                <Anchor
                    onClick={() => handleViewDetails(booking)}
                    style={{ cursor: 'pointer' }}
                >
                    #{booking.id}
                </Anchor>
            ),
            dates: (
                <div>
                    <Text size="sm" fw={500}>
                        {formatDate(checkIn)}
                    </Text>
                    <Text size="xs" c="dimmed">
                        to {formatDate(checkOut)}
                    </Text>
                </div>
            ),
            room: (
                <Group gap="xs">
                    <IconBed size={16} />
                    <Text size="sm">
                        Room {booking.roomId || booking.room_id || 'N/A'}
                    </Text>
                </Group>
            ),
            duration: (
                <Text size="sm">
                    {duration} {duration === 1 ? 'night' : 'nights'}
                </Text>
            ),
            amount: (
                <Text size="sm" fw={500}>
                    {booking.totalAmount ? formatCurrency(booking.totalAmount) : 'N/A'}
                </Text>
            ),
            status: (
                <Badge
                    color={getStatusColor(booking.status)}
                    variant="light"
                    size="sm"
                >
                    {booking.status}
                </Badge>
            ),
            actions: (
                <Group gap="xs">
                    <ActionIcon
                        variant="light"
                        color="blue"
                        size="sm"
                        onClick={() => handleViewDetails(booking)}
                    >
                        <IconEye size={14} />
                    </ActionIcon>

                    <Menu shadow="md" width={200}>
                        <Menu.Target>
                            <ActionIcon variant="light" color="gray" size="sm">
                                <IconDots size={14} />
                            </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                            <Menu.Item
                                leftSection={<IconEye size={16} />}
                                onClick={() => handleViewDetails(booking)}
                            >
                                View Details
                            </Menu.Item>
                            {onEditBooking && (
                                <Menu.Item
                                    leftSection={<IconEdit size={16} />}
                                    onClick={() => onEditBooking(booking)}
                                >
                                    Edit Booking
                                </Menu.Item>
                            )}
                            <Menu.Item leftSection={<IconDownload size={16} />}>
                                Download Invoice
                            </Menu.Item>
                            <Menu.Item leftSection={<IconPrinter size={16} />}>
                                Print Details
                            </Menu.Item>
                            <Menu.Divider />
                            {onDeleteBooking && (
                                <Menu.Item
                                    color="red"
                                    leftSection={<IconTrash size={16} />}
                                    onClick={() => onDeleteBooking(booking.id)}
                                >
                                    Cancel Booking
                                </Menu.Item>
                            )}
                        </Menu.Dropdown>
                    </Menu>
                </Group>
            ),
        };
    });

    if (bookings.length === 0) {
        return (
            <Card p="xl" radius="md" withBorder>
                <Stack align="center" gap="md">
                    <ThemeIcon size={64} color="gray" variant="light">
                        <IconHistory size={32} />
                    </ThemeIcon>
                    <div style={{ textAlign: 'center' }}>
                        <Text fw={500} size="lg" mb={4}>No Booking History</Text>
                        <Text c="dimmed" size="sm" mb="md">
                            {guestId
                                ? "This guest hasn't made any bookings yet."
                                : "No bookings found in the system."
                            }
                        </Text>
                        {onCreateBooking && (
                            <Button leftSection={<IconCalendar size={16} />} onClick={onCreateBooking}>
                                Create First Booking
                            </Button>
                        )}
                    </div>
                </Stack>
            </Card>
        );
    }

    return (
        <Stack gap="md">
            <Group justify="space-between">
                <div>
                    <Text fw={600} size="lg">{title}</Text>
                    <Text c="dimmed" size="sm">
                        {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''} found
                    </Text>
                </div>
                {onCreateBooking && (
                    <Button leftSection={<IconCalendar size={16} />} onClick={onCreateBooking}>
                        New Booking
                    </Button>
                )}
            </Group>

            <Paper p="md" radius="md" withBorder>
                <Group>
                    <TextInput
                        placeholder="Search by booking ID, room, or status..."
                        leftSection={<IconSearch size={16} />}
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.currentTarget.value)}
                        style={{ flex: 1 }}
                    />
                    <Select
                        placeholder="Filter by status"
                        leftSection={<IconFilter size={16} />}
                        data={statusFilterOptions}
                        value={statusFilter}
                        onChange={setStatusFilter}
                        clearable
                    />
                    <ActionIcon variant="light" onClick={() => {
                        setSearchValue('');
                        setStatusFilter('all');
                        setCurrentPage(1);
                    }}>
                        <IconRefresh size={16} />
                    </ActionIcon>
                </Group>
            </Paper>

            <PaginatedTable
                columns={tableColumns}
                rows={tableRows}
                isLoading={false}
                page={currentPage}
                setPage={setCurrentPage}
                total={filteredBookings.length}
                pageSize={itemsPerPage}
                minWidth={800}
            />

            <BookingDetailsModal
                booking={viewingBooking}
                opened={detailsModalOpen}
                onClose={() => {
                    setDetailsModalOpen(false);
                    setViewingBooking(null);
                }}
            />
        </Stack>
    );
}
