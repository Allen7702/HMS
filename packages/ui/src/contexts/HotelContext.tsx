'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Room, RoomType } from '../types';

// Import types from db package since API package exports them from there
import type { Guest, Booking } from 'db';
import { BookingAPI, GuestAPI } from 'api';

// Import API classes directly from the API package files


interface HotelState {
  rooms: Room[];
  roomTypes: RoomType[];
  guests: Guest[];
  bookings: Booking[];
  currentBookings: Booking[];
  isLoading: {
    rooms: boolean;
    roomTypes: boolean;
    guests: boolean;
    bookings: boolean;
  };
}

interface HotelContextType extends HotelState {
  // Room management
  fetchRooms: () => Promise<void>;
  updateRoomStatus: (roomId: number, status: Room['status']) => Promise<void>;
  createRoom: (room: Omit<Room, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateRoom: (roomId: number, updates: Partial<Room>) => Promise<void>;
  deleteRoom: (roomId: number) => Promise<void>;

  // Room type management
  fetchRoomTypes: () => Promise<void>;
  createRoomType: (roomType: Omit<RoomType, 'id'>) => Promise<void>;
  updateRoomType: (id: number, updates: Partial<RoomType>) => Promise<void>;
  deleteRoomType: (id: number) => Promise<void>;

  // Guest management
  fetchGuests: (page?: number, pageSize?: number) => Promise<void>;
  createGuest: (guest: Omit<Guest, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Guest>;
  updateGuest: (guestId: number, updates: Partial<Guest>) => Promise<void>;
  deleteGuest: (guestId: number) => Promise<void>;
  searchGuests: (query: string) => Promise<Guest[]>;

  // Booking management
  fetchBookings: (filters?: { dateRange?: [Date, Date]; status?: string; page?: number; pageSize?: number }) => Promise<void>;
  createBooking: (booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Booking>;
  updateBooking: (bookingId: number, updates: Partial<Booking>) => Promise<void>;
  cancelBooking: (bookingId: number) => Promise<void>;
  checkIn: (bookingId: number) => Promise<void>;
  checkOut: (bookingId: number) => Promise<void>;

  // Utility functions
  getAvailableRooms: (checkIn: Date, checkOut: Date) => Room[];
  getRoomOccupancy: () => { occupied: number; available: number; maintenance: number; dirty: number };

  // Pagination info
  guestPagination: {
    totalCount: number;
    currentPage: number;
    totalPages: number;
  };
  bookingPagination: {
    totalCount: number;
    currentPage: number;
    totalPages: number;
  };
}

const HotelContext = createContext<HotelContextType | undefined>(undefined);

type HotelAction =
  | { type: 'SET_LOADING'; payload: { key: keyof HotelState['isLoading']; value: boolean } }
  | { type: 'SET_ROOMS'; payload: Room[] }
  | { type: 'UPDATE_ROOM'; payload: Room }
  | { type: 'ADD_ROOM'; payload: Room }
  | { type: 'REMOVE_ROOM'; payload: number }
  | { type: 'SET_ROOM_TYPES'; payload: RoomType[] }
  | { type: 'UPDATE_ROOM_TYPE'; payload: RoomType }
  | { type: 'ADD_ROOM_TYPE'; payload: RoomType }
  | { type: 'REMOVE_ROOM_TYPE'; payload: number }
  | { type: 'SET_GUESTS'; payload: { guests: Guest[]; pagination: any } }
  | { type: 'UPDATE_GUEST'; payload: Guest }
  | { type: 'ADD_GUEST'; payload: Guest }
  | { type: 'REMOVE_GUEST'; payload: number }
  | { type: 'SET_BOOKINGS'; payload: { bookings: Booking[]; pagination: any } }
  | { type: 'UPDATE_BOOKING'; payload: Booking }
  | { type: 'ADD_BOOKING'; payload: Booking }
  | { type: 'REMOVE_BOOKING'; payload: number }
  | { type: 'SET_GUEST_PAGINATION'; payload: any }
  | { type: 'SET_BOOKING_PAGINATION'; payload: any };

const initialState: HotelState = {
  rooms: [],
  roomTypes: [],
  guests: [],
  bookings: [],
  currentBookings: [],
  isLoading: {
    rooms: false,
    roomTypes: false,
    guests: false,
    bookings: false,
  },
};

function hotelReducer(state: HotelState, action: HotelAction): HotelState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: {
          ...state.isLoading,
          [action.payload.key]: action.payload.value,
        },
      };
    case 'SET_ROOMS':
      return { ...state, rooms: action.payload };
    case 'UPDATE_ROOM':
      return {
        ...state,
        rooms: state.rooms.map(room =>
          room.id === action.payload.id ? action.payload : room
        ),
      };
    case 'ADD_ROOM':
      return { ...state, rooms: [...state.rooms, action.payload] };
    case 'REMOVE_ROOM':
      return {
        ...state,
        rooms: state.rooms.filter(room => room.id !== action.payload),
      };
    case 'SET_ROOM_TYPES':
      return { ...state, roomTypes: action.payload };
    case 'UPDATE_ROOM_TYPE':
      return {
        ...state,
        roomTypes: state.roomTypes.map(rt =>
          rt.id === action.payload.id ? action.payload : rt
        ),
      };
    case 'ADD_ROOM_TYPE':
      return { ...state, roomTypes: [...state.roomTypes, action.payload] };
    case 'REMOVE_ROOM_TYPE':
      return {
        ...state,
        roomTypes: state.roomTypes.filter(rt => rt.id !== action.payload),
      };
    case 'SET_GUESTS':
      return { ...state, guests: action.payload.guests };
    case 'UPDATE_GUEST':
      return {
        ...state,
        guests: state.guests.map(guest =>
          guest.id === action.payload.id ? action.payload : guest
        ),
      };
    case 'ADD_GUEST':
      return { ...state, guests: [...state.guests, action.payload] };
    case 'REMOVE_GUEST':
      return {
        ...state,
        guests: state.guests.filter(guest => guest.id !== action.payload),
      };
    case 'SET_BOOKINGS':
      return {
        ...state,
        bookings: action.payload.bookings,
        currentBookings: action.payload.bookings.filter((b: Booking) => b.status === 'CheckedIn'),
      };
    case 'UPDATE_BOOKING':
      const updatedBookings = state.bookings.map(booking =>
        booking.id === action.payload.id ? action.payload : booking
      );
      return {
        ...state,
        bookings: updatedBookings,
        currentBookings: updatedBookings.filter(b => b.status === 'CheckedIn'),
      };
    case 'ADD_BOOKING':
      const newBookings = [...state.bookings, action.payload];
      return {
        ...state,
        bookings: newBookings,
        currentBookings: newBookings.filter(b => b.status === 'CheckedIn'),
      };
    case 'REMOVE_BOOKING':
      const filteredBookings = state.bookings.filter(booking => booking.id !== action.payload);
      return {
        ...state,
        bookings: filteredBookings,
        currentBookings: filteredBookings.filter(b => b.status === 'CheckedIn'),
      };
    default:
      return state;
  }
}

