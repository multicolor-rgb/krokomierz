import { isNative } from './nativeSteps';

export const APP_VERSION = '1.1.2';
export const APP_VERSION_CODE = 4;
export const LANDING_URL = 'https://krokomierz.multidev.top';
export const APK_URL =
  'https://github.com/multicolor-rgb/krokomierz/releases/latest/download/krokomierz-latest.apk';

const webVersionUrl =
  typeof window !== 'undefined'
    ? new URL('../download/version.json', window.location.href).toString()
    : 'https://krokomierz.multidev.top/download/version.json';

export const VERSION_URL = isNative
  ? 'https://krokomierz.multidev.top/download/version.json'
  : webVersionUrl;
