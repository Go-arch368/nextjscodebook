import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing'; // ✅ Corrected import path

export default createMiddleware(routing);

export const config = {
  // This ensures middleware runs on all paths that may include a locale
  matcher: ['/', '/(en|ta|hi|ka)/:path*']
};
