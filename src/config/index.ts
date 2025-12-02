export const config = {
  api: {
    baseUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080',
    wsUrl: process.env.EXPO_PUBLIC_WS_URL || 'http://localhost:8080/ws',
  },
  storage: {
    accessTokenKey: 'accessToken',
    refreshTokenKey: 'refreshToken',
    userKey: 'user',
  },
};
