'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  AppShell,
  NavLink,
  Text,
  Group,
  Button,
  Avatar,
  Menu,
  UnstyledButton,
  Box,
  Divider,
  ScrollArea,
  Stack,
} from '@mantine/core';
import {
  IconHome,
  IconCalendar,
  IconUser,
  IconBuilding,
  IconCurrencyDollar,
  IconShieldExclamation,
  IconTool,
  IconChartBar,
  IconSettings,
  IconLogout,
  IconUser as IconUserProfile,
  IconChevronDown,
} from '@tabler/icons-react';
import { useAuth } from 'ui';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<any>;
}

const navigationItems: NavItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: IconHome },
  { name: 'Bookings', path: '/bookings', icon: IconCalendar },
  { name: 'Guests', path: '/guests', icon: IconUser },
  { name: 'Rooms', path: '/rooms', icon: IconBuilding },
  { name: 'Billings', path: '/billings', icon: IconCurrencyDollar },
  { name: 'Housekeeping', path: '/housekeeping', icon: IconShieldExclamation },
  { name: 'Maintenance', path: '/maintenance', icon: IconTool },
  { name: 'Reports', path: '/reports', icon: IconChartBar },
  { name: 'Settings', path: '/settings', icon: IconSettings },
];

interface NavbarProps {
  opened: boolean;
}

export function Navbar({ opened }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <Box style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* <Box mb="md">
        <Text size="xl" fw={700} c="blue">
          Hotel Admin
        </Text>
      </Box>

      <Divider my="md" /> */}

      <ScrollArea style={{ flex: 1 }} mb="md">
        <Stack gap="xs">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = pathname === item.path;
            
            return (
              <NavLink
                key={item.name}
                label={item.name}
                leftSection={<IconComponent size={20} />}
                active={isActive}
                onClick={() => handleNavigation(item.path)}
                variant="subtle"
                styles={{
                  root: {
                    borderRadius: 8,
                  },
                  label: {
                    fontWeight: isActive ? 600 : 400,
                  },
                }}
              />
            );
          })}
        </Stack>
      </ScrollArea>

      <Divider my="md" />

      <Box>
        <Menu shadow="md" width={200} position="top-start">
          <Menu.Target>
            <UnstyledButton
              p="sm"
              style={{
                borderRadius: 8,
                width: '100%',
                border: '1px solid var(--mantine-color-gray-3)',
              }}
            >
              <Group>
                <Avatar size="sm" color="blue">
                  {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                </Avatar>
                <Box style={{ flex: 1 }}>
                  <Text size="sm" fw={500}>
                    {user?.fullName || user?.username || 'User'}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {user?.role || 'Staff'}
                  </Text>
                </Box>
                <IconChevronDown size={16} />
              </Group>
            </UnstyledButton>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item leftSection={<IconUserProfile size={16} />}>
              Profile
            </Menu.Item>
            <Menu.Item leftSection={<IconSettings size={16} />}>
              Account Settings
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item 
              leftSection={<IconLogout size={16} />} 
              color="red"
              onClick={handleLogout}
            >
              Logout
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Box>
    </Box>
  );
}
