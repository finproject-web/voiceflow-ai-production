// Simple auth helpers for client-side usage
export async function getAuthenticatedUser() {
  // This will be handled client-side with Supabase client
  return null
}

export async function validateOrganizationAccess(organizationId: string) {
  return false
}

export async function isAuthenticated() {
  return false
}
