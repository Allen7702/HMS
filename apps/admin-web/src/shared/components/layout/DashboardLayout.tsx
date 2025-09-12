'use client';

import React, { useState } from 'react';
import { AppShell, Burger, Group, Text, Box, useMantineColorScheme } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Navbar } from '../navbar/Navbar';
import { AppThemeIcon } from 'ui';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const [opened, { toggle }] = useDisclosure();

    return (
        <div className=' text-black dark:text-white bg-gray-50 dark:bg-gray-900'>
            <AppShell
                navbar={{
                    width: 250,
                    breakpoint: 'sm',
                    collapsed: { mobile: !opened },
                }}
                style={{}}
                header={{ height: 60 }}
                padding="md"
            >

                <AppShell.Header>
                    <Group h="100%" px="md">
                        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
                        <Text
                            size="lg"
                            fw={500}
                        >
                            Hotel Management System
                        </Text>
                        <AppThemeIcon/>
                    </Group>
                </AppShell.Header>

                <AppShell.Navbar p="md">
                    <Navbar opened={true} />
                </AppShell.Navbar>

                <AppShell.Main>
                    <Box p="md">
                        {children}
                    </Box>
                </AppShell.Main>
            </AppShell>
        </div>

    );
}
