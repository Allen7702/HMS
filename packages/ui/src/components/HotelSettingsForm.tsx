'use client';
import React, { useState } from 'react';
import { 
  Paper, 
  Title, 
  TextInput, 
  Textarea,
  NumberInput,
  Switch,
  Button,
  Grid,
  Group,
  Stack,
  Divider,
  Select,
  LoadingOverlay
} from '@mantine/core';
import { useApp } from '../contexts/AppContext';
import { notifications } from '@mantine/notifications';

const timezones = [
  { value: 'Africa/Dar_es_Salaam', label: 'Africa/Dar_es_Salaam (EAT - East African Time)' },
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'America/New_York (EST/EDT)' },
  { value: 'America/Chicago', label: 'America/Chicago (CST/CDT)' },
  { value: 'America/Denver', label: 'America/Denver (MST/MDT)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST/PDT)' },
  { value: 'Europe/London', label: 'Europe/London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (CET/CEST)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)' },
];

const currencies = [
  { value: 'TZS', label: 'TZS - Tanzanian Shilling' },
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'JPY', label: 'JPY - Japanese Yen' },
  { value: 'CAD', label: 'CAD - Canadian Dollar' },
  { value: 'AUD', label: 'AUD - Australian Dollar' },
];

export function HotelSettingsForm() {
  const { hotel, updateHotelSettings, createHotelSettings, isLoading } = useApp();
  const [formData, setFormData] = useState(() => {
    if (hotel) {
      return {
        name: hotel.name,
        address: hotel.address,
        phone: hotel.phone || '',
        email: hotel.email || '',
        website: hotel.website || '',
        description: hotel.description || '',
        settings: { ...hotel.settings }
      };
    }
    return {
      name: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      description: '',
      settings: {
        currency: 'TZS',
        timezone: 'Africa/Dar_es_Salaam',
        checkInTime: '15:00',
        checkOutTime: '11:00',
        maxAdvanceBookingDays: 365,
        cancellationPolicy: '24 hours before check-in for full refund',
        taxRate: 10,
        serviceChargeRate: 5,
        allowOnlineBooking: true,
        autoConfirmBookings: false,
        requireDeposit: true,
        depositPercentage: 50,
      }
    };
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (hotel) {
        // Update existing hotel
        await updateHotelSettings(formData);
        notifications.show({
          title: 'Success',
          message: 'Hotel settings updated successfully',
          color: 'green',
        });
      } else {
        // Create new hotel
        await createHotelSettings({ ...formData, isActive: true });
        notifications.show({
          title: 'Success',
          message: 'Hotel settings created successfully',
          color: 'green',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to save hotel settings',
        color: 'red',
      });
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateSetting = (setting: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [setting]: value
      }
    }));
  };

  if (isLoading) {
    return (
      <Paper p="md" style={{ position: 'relative', minHeight: 200 }}>
        <LoadingOverlay visible={true} />
      </Paper>
    );
  }

  return (
    <Paper p="lg" shadow="sm">
      <form onSubmit={handleSubmit}>
        <Title order={2} mb="lg">
          {hotel ? 'Hotel Settings' : 'Setup Hotel Settings'}
        </Title>

        <Stack gap="md">
          {/* Basic Hotel Information */}
          <Title order={3} size="h4">Basic Information</Title>
          
          <Grid>
            <Grid.Col span={6}>
              <TextInput
                label="Hotel Name"
                placeholder="Hotel Sunshine"
                required
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="Email"
                placeholder="info@hotelsunshine.com"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <Textarea
                label="Address"
                placeholder="123 Paradise Beach Avenue, Miami, FL"
                required
                value={formData.address}
                onChange={(e) => updateField('address', e.target.value)}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="Phone"
                placeholder="+1 (305) 555-0123"
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="Website"
                placeholder="https://www.hotelsunshine.com"
                value={formData.website}
                onChange={(e) => updateField('website', e.target.value)}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <Textarea
                label="Description"
                placeholder="A luxury beachfront hotel..."
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
              />
            </Grid.Col>
          </Grid>

          <Divider my="md" />

          {/* Hotel Settings */}
          <Title order={3} size="h4">Hotel Settings</Title>
          
          <Grid>
            <Grid.Col span={6}>
              <Select
                label="Currency"
                placeholder="Select currency"
                data={currencies}
                value={formData.settings.currency}
                onChange={(value) => updateSetting('currency', value)}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Select
                label="Timezone"
                placeholder="Select timezone"
                data={timezones}
                value={formData.settings.timezone}
                onChange={(value) => updateSetting('timezone', value)}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="Check-in Time"
                placeholder="15:00"
                value={formData.settings.checkInTime}
                onChange={(e) => updateSetting('checkInTime', e.target.value)}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="Check-out Time"
                placeholder="11:00"
                value={formData.settings.checkOutTime}
                onChange={(e) => updateSetting('checkOutTime', e.target.value)}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <NumberInput
                label="Max Advance Booking (days)"
                placeholder="365"
                min={1}
                value={formData.settings.maxAdvanceBookingDays}
                onChange={(value) => updateSetting('maxAdvanceBookingDays', value)}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <NumberInput
                label="Tax Rate (%)"
                placeholder="10"
                min={0}
                max={100}
                decimalScale={2}
                value={formData.settings.taxRate}
                onChange={(value) => updateSetting('taxRate', value)}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <NumberInput
                label="Service Charge Rate (%)"
                placeholder="5"
                min={0}
                max={100}
                decimalScale={2}
                value={formData.settings.serviceChargeRate}
                onChange={(value) => updateSetting('serviceChargeRate', value)}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <NumberInput
                label="Deposit Percentage (%)"
                placeholder="50"
                min={0}
                max={100}
                value={formData.settings.depositPercentage}
                onChange={(value) => updateSetting('depositPercentage', value)}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <Textarea
                label="Cancellation Policy"
                placeholder="24 hours before check-in for full refund"
                value={formData.settings.cancellationPolicy}
                onChange={(e) => updateSetting('cancellationPolicy', e.target.value)}
              />
            </Grid.Col>
          </Grid>

          <Divider my="md" />

          {/* Booking Settings */}
          <Title order={3} size="h4">Booking Settings</Title>
          
          <Stack gap="sm">
            <Switch
              label="Allow Online Booking"
              description="Enable guests to book directly through your website"
              checked={formData.settings.allowOnlineBooking}
              onChange={(e) => updateSetting('allowOnlineBooking', e.currentTarget.checked)}
            />
            <Switch
              label="Auto-Confirm Bookings"
              description="Automatically confirm bookings without manual review"
              checked={formData.settings.autoConfirmBookings}
              onChange={(e) => updateSetting('autoConfirmBookings', e.currentTarget.checked)}
            />
            <Switch
              label="Require Deposit"
              description="Require guests to pay a deposit when booking"
              checked={formData.settings.requireDeposit}
              onChange={(e) => updateSetting('requireDeposit', e.currentTarget.checked)}
            />
          </Stack>

          <Group justify="flex-end" mt="lg">
            <Button 
              type="submit" 
              loading={saving}
              size="md"
            >
              {hotel ? 'Update Settings' : 'Create Hotel Settings'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
}
