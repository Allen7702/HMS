import { useEffect } from 'react';
import { useHotel } from '../contexts/HotelContext';
import { useNotifications } from '../contexts/NotificationContext';
import { supabase } from 'api';

export function useRealtimeSubscriptions() {
  const { fetchRooms, fetchBookings, fetchGuests } = useHotel();
  const { showMantineNotification } = useNotifications();

  useEffect(() => {
    // Subscribe to rooms changes
    const roomsSubscription = supabase
      .channel('rooms_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms',
        },
        (payload) => {
          console.log('Room change:', payload);
          
          if (payload.eventType === 'UPDATE') {
            showMantineNotification(
              'info',
              'Room Updated',
              `Room ${payload.new.room_number} status changed to ${payload.new.status}`
            );
          } else if (payload.eventType === 'INSERT') {
            showMantineNotification(
              'success',
              'New Room Added',
              `Room ${payload.new.room_number} has been added`
            );
          }
          
          // Refresh rooms data
          fetchRooms();
        }
      )
      .subscribe();

    // Subscribe to bookings changes
    const bookingsSubscription = supabase
      .channel('bookings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
        },
        (payload) => {
          console.log('Booking change:', payload);
          
          if (payload.eventType === 'INSERT') {
            showMantineNotification(
              'success',
              'New Booking',
              'A new booking has been created'
            );
          } else if (payload.eventType === 'UPDATE') {
            const statusMessages = {
              'Confirmed': 'Booking confirmed',
              'CheckedIn': 'Guest checked in',
              'CheckedOut': 'Guest checked out',
              'Cancelled': 'Booking cancelled',
            };
            
            const message = statusMessages[payload.new.status as keyof typeof statusMessages] || 'Booking updated';
            
            showMantineNotification(
              payload.new.status === 'Cancelled' ? 'warning' : 'info',
              'Booking Updated',
              message
            );
          }
          
          // Refresh bookings data
          fetchBookings();
        }
      )
      .subscribe();

    // Subscribe to guests changes
    const guestsSubscription = supabase
      .channel('guests_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'guests',
        },
        (payload) => {
          console.log('Guest change:', payload);
          
          if (payload.eventType === 'INSERT') {
            showMantineNotification(
              'success',
              'New Guest',
              `Guest ${payload.new.name} has been registered`
            );
          }
          
          // Refresh guests data
          fetchGuests();
        }
      )
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      roomsSubscription.unsubscribe();
      bookingsSubscription.unsubscribe();
      guestsSubscription.unsubscribe();
    };
  }, [fetchRooms, fetchBookings, fetchGuests, showMantineNotification]);
}

// Hook for real-time room occupancy updates
export function useRoomOccupancyUpdates() {
  const { getRoomOccupancy } = useHotel();

  useEffect(() => {
    const subscription = supabase
      .channel('room_occupancy')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rooms',
          filter: 'status=neq.Available',
        },
        () => {
          // Trigger occupancy recalculation
          // This could be used to update dashboard widgets in real-time
          const occupancy = getRoomOccupancy();
          console.log('Room occupancy updated:', occupancy);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [getRoomOccupancy]);
}
