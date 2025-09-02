import { Suspense } from 'react';
import { OutputPage } from '@/components/output-page';
import { LoadingPage } from '@/components/shared/loading-page';

export default function ResultsPage() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <OutputPage />
    </Suspense>
  );
}
