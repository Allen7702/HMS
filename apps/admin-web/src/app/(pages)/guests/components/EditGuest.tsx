'use client';

import React from 'react';
import { GuestForm, type GuestFormData, titleOptions, nationalityOptions } from './GuestForm';
import type { Guest } from "db";

interface EditGuestProps {
    guest: Guest;
    onSubmit: (data: GuestFormData) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

export type EditGuestData = GuestFormData;

export function EditGuest({ guest, onSubmit, onCancel, isLoading = false }: EditGuestProps) {
    const parseGuestName = (fullName: string) => {
        const parts = fullName.trim().split(' ');
        if (parts.length >= 2) {
            const firstPart = parts[0];
            const restOfName = parts.slice(1).join(' ');

            const isTitle = titleOptions.includes(firstPart);
            if (isTitle) {
                return {
                    title: firstPart,
                    name: restOfName
                };
            } else {
                return {
                    title: 'Mr',
                    name: fullName
                };
            }
        }
        return {
            title: 'Mr',
            name: fullName
        };
    };

    const parsedName = parseGuestName(guest.fullName || '');
    const preferences = guest.preferences as any || {};

    const defaultValues: Partial<GuestFormData> = {
        title: parsedName.title,
        name: parsedName.name,
        email: guest.email || '',
        phone: guest.phone || '',
        nationality: preferences.nationality || 'Tanzania',
        idNumber: preferences.idNumber || '',
        address: guest.address || '',
        specialRequests: preferences.specialRequests || '',
    };

    return (
        <GuestForm
            onSubmit={onSubmit}
            onCancel={onCancel}
            isLoading={isLoading}
            defaultValues={defaultValues}
            submitButtonText="Update Guest"
            isEdit={true}
        />
    );
}
