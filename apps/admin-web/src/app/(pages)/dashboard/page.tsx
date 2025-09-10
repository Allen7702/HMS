import { Button, Text } from "@mantine/core";
import React from "react";

export default function DashboardPage() {
    return (
        <div style={{ padding: "2rem" }}>
            <Text ta="center" size="xl" fw={500} mb="md">Dashboard</Text>
            <Button variant="filled" color="blue" size="md">A Mantine Button</Button>
            <Button variant="outline" color="red" size="md" ml="md">Outline Button</Button>
        </div>
    );
}