interface HotelProviderProps {
  children: ReactNode;
}

export function HotelProvider({ children }: HotelProviderProps) {
  const [state, dispatch] = useReducer(hotelReducer, initialState);
  const [guestPagination, setGuestPagination] = React.useState({
    totalCount: 0,
    currentPage: 1,
    totalPages: 0,
  });
  const [bookingPagination, setBookingPagination] = React.useState({
    totalCount: 0,
    currentPage: 1,
    totalPages: 0,
  });
  
  //TODO: remove mock implementations and implement real room management functions
  // Mock room management functions (keep existing mock implementation for now)
  const fetchRooms = async () => {
    dispatch({ type: 'SET_LOADING', payload: { key: 'rooms', value: true } });
    try {
      // Mock data for rooms - replace with actual API call when available
      const mockRooms: Room[] = [
        {
          id: 1,
          roomNumber: '101',
          floor: 1,
          roomTypeId: 1,
          status: 'Available',
          features: ['WiFi', 'AC', 'TV'],
          lastCleaned: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      dispatch({ type: 'SET_ROOMS', payload: mockRooms });
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'rooms', value: false } });
    }
  };

  // Mock room type management (keep existing for now)
  const fetchRoomTypes = async () => {
    dispatch({ type: 'SET_LOADING', payload: { key: 'roomTypes', value: true } });
    try {
      const mockRoomTypes: RoomType[] = [
        {
          id: 1,
          name: 'Standard',
          description: 'Comfortable standard rooms',
          capacity: 2,
          priceModifier: 0,
        },
      ];
      dispatch({ type: 'SET_ROOM_TYPES', payload: mockRoomTypes });
    } catch (error) {
      console.error('Error fetching room types:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'roomTypes', value: false } });
    }
  };

  // Guest management using real API
  const fetchGuests = async (page = 1, pageSize = 20) => {
    console.log('NewHotelContext: Starting fetchGuests with page:', page, 'pageSize:', pageSize);
    dispatch({ type: 'SET_LOADING', payload: { key: 'guests', value: true } });
    try {
      console.log('NewHotelContext: Calling GuestAPI.getGuests...');
      const result = await GuestAPI.getGuests({ page, pageSize });
      console.log('NewHotelContext: GuestAPI.getGuests result:', result);
      dispatch({ type: 'SET_GUESTS', payload: { guests: result.guests, pagination: result } });
      setGuestPagination({
        totalCount: result.totalCount,
        currentPage: result.currentPage,
        totalPages: result.totalPages,
      });
      console.log('NewHotelContext: Successfully set guests:', result.guests.length, 'guests');
    } catch (error) {
      console.error('NewHotelContext: Error fetching guests:', error);
      console.warn('Using fallback: Database may not be properly set up. Returning empty guest list.');

      // Fallback to empty state on error
      dispatch({ type: 'SET_GUESTS', payload: { guests: [], pagination: { totalCount: 0, currentPage: 1, totalPages: 0 } } });
      setGuestPagination({
        totalCount: 0,
        currentPage: 1,
        totalPages: 0,
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'guests', value: false } });
    }
  };

  const createGuest = async (guestData: Omit<Guest, 'id' | 'createdAt' | 'updatedAt'>): Promise<Guest> => {
    try {
      const newGuest = await GuestAPI.createGuest(guestData);
      dispatch({ type: 'ADD_GUEST', payload: newGuest });
      return newGuest;
    } catch (error) {
      console.error('Error creating guest:', error);
      console.warn('Failed to create guest in database. This may be due to database connectivity issues.');
      throw new Error('Failed to create guest. Please check your database connection.');
    }
  };

  const updateGuest = async (guestId: number, updates: Partial<Guest>) => {
    try {
      const updatedGuest = await GuestAPI.updateGuest(guestId, updates);
      dispatch({ type: 'UPDATE_GUEST', payload: updatedGuest });
    } catch (error) {
      console.error('Error updating guest:', error);
      throw error;
    }
  };

  const deleteGuest = async (guestId: number) => {
    try {
      await GuestAPI.deleteGuest(guestId);
      dispatch({ type: 'REMOVE_GUEST', payload: guestId });
    } catch (error) {
      console.error('Error deleting guest:', error);
      throw error;
    }
  };

  const searchGuests = async (query: string): Promise<Guest[]> => {
    try {
      return await GuestAPI.searchGuests(query);
    } catch (error) {
      console.error('Error searching guests:', error);
      throw error;
    }
  };

  // Booking management using real API
  const fetchBookings = async (filters: { dateRange?: [Date, Date]; status?: string; page?: number; pageSize?: number } = {}) => {
    console.log('NewHotelContext: Starting fetchBookings with filters:', filters);
    dispatch({ type: 'SET_LOADING', payload: { key: 'bookings', value: true } });
    try {
      const { page = 1, pageSize = 20, status } = filters;
      const apiFilters: any = { page, pageSize };

      if (status) apiFilters.status = status;
      // Note: Date range filtering temporarily disabled for simplicity

      console.log('NewHotelContext: Calling BookingAPI.getBookings with filters:', apiFilters);
      const result = await BookingAPI.getBookings(apiFilters);
      console.log('NewHotelContext: BookingAPI.getBookings result:', result);
      console.log('NewHotelContext: Raw booking data sample:', result.bookings?.[0]);

      dispatch({ type: 'SET_BOOKINGS', payload: { bookings: result.bookings, pagination: result } });
      setBookingPagination({
        totalCount: result.totalCount,
        currentPage: result.currentPage,
        totalPages: result.totalPages,
      });
      console.log('NewHotelContext: Successfully set bookings:', result.bookings.length, 'bookings');
    } catch (error) {
      console.error('NewHotelContext: Error fetching bookings:', error);
      console.warn('Using fallback: Database may not be properly set up. Returning empty booking list.');

      // Fallback to empty state on error
      dispatch({ type: 'SET_BOOKINGS', payload: { bookings: [], pagination: { totalCount: 0, currentPage: 1, totalPages: 0 } } });
      setBookingPagination({
        totalCount: 0,
        currentPage: 1,
        totalPages: 0,
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'bookings', value: false } });
    }
  };

  const createBooking = async (bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<Booking> => {
    try {
      const newBooking = await BookingAPI.createBooking(bookingData);
      dispatch({ type: 'ADD_BOOKING', payload: newBooking });
      return newBooking;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  };

  const updateBooking = async (bookingId: number, updates: Partial<Booking>) => {
    try {
      const updatedBooking = await BookingAPI.updateBooking(bookingId, updates);
      dispatch({ type: 'UPDATE_BOOKING', payload: updatedBooking });
    } catch (error) {
      console.error('Error updating booking:', error);
      throw error;
    }
  };

  const cancelBooking = async (bookingId: number) => {
    try {
      const cancelledBooking = await BookingAPI.cancelBooking(bookingId);
      dispatch({ type: 'UPDATE_BOOKING', payload: cancelledBooking });
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  };

  const checkIn = async (bookingId: number) => {
    try {
      const checkedInBooking = await BookingAPI.checkInBooking(bookingId);
      dispatch({ type: 'UPDATE_BOOKING', payload: checkedInBooking });
    } catch (error) {
      console.error('Error checking in booking:', error);
      throw error;
    }
  };

  const checkOut = async (bookingId: number) => {
    try {
      const checkedOutBooking = await BookingAPI.checkOutBooking(bookingId);
      dispatch({ type: 'UPDATE_BOOKING', payload: checkedOutBooking });
    } catch (error) {
      console.error('Error checking out booking:', error);
      throw error;
    }
  };

  // Mock functions for room management (until Room API is implemented)
  const updateRoomStatus = async (roomId: number, status: Room['status']) => {
    try {
      const updatedRoom: Room = {
        ...state.rooms.find(r => r.id === roomId)!,
        status,
        updatedAt: new Date(),
      };
      dispatch({ type: 'UPDATE_ROOM', payload: updatedRoom });
    } catch (error) {
      console.error('Error updating room status:', error);
      throw error;
    }
  };

  const createRoom = async (roomData: Omit<Room, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newRoom: Room = {
        ...roomData,
        id: Math.max(...state.rooms.map(r => r.id), 0) + 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      dispatch({ type: 'ADD_ROOM', payload: newRoom });
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  };

  const updateRoom = async (roomId: number, updates: Partial<Room>) => {
    try {
      const updatedRoom: Room = {
        ...state.rooms.find(r => r.id === roomId)!,
        ...updates,
        updatedAt: new Date(),
      };
      dispatch({ type: 'UPDATE_ROOM', payload: updatedRoom });
    } catch (error) {
      console.error('Error updating room:', error);
      throw error;
    }
  };

  const deleteRoom = async (roomId: number) => {
    try {
      dispatch({ type: 'REMOVE_ROOM', payload: roomId });
    } catch (error) {
      console.error('Error deleting room:', error);
      throw error;
    }
  };

  // Mock functions for room type management
  const createRoomType = async (roomTypeData: Omit<RoomType, 'id'>) => {
    try {
      const newRoomType: RoomType = {
        ...roomTypeData,
        id: Math.max(...state.roomTypes.map(rt => rt.id), 0) + 1,
      };
      dispatch({ type: 'ADD_ROOM_TYPE', payload: newRoomType });
    } catch (error) {
      console.error('Error creating room type:', error);
      throw error;
    }
  };

  const updateRoomType = async (id: number, updates: Partial<RoomType>) => {
    try {
      const updatedRoomType: RoomType = {
        ...state.roomTypes.find(rt => rt.id === id)!,
        ...updates,
      };
      dispatch({ type: 'UPDATE_ROOM_TYPE', payload: updatedRoomType });
    } catch (error) {
      console.error('Error updating room type:', error);
      throw error;
    }
  };

  const deleteRoomType = async (id: number) => {
    try {
      dispatch({ type: 'REMOVE_ROOM_TYPE', payload: id });
    } catch (error) {
      console.error('Error deleting room type:', error);
      throw error;
    }
  };

  // Utility functions
  const getAvailableRooms = (checkIn: Date, checkOut: Date): Room[] => {
    return state.rooms.filter(room => {
      if (room.status !== 'Available') return false;

      // Check if room is booked during the requested period
      const isBooked = state.bookings.some(booking => {
        if (booking.roomId !== room.id) return false;
        if (booking.status === 'Cancelled' || booking.status === 'CheckedOut') return false;

        const bookingCheckIn = new Date(booking.checkIn);
        const bookingCheckOut = new Date(booking.checkOut);

        // Check for overlap
        return !(checkOut <= bookingCheckIn || checkIn >= bookingCheckOut);
      });

      return !isBooked;
    });
  };

  const getRoomOccupancy = () => {
    const occupied = state.rooms.filter(r => r.status === 'Occupied').length;
    const available = state.rooms.filter(r => r.status === 'Available').length;
    const maintenance = state.rooms.filter(r => r.status === 'Maintenance').length;
    const dirty = state.rooms.filter(r => r.status === 'Dirty').length;

    return { occupied, available, maintenance, dirty };
  };

  const value: HotelContextType = {
    ...state,
    guestPagination,
    bookingPagination,
    fetchRooms,
    updateRoomStatus,
    createRoom,
    updateRoom,
    deleteRoom,
    fetchRoomTypes,
    createRoomType,
    updateRoomType,
    deleteRoomType,
    fetchGuests,
    createGuest,
    updateGuest,
    deleteGuest,
    searchGuests,
    fetchBookings,
    createBooking,
    updateBooking,
    cancelBooking,
    checkIn,
    checkOut,
    getAvailableRooms,
    getRoomOccupancy,
  };

  return <HotelContext.Provider value={value}>{children}</HotelContext.Provider>;
}

export function useHotel() {
  const context = useContext(HotelContext);
  if (context === undefined) {
    throw new Error('useHotel must be used within a HotelProvider');
  }
  return context;
}
