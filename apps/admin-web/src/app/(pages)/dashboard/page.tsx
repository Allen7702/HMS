import { Button, Text, Title, Card, SimpleGrid, Group } from "@mantine/core";
import React from "react";

export default function DashboardPage() {
    return (
        <div>
            <Title order={1} mb="lg">Dashboard</Title>
            
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md" mb="xl">
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Text size="sm" c="dimmed">Total Bookings</Text>
                    <Text size="xl" fw={500}>24</Text>
                </Card>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Text size="sm" c="dimmed">Occupied Rooms</Text>
                    <Text size="xl" fw={500}>12</Text>
                </Card>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Text size="sm" c="dimmed">Available Rooms</Text>
                    <Text size="xl" fw={500}>6</Text>
                </Card>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Text size="sm" c="dimmed">Total Revenue</Text>
                    <Text size="xl" fw={500}>$12,450</Text>
                </Card>
            </SimpleGrid>

            <Group gap="md">
                <Button variant="filled" color="blue" size="md">
                    New Booking
                </Button>
                <Button variant="outline" color="green" size="md">
                    Check In Guest
                </Button>
                <Button variant="outline" color="orange" size="md">
                    Generate Report
                </Button>
            </Group>
        </div>
    );
}