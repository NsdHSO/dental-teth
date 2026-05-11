/**
 * Re-export biometric authentication from @dental/auth package
 * This maintains backwards compatibility with old @/lib/biometricAuth imports
 */
export {
  isBiometricAvailable,
  authenticateWithBiometrics,
  saveBiometricPreference,
  getBiometricPreference,
  saveBiometricEmail,
  getBiometricEmail,
  clearBiometricEmail,
  clearBiometricData,
  __setServiceForTesting,
  __resetServiceForTesting,
} from '@dental/auth';
