import React from 'react';
import AppLayout from '@/components/AppLayout';
import AssessmentPageClient from './components/AssessmentPageClient';

export default function AIAssessmentPage() {
  return (
    <AppLayout
      pageTitle="AI Assessment"
      pageSubtitle="Adaptive Competency Evaluation — Statistical Officer"
    >
      <AssessmentPageClient />
    </AppLayout>
  );
}