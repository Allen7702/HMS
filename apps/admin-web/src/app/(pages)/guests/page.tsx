'use client';

import React from "react";
import {
  Title,
  Card,
  Group,
  Stack,
  Button,
  Text,
  TextInput,
  Select,
} from "@mantine/core";
import {
  IconSearch,
  IconPlus,
} from "@tabler/icons-react";
import { NewGuestForm } from "./components/NewGuestForm";
import { EditGuestForm } from "./components/EditGuestForm";
import { GuestProfile } from "./components/GuestProfile";
import { GuestStats } from "./components/GuestStats";
import { GuestTabs } from "./components/GuestTabs";
import { BookingHistory } from "./components/BookingHistory";
import { useGuestManagement } from "./hooks/useGuestManagement";
import { GUEST_STATUS_FILTERS, DEFAULT_PAGE_SIZE } from "./constants";
import { SideDrawer } from "ui";

 export default function GuestsPage() {
  const {
    searchValue,
    filterStatus,
    drawerOpen,
    editDrawerOpen,
    profileDrawerOpen,
    bookingHistoryDrawerOpen,
    editingGuest,
    viewingGuest,
    bookingHistoryGuest,
    currentPage,
    isSearching,
    currentGuests,
    arrivingGuests,
    departingGuests,
    
    setDrawerOpen,
    setEditDrawerOpen,
    setProfileDrawerOpen,
    setBookingHistoryDrawerOpen,
    setEditingGuest,
    setViewingGuest,
    setBookingHistoryGuest,
    setCurrentPage,
    setFilterStatus,
    
    handleNewGuest,
    handleEditGuest,
    handleEditClick,
    handleViewProfile,
    handleViewBookingHistory,
    handleEditFromProfile,
    handleDelete,
    handleSearch,
    
    bookings,
    isLoading,
    displayGuests,
  } = useGuestManagement();

  console.log("Booking:", { bookings });
  console.log("Guests:", { displayGuests });

  return (
    <Stack gap="xl">
      <Group justify="space-between">
        <div>
          <Title order={2}>Guest Management</Title>
          <Text c="dimmed" size="sm">
            Manage hotel guests, reservations, and walk-in registrations
          </Text>
        </div>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => setDrawerOpen(true)}
        >
          Add New Guest
        </Button>
      </Group>

      <GuestStats
        totalGuests={displayGuests.length}
        currentGuests={currentGuests.length}
        arrivingGuests={arrivingGuests.length}
        departingGuests={departingGuests.length}
        searchValue={searchValue}
        filterStatus={filterStatus}
      />

      <Card p="md">
        <Group>
          <TextInput
            placeholder="Search guests by name, email, or phone..."
            leftSection={<IconSearch size={16} />}
            value={searchValue}
            onChange={(e) => handleSearch(e.currentTarget.value)}
            style={{ flex: 1 }}
          />
          <Select
            placeholder="Filter by status"
            data={GUEST_STATUS_FILTERS}
            value={filterStatus}
            onChange={(value) => {
              setFilterStatus(value);
              setCurrentPage(1); 
            }}
            clearable
          />
        </Group>
      </Card>

      <GuestTabs
        allGuests={displayGuests}
        currentGuests={currentGuests}
        arrivingGuests={arrivingGuests}
        departingGuests={departingGuests}
        bookings={bookings}
        isLoading={isLoading.guests || isSearching}
        searchValue={searchValue}
        filterStatus={filterStatus}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        pageSize={DEFAULT_PAGE_SIZE}
        onViewProfile={handleViewProfile}
        onEdit={handleEditClick}
        onDelete={handleDelete}
        onViewBookingHistory={handleViewBookingHistory}
      />

      <SideDrawer
        opened={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Add New Guests"
      >
        <NewGuestForm
          onSubmit={handleNewGuest}
          onCancel={() => setDrawerOpen(false)}
        />
      </SideDrawer>

      <SideDrawer
        opened={editDrawerOpen}
        onClose={() => {
          setEditDrawerOpen(false);
          setEditingGuest(null);
        }}
        title="Edit Guest Details"
      >
        {editingGuest && (
          <EditGuestForm
            guest={editingGuest}
            onSubmit={handleEditGuest}
            onCancel={() => {
              setEditDrawerOpen(false);
              setEditingGuest(null);
            }}
          />
        )}
      </SideDrawer>

      <SideDrawer
        opened={profileDrawerOpen}
        onClose={() => {
          setProfileDrawerOpen(false);
          setViewingGuest(null);
        }}
        title="Guest Profile"
        size="xl"
      >
        {viewingGuest && (
          <GuestProfile
            guest={viewingGuest}
            bookings={bookings.filter((booking: any) => {
              const guestId = booking.guestId || booking.guest_id;
              return guestId === viewingGuest.id;
            })}
            onEdit={handleEditFromProfile}
            onClose={() => {
              setProfileDrawerOpen(false);
              setViewingGuest(null);
            }}
          />
        )}
      </SideDrawer>

      <SideDrawer
        opened={bookingHistoryDrawerOpen}
        onClose={() => {
          setBookingHistoryDrawerOpen(false);
          setBookingHistoryGuest(null);
        }}
        title={`Booking History - ${bookingHistoryGuest?.fullName || 'Guest'}`}
        size="xl"
      >
        {bookingHistoryGuest && (
          <BookingHistory
            bookings={bookings.filter((booking: any) => {
              const guestId = booking.guestId || booking.guest_id;
              return guestId === bookingHistoryGuest.id;
            })}
            guestId={bookingHistoryGuest.id}
            title={`Booking History for ${bookingHistoryGuest.fullName}`}
            showGuestColumn={false}
          />
        )}
      </SideDrawer>
    </Stack>
  );
}
