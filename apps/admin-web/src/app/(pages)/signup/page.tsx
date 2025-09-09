'use client';

import { useRouter } from 'next/navigation';
import { Container, Paper, Title, Text, Button } from '@mantine/core';

export default function SignUp() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <Container size={420}>
        <Title ta="center" mb="md">
          Create Account
        </Title>
        <Text c="dimmed" size="sm" ta="center" mb="xl">
          User registration functionality coming soon
        </Text>

        <Paper withBorder shadow="md" p={30} radius="md">
          <Text ta="center" mb="lg">
            New user registration is currently handled by administrators. Please contact your system administrator to create a new account.
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
