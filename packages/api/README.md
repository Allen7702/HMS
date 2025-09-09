# API Package

This package provides the core API layer for the hotel management system, including database operations, authentication, and file storage utilities.

## Features

- **Enhanced CRUD Operations**: Generic database operations with Zod validation
- **Auto-Generated Schemas**: Zod schemas automatically generated from Drizzle tables
- **Error Handling**: Comprehensive error handling with custom error types
- **Authentication**: User authentication and session management
- **File Storage**: File upload/download utilities
- **Type Safety**: Full TypeScript support with runtime validation

## Auto-Generated Schemas

This package automatically generates Zod validation schemas from your Drizzle database schema using `drizzle-zod`. This eliminates duplication and ensures your validation schemas are always in sync with your database schema.

Available schemas for each table:
- `[table]SelectSchema`: For validating data retrieved from the database
- `[table]InsertSchema`: For validating data before insertion (includes custom validation rules)
- `[table]UpdateSchema`: For validating data before updates (partial schema, excludes id and timestamps)

Example:
```typescript
import { 
  userSelectSchema, 
  userInsertSchema, 
  userUpdateSchema,
  guestSelectSchema,
  bookingSelectSchema 
} from 'api';

// These schemas are automatically generated from your Drizzle tables
// and include additional validation rules like email format, minimum lengths, etc.
```

## Usage

### Basic CRUD Operations

```typescript
import { SupabaseAPI, userSelectSchema, userInsertSchema, userUpdateSchema } from 'api';

// Get all users with validation
const users = await SupabaseAPI.get('users', {
  schema: userSelectSchema,
  limit: 10,
  orderBy: { column: 'created_at', ascending: false }
});

// Get user by ID
const user = await SupabaseAPI.getById('users', 1, {
  schema: userSelectSchema
});

// Create new user with input validation
const newUser = await SupabaseAPI.create('users', {
  fullName: 'John Doe',
  username: 'john_doe',
  email: 'john@example.com',
  password: 'securepassword123',
  role: 'staff'
}, {
  schema: userSelectSchema,
  validateInput: userInsertSchema
});

// Update user
const updatedUser = await SupabaseAPI.update('users', 1, {
  fullName: 'John Smith'
}, {
  schema: userSelectSchema,
  validateInput: userUpdateSchema
});

// Delete user
await SupabaseAPI.delete('users', 1);

// Search users
const searchResults = await SupabaseAPI.search('users', 
  ['full_name', 'email'], 
  'john',
  { schema: userSelectSchema, limit: 5 }
);
```

### Authentication

```typescript
import { SupabaseAuth } from 'api';

// Sign in
const { user, session } = await SupabaseAuth.signIn('user@example.com', 'password');

// Get current user
const user = await SupabaseAuth.getCurrentUser();

// Get current session
const session = await SupabaseAuth.getCurrentSession();

// Refresh session
const refreshedSession = await SupabaseAuth.refreshSession();

// Sign out
await SupabaseAuth.signOut();
```

### File Storage

```typescript
import { SupabaseStorage } from 'api';

// Upload file
const uploadResult = await SupabaseStorage.uploadFile(
  'avatars', 
  'user-1/avatar.jpg', 
  file
);

// Download file
const fileBlob = await SupabaseStorage.downloadFile('avatars', 'user-1/avatar.jpg');

// Get public URL
const publicUrl = SupabaseStorage.getPublicUrl('avatars', 'user-1/avatar.jpg');
```

### Error Handling

```typescript
import { SupabaseError, ValidationError } from 'api';

try {
  const users = await SupabaseAPI.get('users', { schema: userSchema });
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Validation failed:', error.validationErrors.issues);
  } else if (error instanceof SupabaseError) {
    console.error('Database error:', error.originalError);
  }
}
```

## Environment Variables

Make sure to set these environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

For local development, the package defaults to:
- URL: `http://127.0.0.1:54321`
- Anon Key: Local Supabase development key

## Building

```bash
pnpm build
```

## Dependencies

- `@supabase/supabase-js`: Supabase client library
- `zod`: Runtime type validation
- `typescript`: TypeScript support
