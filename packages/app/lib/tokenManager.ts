/**
 * Re-export token management from @dental/auth package
 * This maintains backwards compatibility with old @/lib/tokenManager imports
 */
export {
  setTokensFromLogin,
  clearTokens,
  getAccessTokenSync,
  getValidAccessToken,
  refreshAccessToken,
  __setManagerForTesting,
  __resetManagerForTesting,
} from '@dental/auth';
