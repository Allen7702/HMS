'use client';

import React from 'react';
import { Drawer, Text } from '@mantine/core';

interface SideDrawerProps {
  opened: boolean;
  onClose: () => void;
  title?: string;
  size?: string | number;
  children: React.ReactNode;
}

export function SideDrawer({ 
  opened, 
  onClose, 
  title, 
  size = 600, 
  children 
}: SideDrawerProps) {
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={
        title ? (
          <Text size="lg" fw={600}>
            {title}
          </Text>
        ) : undefined
      }
      position="right"
      size={size}
      radius="md"
      overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}
      transitionProps={{
        transition: 'slide-left',
        duration: 200,
        timingFunction: 'ease',
      }}
    >
      {children}
    </Drawer>
  );
}
