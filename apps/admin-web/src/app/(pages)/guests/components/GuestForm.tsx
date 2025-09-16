'use client';

import React from 'react';
import {
    Stack,
    Button,
    TextInput,
    Select,
    SimpleGrid,
    Textarea,
    Group,
    Input,
} from "@mantine/core";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

//TODO: unified schema
export const guestFormSchema = z.object({
    title: z.string().min(1, "Title is required"),
    name: z.string().min(2, "Name must be at least 2 characters long"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    nationality: z.string().min(1, "Nationality is required"),
    idNumber: z.string().min(1, "ID/Passport number is required"),
    address: z.string().optional(),
    specialRequests: z.string().optional(),
});

export type GuestFormData = z.infer<typeof guestFormSchema>;

interface GuestFormProps {
    onSubmit: (data: GuestFormData) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
    defaultValues?: Partial<GuestFormData>;
    submitButtonText?: string;
    isEdit?: boolean;
}

//TODO: shared constants
export const titleOptions = ["Mr", "Mrs", "Ms", "Dr", "Prof"];
export const nationalityOptions = [
    "Tanzania", "Kenya", "Uganda", "Rwanda", "Burundi",
    "South Africa", "Nigeria", "Ghana", "Ethiopia", "Morocco",
    "Egypt", "Algeria", "Tunisia", "Libya", "Sudan", "Other"
];

export function GuestForm({
    onSubmit,
    onCancel,
    isLoading = false,
    defaultValues = {},
    submitButtonText = "Add Guest",
    isEdit = false
}: GuestFormProps) {
    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<GuestFormData>({
        resolver: zodResolver(guestFormSchema),
        defaultValues: {
            title: 'Mr',
            name: '',
            email: '',
            phone: '',
            nationality: 'Tanzania',
            idNumber: '',
            address: '',
            specialRequests: '',
            ...defaultValues,
        },
    });

    const handleFormSubmit = async (data: GuestFormData) => {
        try {
            await onSubmit(data);
            if (!isEdit) {
                reset();
            }
        } catch (error) {
            console.error('Form submission error:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)}>
            <Stack gap="lg">
                <Stack gap="md">
                    <Input.Wrapper
                        label="Full Name"
                        required
                        error={errors.title?.message || errors.name?.message}
                    >
                        <Group gap={0} wrap="nowrap">
                            <Controller
                                name="title"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        aria-label="Title"
                                        data={titleOptions}
                                        style={{ width: '84px' }}
                                        styles={{
                                            input: {
                                                borderTopRightRadius: 0,
                                                borderBottomRightRadius: 0,
                                                borderRightWidth: 0.5,
                                            },
                                        }}
                                    />
                                )}
                            />
                            <Controller
                                name="name"
                                control={control}
                                render={({ field }) => (
                                    <TextInput
                                        {...field}
                                        aria-label="Full Name"
                                        placeholder="Enter guest's full name"
                                        style={{ flex: 1 }}
                                        styles={{
                                            input: {
                                                borderTopLeftRadius: 0,
                                                borderBottomLeftRadius: 0,
                                            },
                                        }}
                                    />
                                )}
                            />
                        </Group>
                    </Input.Wrapper>

                    <SimpleGrid cols={2}>
                        <Controller
                            name="phone"
                            control={control}
                            render={({ field }) => (
                                <TextInput
                                    {...field}
                                    label="Phone Number"
                                    placeholder="+255 XXX XXX XXX"
                                    error={errors.phone?.message}
                                    required
                                />
                            )}
                        />
                        <Controller
                            name="email"
                            control={control}
                            render={({ field }) => (
                                <TextInput
                                    {...field}
                                    label="Email Address"
                                    placeholder="guest@example.com"
                                    error={errors.email?.message}
                                    required
                                />
                            )}
                        />
                    </SimpleGrid>

                    <SimpleGrid cols={2}>
                        <Controller
                            name="nationality"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    label="Nationality"
                                    placeholder="Select nationality"
                                    data={nationalityOptions}
                                    error={errors.nationality?.message}
                                    searchable
                                    required
                                />
                            )}
                        />
                        <Controller
                            name="idNumber"
                            control={control}
                            render={({ field }) => (
                                <TextInput
                                    {...field}
                                    label="ID/Passport Number"
                                    placeholder="Enter ID or passport number"
                                    error={errors.idNumber?.message}
                                    required
                                />
                            )}
                        />
                    </SimpleGrid>

                    <Controller
                        name="address"
                        control={control}
                        render={({ field }) => (
                            <TextInput
                                {...field}
                                label="Address (Optional)"
                                placeholder="Enter guest's address"
                                error={errors.address?.message}
                            />
                        )}
                    />

                    <Controller
                        name="specialRequests"
                        control={control}
                        render={({ field }) => (
                            <Textarea
                                {...field}
                                label="Special Requests (Optional)"
                                placeholder="Any special requests or notes..."
                                error={errors.specialRequests?.message}
                                rows={3}
                            />
                        )}
                    />
                </Stack>

                <Group justify="flex-end" gap="sm" pt="md">
                    <Button
                        variant="light"
                        onClick={() => {
                            onCancel();
                            if (!isEdit) {
                                reset();
                            }
                        }}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        loading={isLoading}
                    >
                        {submitButtonText}
                    </Button>
                </Group>
            </Stack>
        </form>
    );
}
