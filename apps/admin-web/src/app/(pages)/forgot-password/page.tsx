'use client';

import { useRouter } from 'next/navigation';
import { Container, Paper, Title, Text, Button } from '@mantine/core';

export default function ForgotPassword() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <Container size={420}>
        <Title ta="center" mb="md">
          Forgot Password
        </Title>
        <Text c="dimmed" size="sm" ta="center" mb="xl">
          Password reset functionality coming soon
        </Text>

        <Paper withBorder shadow="md" p={30} radius="md">
          <Text ta="center" mb="lg">
            This feature is under development. Please contact your system administrator for password reset assistance.
          </Text>
          
          <Button 
            fullWidth 
            variant="outline"
            onClick={() => router.push('/login')}
          >
            Back to Login
          </Button>
        </Paper>
      </Container>
    </div>
  );
}
