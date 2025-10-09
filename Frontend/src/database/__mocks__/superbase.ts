export const supabase = {
  auth: {
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    signInWithOAuth: jest.fn(),
    signOut: jest.fn(),
    getSession: jest.fn(() => Promise.resolve({ data: { session: null } })),
  },
  from: jest.fn(() => ({
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  })),
};
