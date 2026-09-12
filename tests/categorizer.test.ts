import { describe, it, expect } from 'vitest';
import { Categorizer } from '../src/core/categorizer.js';

describe('Categorizer', () => {
  it('should categorize agent orchestration skills correctly', () => {
    const cat = Categorizer.categorize(
      'continuous-agent-loop',
      'Continuous Agent Loop',
      'Patterns for autonomous agent loops with quality gates and self-evaluation.'
    );
    expect(cat.id).toBe('agent-ops');
  });

  it('should categorize frontend skills correctly', () => {
    const cat = Categorizer.categorize(
      'react-patterns',
      'React Patterns',
      'Modern React 19 component patterns, hooks discipline, and Tailwind styling.'
    );
    expect(cat.id).toBe('frontend-design');
  });

  it('should categorize security skills correctly', () => {
    const cat = Categorizer.categorize(
      'hipaa-compliance',
      'HIPAA Compliance',
      'Health data privacy audit, PHI protection, and authorization checklists.'
    );
    expect(cat.id).toBe('security-compliance');
  });

  it('should categorize testing skills correctly', () => {
    const cat = Categorizer.categorize(
      'playwright-e2e',
      'Playwright E2E Testing',
      'Automated end-to-end browser tests, POM patterns, and regression suites.'
    );
    expect(cat.id).toBe('testing-qa');
  });

  it('should extract relevant tags from skill content', () => {
    const tags = Categorizer.extractTags(
      'fastapi-review',
      'Review FastAPI backend routes and Pydantic schemas',
      'Use pytest for test coverage with postgres database migrations and docker'
    );
    expect(tags).toContain('fastapi');
    expect(tags).toContain('postgres');
    expect(tags).toContain('docker');
    expect(tags).toContain('pytest');
  });
});
