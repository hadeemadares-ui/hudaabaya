export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import React from 'react';
import HomePageClient from './HomePageClient';

export default function HomePage() {
  return <HomePageClient />;
}
