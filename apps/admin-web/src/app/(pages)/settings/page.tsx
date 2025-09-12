import React from 'react';
import { Container, Title } from '@mantine/core';
import { HotelSettingsForm } from 'ui';

export default function HotelSettingsPage() {
  return (
    <Container size="lg" py="md">
      <Title order={1} mb="lg">Hotel Settings</Title>
      <HotelSettingsForm />
    </Container>
  );
}
