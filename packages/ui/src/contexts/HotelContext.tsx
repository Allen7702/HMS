'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { SupabaseAuth } from '../lib/supabase-api';
import { supabase } from 'api';
import { Room, RoomType, Guest, BookingWithRelations as Booking } from '../types';

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
  fetchGuests: () => Promise<void>;
  createGuest: (guest: Omit<Guest, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Guest>;
  updateGuest: (guestId: number, updates: Partial<Guest>) => Promise<void>;
  deleteGuest: (guestId: number) => Promise<void>;
  searchGuests: (query: string) => Promise<Guest[]>;

  // Booking management
  fetchBookings: (filters?: { dateRange?: [Date, Date]; status?: string }) => Promise<void>;
  createBooking: (booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Booking>;
  updateBooking: (bookingId: number, updates: Partial<Booking>) => Promise<void>;
  cancelBooking: (bookingId: number) => Promise<void>;
  checkIn: (bookingId: number) => Promise<void>;
  checkOut: (bookingId: number) => Promise<void>;

  // Utility functions
  getAvailableRooms: (checkIn: Date, checkOut: Date) => Room[];
  getRoomOccupancy: () => { occupied: number; available: number; maintenance: number; dirty: number };
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
  | { type: 'SET_GUESTS'; payload: Guest[] }
  | { type: 'UPDATE_GUEST'; payload: Guest }
  | { type: 'ADD_GUEST'; payload: Guest }
  | { type: 'REMOVE_GUEST'; payload: number }
  | { type: 'SET_BOOKINGS'; payload: Booking[] }
  | { type: 'UPDATE_BOOKING'; payload: Booking }
  | { type: 'ADD_BOOKING'; payload: Booking }
  | { type: 'REMOVE_BOOKING'; payload: number };

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
        isLoading: { ...state.isLoading, [action.payload.key]: action.payload.value },
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
        roomTypes: state.roomTypes.map(type => 
          type.id === action.payload.id ? action.payload : type
        ),
      };

    case 'ADD_ROOM_TYPE':
      return { ...state, roomTypes: [...state.roomTypes, action.payload] };

    case 'REMOVE_ROOM_TYPE':
      return {
        ...state,
        roomTypes: state.roomTypes.filter(type => type.id !== action.payload),
      };

    case 'SET_GUESTS':
      return { ...state, guests: action.payload };

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
        bookings: action.payload,
        currentBookings: action.payload.filter(b => 
          b.status === 'Confirmed' || b.status === 'CheckedIn'
        ),
      };

    case 'UPDATE_BOOKING':
      const updatedBookings = state.bookings.map(booking => 
        booking.id === action.payload.id ? action.payload : booking
      );
      return {
        ...state,
        bookings: updatedBookings,
        currentBookings: updatedBookings.filter(b => 
          b.status === 'Confirmed' || b.status === 'CheckedIn'
        ),
      };

    case 'ADD_BOOKING':
      const newBookings = [...state.bookings, action.payload];
      return {
        ...state,
        bookings: newBookings,
        currentBookings: newBookings.filter(b => 
          b.status === 'Confirmed' || b.status === 'CheckedIn'
        ),
      };

    case 'REMOVE_BOOKING':
      const filteredBookings = state.bookings.filter(booking => booking.id !== action.payload);
      return {
        ...state,
        bookings: filteredBookings,
        currentBookings: filteredBookings.filter(b => 
          b.status === 'Confirmed' || b.status === 'CheckedIn'
        ),
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

  // Room management functions
  const fetchRooms = async () => {
    dispatch({ type: 'SET_LOADING', payload: { key: 'rooms', value: true } });
    try {
      const { data: rooms, error } = await supabase
        .from('rooms')
        .select(`
          *,
          room_types(*)
        `)
        .order('room_number');

      if (error) {
        throw error;
      }

      // Convert Supabase data to our Room type
      const convertedRooms: Room[] = rooms?.map(room => ({
        id: room.id,
        roomNumber: room.room_number,
        floor: room.floor,
        roomTypeId: room.room_type_id,
        status: room.status,
        features: room.features,
        lastCleaned: room.last_cleaned,
        createdAt: room.created_at,
        updatedAt: room.updated_at,
      })) || [];

      dispatch({ type: 'SET_ROOMS', payload: convertedRooms });
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'rooms', value: false } });
    }
  };

  const updateRoomStatus = async (roomId: number, status: Room['status']) => {
    try {
      const { data: updatedRoom, error } = await supabase
        .from('rooms')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', roomId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Convert and update local state
      const convertedRoom: Room = {
        id: updatedRoom.id,
        roomNumber: updatedRoom.room_number,
        floor: updatedRoom.floor,
        roomTypeId: updatedRoom.room_type_id,
        status: updatedRoom.status,
        features: updatedRoom.features,
        lastCleaned: updatedRoom.last_cleaned,
        createdAt: updatedRoom.created_at,
        updatedAt: updatedRoom.updated_at,
      };

      dispatch({ type: 'UPDATE_ROOM', payload: convertedRoom });
    } catch (error) {
      console.error('Error updating room status:', error);
      throw error;
    }
  };

  const createRoom = async (roomData: Omit<Room, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data: newRoom, error } = await supabase
        .from('rooms')
        .insert({
          room_number: roomData.roomNumber,
          floor: roomData.floor,
          room_type_id: roomData.roomTypeId,
          status: roomData.status || 'Available',
          features: roomData.features,
          last_cleaned: roomData.lastCleaned,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      const convertedRoom: Room = {
        id: newRoom.id,
        roomNumber: newRoom.room_number,
        floor: newRoom.floor,
        roomTypeId: newRoom.room_type_id,
        status: newRoom.status,
        features: newRoom.features,
        lastCleaned: newRoom.last_cleaned,
        createdAt: newRoom.created_at,
        updatedAt: newRoom.updated_at,
      };

      dispatch({ type: 'ADD_ROOM', payload: convertedRoom });
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  };

  const updateRoom = async (roomId: number, updates: Partial<Room>) => {
    try {
      const supabaseUpdates: any = {};
      
      if (updates.roomNumber) supabaseUpdates.room_number = updates.roomNumber;
      if (updates.floor !== undefined) supabaseUpdates.floor = updates.floor;
      if (updates.roomTypeId !== undefined) supabaseUpdates.room_type_id = updates.roomTypeId;
      if (updates.status) supabaseUpdates.status = updates.status;
      if (updates.features !== undefined) supabaseUpdates.features = updates.features;
      if (updates.lastCleaned !== undefined) supabaseUpdates.last_cleaned = updates.lastCleaned;
      
      supabaseUpdates.updated_at = new Date().toISOString();

      const { data: updatedRoom, error } = await supabase
        .from('rooms')
        .update(supabaseUpdates)
        .eq('id', roomId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      const convertedRoom: Room = {
        id: updatedRoom.id,
        roomNumber: updatedRoom.room_number,
        floor: updatedRoom.floor,
        roomTypeId: updatedRoom.room_type_id,
        status: updatedRoom.status,
        features: updatedRoom.features,
        lastCleaned: updatedRoom.last_cleaned,
        createdAt: updatedRoom.created_at,
        updatedAt: updatedRoom.updated_at,
      };

      dispatch({ type: 'UPDATE_ROOM', payload: convertedRoom });
    } catch (error) {
      console.error('Error updating room:', error);
      throw error;
    }
  };

  const deleteRoom = async (roomId: number) => {
    try {
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', roomId);

      if (error) {
        throw error;
      }

      dispatch({ type: 'REMOVE_ROOM', payload: roomId });
    } catch (error) {
      console.error('Error deleting room:', error);
      throw error;
    }
  };

  // Similar implementations for other CRUD operations...
  const fetchRoomTypes = async () => {
    dispatch({ type: 'SET_LOADING', payload: { key: 'roomTypes', value: true } });
    try {
      const { data: roomTypes, error } = await supabase
        .from('room_types')
        .select('*')
        .order('name');

      if (error) {
        throw error;
      }

      const convertedRoomTypes: RoomType[] = roomTypes?.map(rt => ({
        id: rt.id,
        name: rt.name,
        description: rt.description,
        capacity: rt.capacity,
        priceModifier: rt.price_modifier || 0,
      })) || [];

      dispatch({ type: 'SET_ROOM_TYPES', payload: convertedRoomTypes });
    } catch (error) {
      console.error('Error fetching room types:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'roomTypes', value: false } });
    }
  };

  const createRoomType = async (roomTypeData: Omit<RoomType, 'id'>) => {
    try {
      const { data: newRoomType, error } = await supabase
        .from('room_types')
        .insert({
          name: roomTypeData.name,
          description: roomTypeData.description,
          capacity: roomTypeData.capacity,
          price_modifier: roomTypeData.priceModifier,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      const convertedRoomType: RoomType = {
        id: newRoomType.id,
        name: newRoomType.name,
        description: newRoomType.description,
        capacity: newRoomType.capacity,
        priceModifier: newRoomType.price_modifier || 0,
      };

      dispatch({ type: 'ADD_ROOM_TYPE', payload: convertedRoomType });
    } catch (error) {
      console.error('Error creating room type:', error);
      throw error;
    }
  };

  const updateRoomType = async (id: number, updates: Partial<RoomType>) => {
    try {
      const supabaseUpdates: any = {};
      
      if (updates.name) supabaseUpdates.name = updates.name;
      if (updates.description !== undefined) supabaseUpdates.description = updates.description;
      if (updates.capacity !== undefined) supabaseUpdates.capacity = updates.capacity;
      if (updates.priceModifier !== undefined) supabaseUpdates.price_modifier = updates.priceModifier;

      const { data: updatedRoomType, error } = await supabase
        .from('room_types')
        .update(supabaseUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      const convertedRoomType: RoomType = {
        id: updatedRoomType.id,
        name: updatedRoomType.name,
        description: updatedRoomType.description,
        capacity: updatedRoomType.capacity,
        priceModifier: updatedRoomType.price_modifier || 0,
      };

      dispatch({ type: 'UPDATE_ROOM_TYPE', payload: convertedRoomType });
    } catch (error) {
      console.error('Error updating room type:', error);
      throw error;
    }
  };

  const deleteRoomType = async (id: number) => {
    try {
      const { error } = await supabase
        .from('room_types')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      dispatch({ type: 'REMOVE_ROOM_TYPE', payload: id });
    } catch (error) {
      console.error('Error deleting room type:', error);
      throw error;
    }
  };

  // Guest management
  const fetchGuests = async () => {
    dispatch({ type: 'SET_LOADING', payload: { key: 'guests', value: true } });
    try {
      const { data: guests, error } = await supabase
        .from('guests')
        .select('*')
        .order('name');

      if (error) {
        throw error;
      }

      const convertedGuests: Guest[] = guests?.map(guest => ({
        id: guest.id,
        fullName: guest.name,
        email: guest.email,
        phone: guest.phone,
        address: guest.address,
        preferences: guest.preferences,
        loyaltyPoints: guest.loyalty_points,
        loyaltyTier: guest.loyalty_tier,
        gdprConsent: guest.gdpr_consent,
        createdAt: guest.created_at,
        updatedAt: guest.updated_at,
        userId: guest.user_id,
      })) || [];

      dispatch({ type: 'SET_GUESTS', payload: convertedGuests });
    } catch (error) {
      console.error('Error fetching guests:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'guests', value: false } });
    }
  };

  const createGuest = async (guestData: Omit<Guest, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data: newGuest, error } = await supabase
        .from('guests')
        .insert({
          name: guestData.fullName,
          email: guestData.email,
          phone: guestData.phone,
          address: guestData.address,
          preferences: guestData.preferences,
          loyalty_points: guestData.loyaltyPoints || 0,
          loyalty_tier: guestData.loyaltyTier || 'None',
          gdpr_consent: guestData.gdprConsent || false,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      const convertedGuest: Guest = {
        id: newGuest.id,
        fullName: newGuest.name,
        email: newGuest.email,
        phone: newGuest.phone,
        address: newGuest.address,
        preferences: newGuest.preferences,
        loyaltyPoints: newGuest.loyalty_points,
        loyaltyTier: newGuest.loyalty_tier,
        gdprConsent: newGuest.gdpr_consent,
        createdAt: newGuest.created_at,
        updatedAt: newGuest.updated_at,
        userId: newGuest.user_id,
      };

      dispatch({ type: 'ADD_GUEST', payload: convertedGuest });
      return convertedGuest;
    } catch (error) {
      console.error('Error creating guest:', error);
      throw error;
    }
  };

  const updateGuest = async (guestId: number, updates: Partial<Guest>) => {
    try {
      const supabaseUpdates: any = {};
      
      if (updates.fullName) supabaseUpdates.name = updates.fullName;
      if (updates.email) supabaseUpdates.email = updates.email;
      if (updates.phone !== undefined) supabaseUpdates.phone = updates.phone;
      if (updates.address !== undefined) supabaseUpdates.address = updates.address;
      if (updates.preferences !== undefined) supabaseUpdates.preferences = updates.preferences;
      if (updates.loyaltyPoints !== undefined) supabaseUpdates.loyalty_points = updates.loyaltyPoints;
      if (updates.loyaltyTier) supabaseUpdates.loyalty_tier = updates.loyaltyTier;
      if (updates.gdprConsent !== undefined) supabaseUpdates.gdpr_consent = updates.gdprConsent;
      
      supabaseUpdates.updated_at = new Date().toISOString();

      const { data: updatedGuest, error } = await supabase
        .from('guests')
        .update(supabaseUpdates)
        .eq('id', guestId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      const convertedGuest: Guest = {
        id: updatedGuest.id,
        fullName: updatedGuest.name,
        email: updatedGuest.email,
        phone: updatedGuest.phone,
        address: updatedGuest.address,
        preferences: updatedGuest.preferences,
        loyaltyPoints: updatedGuest.loyalty_points,
        loyaltyTier: updatedGuest.loyalty_tier,
        gdprConsent: updatedGuest.gdpr_consent,
        createdAt: updatedGuest.created_at,
        updatedAt: updatedGuest.updated_at,
        userId: updatedGuest.user_id,
      };

      dispatch({ type: 'UPDATE_GUEST', payload: convertedGuest });
    } catch (error) {
      console.error('Error updating guest:', error);
      throw error;
    }
  };

  const deleteGuest = async (guestId: number) => {
    try {
      const { error } = await supabase
        .from('guests')
        .delete()
        .eq('id', guestId);

      if (error) {
        throw error;
      }

      dispatch({ type: 'REMOVE_GUEST', payload: guestId });
    } catch (error) {
      console.error('Error deleting guest:', error);
      throw error;
    }
  };

  const searchGuests = async (query: string): Promise<Guest[]> => {
    try {
      const { data: guests, error } = await supabase
        .from('guests')
        .select('*')
        .or(`name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
        .order('name')
        .limit(10);

      if (error) {
        throw error;
      }

      return guests?.map(guest => ({
        id: guest.id,
        fullName: guest.name,
        email: guest.email,
        phone: guest.phone,
        address: guest.address,
        preferences: guest.preferences,
        loyaltyPoints: guest.loyalty_points,
        loyaltyTier: guest.loyalty_tier,
        gdprConsent: guest.gdpr_consent,
        createdAt: guest.created_at,
        updatedAt: guest.updated_at,
        userId: guest.user_id,
      })) || [];
    } catch (error) {
      console.error('Error searching guests:', error);
      return [];
    }
  };

  // Booking management
  const fetchBookings = async (filters?: { dateRange?: [Date, Date]; status?: string }) => {
    dispatch({ type: 'SET_LOADING', payload: { key: 'bookings', value: true } });
    try {
      let query = supabase
        .from('bookings')
        .select(`
          *,
          guests(*),
          rooms(*)
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.dateRange) {
        const [startDate, endDate] = filters.dateRange;
        query = query
          .gte('check_in', startDate.toISOString().split('T')[0])
          .lte('check_out', endDate.toISOString().split('T')[0]);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data: bookings, error } = await query;

      if (error) {
        throw error;
      }

      const convertedBookings: Booking[] = bookings?.map(booking => ({
        id: booking.id,
        guestId: booking.guest_id,
        roomId: booking.room_id,
        checkIn: booking.check_in,
        checkOut: booking.check_out,
        status: booking.status,
        source: booking.source,
        rateApplied: booking.rate_applied,
        createdAt: booking.created_at,
        updatedAt: booking.updated_at,
        guest: booking.guests ? {
          id: booking.guests.id,
          fullName: booking.guests.name,
          email: booking.guests.email,
          phone: booking.guests.phone,
          address: booking.guests.address,
          preferences: booking.guests.preferences,
          loyaltyPoints: booking.guests.loyalty_points,
          loyaltyTier: booking.guests.loyalty_tier,
          gdprConsent: booking.guests.gdpr_consent,
          createdAt: booking.guests.created_at,
          updatedAt: booking.guests.updated_at,
          userId: booking.guests.user_id,
        } : undefined,
        room: booking.rooms ? {
          id: booking.rooms.id,
          roomNumber: booking.rooms.room_number,
          floor: booking.rooms.floor,
          roomTypeId: booking.rooms.room_type_id,
          status: booking.rooms.status,
          features: booking.rooms.features,
          lastCleaned: booking.rooms.last_cleaned,
          createdAt: booking.rooms.created_at,
          updatedAt: booking.rooms.updated_at,
        } : undefined,
      })) || [];

      dispatch({ type: 'SET_BOOKINGS', payload: convertedBookings });
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'bookings', value: false } });
    }
  };

  const createBooking = async (bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data: newBooking, error } = await supabase
        .from('bookings')
        .insert({
          guest_id: bookingData.guestId,
          room_id: bookingData.roomId,
          check_in: bookingData.checkIn,
          check_out: bookingData.checkOut,
          status: bookingData.status || 'Pending',
          source: bookingData.source,
          rate_applied: bookingData.rateApplied,
        })
        .select(`
          *,
          guests(*),
          rooms(*)
        `)
        .single();

      if (error) {
        throw error;
      }

      const convertedBooking: Booking = {
        id: newBooking.id,
        guestId: newBooking.guest_id,
        roomId: newBooking.room_id,
        checkIn: newBooking.check_in,
        checkOut: newBooking.check_out,
        status: newBooking.status,
        source: newBooking.source,
        rateApplied: newBooking.rate_applied,
        createdAt: newBooking.created_at,
        updatedAt: newBooking.updated_at,
        guest: newBooking.guests ? {
          id: newBooking.guests.id,
          fullName: newBooking.guests.name,
          email: newBooking.guests.email,
          phone: newBooking.guests.phone,
          address: newBooking.guests.address,
          preferences: newBooking.guests.preferences,
          loyaltyPoints: newBooking.guests.loyalty_points,
          loyaltyTier: newBooking.guests.loyalty_tier,
          gdprConsent: newBooking.guests.gdpr_consent,
          createdAt: newBooking.guests.created_at,
          updatedAt: newBooking.guests.updated_at,
          userId: newBooking.guests.user_id,
        } : undefined,
        room: newBooking.rooms ? {
          id: newBooking.rooms.id,
          roomNumber: newBooking.rooms.room_number,
          floor: newBooking.rooms.floor,
          roomTypeId: newBooking.rooms.room_type_id,
          status: newBooking.rooms.status,
          features: newBooking.rooms.features,
          lastCleaned: newBooking.rooms.last_cleaned,
          createdAt: newBooking.rooms.created_at,
          updatedAt: newBooking.rooms.updated_at,
        } : undefined,
      };

      dispatch({ type: 'ADD_BOOKING', payload: convertedBooking });
      return convertedBooking;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  };

  const updateBooking = async (bookingId: number, updates: Partial<Booking>) => {
    try {
      const supabaseUpdates: any = {};
      
      if (updates.guestId !== undefined) supabaseUpdates.guest_id = updates.guestId;
      if (updates.roomId !== undefined) supabaseUpdates.room_id = updates.roomId;
      if (updates.checkIn) supabaseUpdates.check_in = updates.checkIn;
      if (updates.checkOut) supabaseUpdates.check_out = updates.checkOut;
      if (updates.status) supabaseUpdates.status = updates.status;
      if (updates.source !== undefined) supabaseUpdates.source = updates.source;
      if (updates.rateApplied !== undefined) supabaseUpdates.rate_applied = updates.rateApplied;
      
      supabaseUpdates.updated_at = new Date().toISOString();

      const { data: updatedBooking, error } = await supabase
        .from('bookings')
        .update(supabaseUpdates)
        .eq('id', bookingId)
        .select(`
          *,
          guests(*),
          rooms(*)
        `)
        .single();

      if (error) {
        throw error;
      }

      const convertedBooking: Booking = {
        id: updatedBooking.id,
        guestId: updatedBooking.guest_id,
        roomId: updatedBooking.room_id,
        checkIn: updatedBooking.check_in,
        checkOut: updatedBooking.check_out,
        status: updatedBooking.status,
        source: updatedBooking.source,
        rateApplied: updatedBooking.rate_applied,
        createdAt: updatedBooking.created_at,
        updatedAt: updatedBooking.updated_at,
        guest: updatedBooking.guests ? {
          id: updatedBooking.guests.id,
          fullName: updatedBooking.guests.name,
          email: updatedBooking.guests.email,
          phone: updatedBooking.guests.phone,
          address: updatedBooking.guests.address,
          preferences: updatedBooking.guests.preferences,
          loyaltyPoints: updatedBooking.guests.loyalty_points,
          loyaltyTier: updatedBooking.guests.loyalty_tier,
          gdprConsent: updatedBooking.guests.gdpr_consent,
          createdAt: updatedBooking.guests.created_at,
          updatedAt: updatedBooking.guests.updated_at,
          userId: updatedBooking.guests.user_id,
        } : undefined,
        room: updatedBooking.rooms ? {
          id: updatedBooking.rooms.id,
          roomNumber: updatedBooking.rooms.room_number,
          floor: updatedBooking.rooms.floor,
          roomTypeId: updatedBooking.rooms.room_type_id,
          status: updatedBooking.rooms.status,
          features: updatedBooking.rooms.features,
          lastCleaned: updatedBooking.rooms.last_cleaned,
          createdAt: updatedBooking.rooms.created_at,
          updatedAt: updatedBooking.rooms.updated_at,
        } : undefined,
      };

      dispatch({ type: 'UPDATE_BOOKING', payload: convertedBooking });
    } catch (error) {
      console.error('Error updating booking:', error);
      throw error;
    }
  };

  const cancelBooking = async (bookingId: number) => {
    await updateBooking(bookingId, { status: 'Cancelled' });
  };

  const checkIn = async (bookingId: number) => {
    await updateBooking(bookingId, { status: 'CheckedIn' });
  };

  const checkOut = async (bookingId: number) => {
    await updateBooking(bookingId, { status: 'CheckedOut' });
  };

  // Utility functions
  const getAvailableRooms = (checkIn: Date, checkOut: Date): Room[] => {
    const checkInStr = checkIn.toISOString().split('T')[0];
    const checkOutStr = checkOut.toISOString().split('T')[0];

    const occupiedRoomIds = state.currentBookings
      .filter(booking => {
        const bookingCheckIn = booking.checkIn instanceof Date ? 
          booking.checkIn.toISOString().split('T')[0] : 
          new Date(booking.checkIn).toISOString().split('T')[0];
        const bookingCheckOut = booking.checkOut instanceof Date ? 
          booking.checkOut.toISOString().split('T')[0] : 
          new Date(booking.checkOut).toISOString().split('T')[0];
        
        return !(checkOutStr <= bookingCheckIn || checkInStr >= bookingCheckOut);
      })
      .map(booking => booking.roomId);

    return state.rooms.filter(room => 
      room.status === 'Available' && !occupiedRoomIds.includes(room.id)
    );
  };

  const getRoomOccupancy = () => {
    const occupancy = { occupied: 0, available: 0, maintenance: 0, dirty: 0 };
    
    state.rooms.forEach(room => {
      switch (room.status) {
        case 'Occupied':
          occupancy.occupied++;
          break;
        case 'Available':
          occupancy.available++;
          break;
        case 'Maintenance':
          occupancy.maintenance++;
          break;
        case 'Dirty':
          occupancy.dirty++;
          break;
      }
    });

    return occupancy;
  };

  const value: HotelContextType = {
    ...state,
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
