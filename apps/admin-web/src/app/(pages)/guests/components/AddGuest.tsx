'use client';

import React from 'react';
import { GuestForm, type GuestFormData } from './GuestForm';

interface AddGuestProps {
    onSubmit: (data: GuestFormData) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

export function AddGuest({ onSubmit, onCancel, isLoading = false }: AddGuestProps) {
    return (
        <GuestForm
            onSubmit={onSubmit}
            onCancel={onCancel}
            isLoading={isLoading}
            submitButtonText="Add Guest"
            isEdit={false}
        />
    );
}