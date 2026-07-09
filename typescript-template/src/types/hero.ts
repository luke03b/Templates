export interface HeroFeature {
  title: string;
  description: string;
}

export interface HeroContent {
  eyebrow: string;
  title: string;
  lead: string;
  primaryAction: string;
  secondaryAction: string;
  features: HeroFeature[];
}
