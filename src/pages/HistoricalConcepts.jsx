import React from 'react';
import PageHero from '@/components/PageHero';
import SectionCanvas from '@/components/SectionCanvas';

export default function HistoricalConcepts() {
  return (
    <div>
      <PageHero
        page="historical_concepts"
        eyebrow="Thinking like a historian"
        title="Historical Concepts"
        lede="The tools historians use to think — change, continuity, causation, consequence, significance, and perspectives."
      />
      <SectionCanvas page="historical_concepts" />
    </div>
  );
}