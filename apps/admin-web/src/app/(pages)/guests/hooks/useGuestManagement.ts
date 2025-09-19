import { useState, useEffect, useCallback } from 'react';
import { useHotel, showSuccessNotification, showErrorNotification } from 'ui';
import type { Guest } from 'db';
import { type GuestFormData } from '../components/GuestForm';
import { categorizeGuests, filterGuestsByStatus } from '../utils/guestUtils';
import { DEFAULT_PAGE_SIZE, SEARCH_DEBOUNCE_DELAY } from '../constants';

export function useGuestManagement() {
    const {
        guests,
        fetchGuests,
        createGuest,
        updateGuest,
        deleteGuest,
        searchGuests,
        guestPagination,
        bookings,
        fetchBookings,
        isLoading
    } = useHotel();

    const [searchValue, setSearchValue] = useState("");
    const [filterStatus, setFilterStatus] = useState<string | null>("all");
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editDrawerOpen, setEditDrawerOpen] = useState(false);
    const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
    const [bookingHistoryDrawerOpen, setBookingHistoryDrawerOpen] = useState(false);
    const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
    const [viewingGuest, setViewingGuest] = useState<Guest | null>(null);
    const [bookingHistoryGuest, setBookingHistoryGuest] = useState<Guest | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const [currentGuests, setCurrentGuests] = useState<any[]>([]);
    const [arrivingGuests, setArrivingGuests] = useState<any[]>([]);
    const [departingGuests, setDepartingGuests] = useState<any[]>([]);

    useEffect(() => {
        if (!searchValue.trim()) {
            fetchGuests(currentPage, DEFAULT_PAGE_SIZE);
        }
    }, [currentPage]);

    useEffect(() => {
        const loadBookingsAndCategorizeGuests = async () => {
            try {
                await fetchBookings();
            } catch (error) {
                console.error('Failed to fetch bookings:', error);
                setCurrentGuests([]);
                setArrivingGuests([]);
                setDepartingGuests([]);
            }
        };

        loadBookingsAndCategorizeGuests();
    }, []);

    // Categorize guests based on bookings when bookings or guests change
    useEffect(() => {
        const categorized = categorizeGuests(guests, bookings);
        setCurrentGuests(categorized.currentGuests);
        setArrivingGuests(categorized.arrivingGuests);
        setDepartingGuests(categorized.departingGuests);
    }, [bookings, guests]);

    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (searchValue.trim()) {
                try {
                    setIsSearching(true);
                    setCurrentPage(1);
                    console.log('Starting search for:', searchValue);
                    const results = await searchGuests(searchValue);
                    console.log('Search completed. Results:', results);
                    setSearchResults(results);

                    if (results.length === 0) {
                        console.log('No search results found, but no error occurred');
                    }
                } catch (error) {
                    console.error('Search failed with error:', error);
                    const filteredGuests = guests.filter(guest =>
                        guest.fullName?.toLowerCase().includes(searchValue.toLowerCase()) ||
                        guest.email?.toLowerCase().includes(searchValue.toLowerCase()) ||
                        guest.phone?.toLowerCase().includes(searchValue.toLowerCase())
                    );
                    console.log('Falling back to client-side search. Filtered results:', filteredGuests);
                    setSearchResults(filteredGuests);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
                setIsSearching(false);
                fetchGuests(currentPage, DEFAULT_PAGE_SIZE);
            }
        }, SEARCH_DEBOUNCE_DELAY);

        return () => clearTimeout(timeoutId);
    }, [searchValue]);

    // Handlers
    //TODO: unified guest data creation and updating
    const handleNewGuest = async (data: GuestFormData) => {
        try {
            const guestData = {
                fullName: `${data.title} ${data.name}`,
                email: data.email,
                phone: data.phone,
                nationality: data.nationality,
                idNumber: data.idNumber,
                address: data.address || `${data.nationality} - ${data.idNumber}`,
                preferences: {
                    nationality: data.nationality,
                    idNumber: data.idNumber,
                    specialRequests: data.specialRequests || "",
                },
                loyaltyPoints: 0,
                loyaltyTier: "None" as const,
                gdprConsent: true,
                userId: null,
            };

            await createGuest(guestData);

            showSuccessNotification({
                title: "Success",
                message: "Guest added successfully!"
            });
            setDrawerOpen(false);
            fetchGuests(currentPage, DEFAULT_PAGE_SIZE);
        } catch (error) {
            showErrorNotification({
                title: "Error",
                message: "Failed to add guest"
            });
            throw error;
        }
    };

    const handleEditGuest = async (data: GuestFormData) => {
        if (!editingGuest) return;

        try {
            const guestData = {
                fullName: `${data.title} ${data.name}`,
                email: data.email,
                phone: data.phone,
                nationality: data.nationality,
                idNumber: data.idNumber,
                address: data.address || `${data.nationality} - ${data.idNumber}`,
                preferences: {
                    nationality: data.nationality,
                    idNumber: data.idNumber,
                    specialRequests: data.specialRequests || "",
                },
            };

            await updateGuest(editingGuest.id, guestData);

            showSuccessNotification({
                title: "Success",
                message: "Guest updated successfully!"
            });
            setEditDrawerOpen(false);
            setEditingGuest(null);
            fetchGuests(currentPage, DEFAULT_PAGE_SIZE);
        } catch (error) {
            showErrorNotification({
                title: "Error",
                message: "Failed to update guest"
            });
            throw error;
        }
    };

    const handleEditClick = (guest: Guest) => {
        setEditingGuest(guest);
        setEditDrawerOpen(true);
    };

    const handleViewProfile = (guest: Guest) => {
        setViewingGuest(guest);
        setProfileDrawerOpen(true);
    };

    const handleViewBookingHistory = (guest: Guest) => {
        setBookingHistoryGuest(guest);
        setBookingHistoryDrawerOpen(true);
    };

    const handleEditFromProfile = () => {
        if (viewingGuest) {
            setEditingGuest(viewingGuest);
            setProfileDrawerOpen(false);
            setEditDrawerOpen(true);
        }
    };

    const handleDelete = async (guestId: number) => {
        try {
            await deleteGuest(guestId);
            showSuccessNotification({
                title: "Success",
                message: "Guest deleted successfully"
            });
            fetchGuests(currentPage, DEFAULT_PAGE_SIZE);
        } catch (error) {
            showErrorNotification({
                title: "Error",
                message: "Failed to delete guest"
            });
        }
    };

    const handleSearch = (query: string) => {
        setSearchValue(query);
    };

    const getDisplayGuests = useCallback(() => {
        let displayGuests = searchValue.trim() ? searchResults : guests;
        return filterGuestsByStatus(displayGuests, filterStatus, bookings);
    }, [searchValue, searchResults, guests, filterStatus, bookings]);

    return {
        // State
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
        searchResults,
        isSearching,
        currentGuests,
        arrivingGuests,
        departingGuests,

        // Setters
        setSearchValue,
        setFilterStatus,
        setDrawerOpen,
        setEditDrawerOpen,
        setProfileDrawerOpen,
        setBookingHistoryDrawerOpen,
        setEditingGuest,
        setViewingGuest,
        setBookingHistoryGuest,
        setCurrentPage,

        // Handlers
        handleNewGuest,
        handleEditGuest,
        handleEditClick,
        handleViewProfile,
        handleViewBookingHistory,
        handleEditFromProfile,
        handleDelete,
        handleSearch,

        // Data
        guests,
        bookings,
        isLoading,
        guestPagination,
        displayGuests: getDisplayGuests(),

        // Utils
        fetchGuests,
        fetchBookings,
    };
}
