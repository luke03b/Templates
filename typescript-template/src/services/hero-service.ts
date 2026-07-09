import type { HeroContent } from '../types/hero';

export function getHeroContent(): HeroContent {
  return {
    eyebrow: 'TypeScript starter',
    title: 'Build a modular experience with clear contracts.',
    lead:
      'A typed base with isolated services, explicit contracts and a landing page ready for extension.',
    primaryAction: 'Get started',
    secondaryAction: 'View docs',
    features: [
      {
        title: 'Typed contracts',
        description: 'Keep request and response data explicit from the start.',
      },
      {
        title: 'Small modules',
        description: 'Separate app composition, services and pages into focused files.',
      },
      {
        title: 'Easy to extend',
        description: 'Add networking, routing or state without changing the base shape.',
      },
    ],
  };
}
