export function checkAuth(request: Request) {
  if (process.env.SKIP_AUTH === 'true') {
    return { user: { id: 'test-user', email: 'test@example.com' } }
  }
  // Normal auth check would go here
  return null
}