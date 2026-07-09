import 'package:flutter/material.dart';

class LandingPage extends StatelessWidget {
  const LandingPage({super.key});

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFFF8FAFC), Color(0xFFE2E8F0)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: SafeArea(
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 1100),
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(28),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(28),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.08),
                            blurRadius: 30,
                            offset: const Offset(0, 18),
                          ),
                        ],
                      ),
                      child: LayoutBuilder(
                        builder: (context, constraints) {
                          final isCompact = constraints.maxWidth < 760;

                          return Flex(
                            direction:
                                isCompact ? Axis.vertical : Axis.horizontal,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 12,
                                        vertical: 6,
                                      ),
                                      decoration: BoxDecoration(
                                        color: colorScheme.primaryContainer,
                                        borderRadius: BorderRadius.circular(999),
                                      ),
                                      child: Text(
                                        'Starter template',
                                        style: Theme.of(context)
                                            .textTheme
                                            .labelMedium
                                            ?.copyWith(
                                              color: colorScheme.onPrimaryContainer,
                                              fontWeight: FontWeight.w600,
                                            ),
                                      ),
                                    ),
                                    const SizedBox(height: 20),
                                    Text(
                                      'Build something clean from day one.',
                                      style: Theme.of(context)
                                          .textTheme
                                          .displaySmall
                                          ?.copyWith(
                                            fontWeight: FontWeight.w800,
                                            height: 1.05,
                                          ),
                                    ),
                                    const SizedBox(height: 16),
                                    Text(
                                      'A minimal Flutter landing page with strong visual hierarchy, reusable structure and a clean starting point for your next app.',
                                      style: Theme.of(context)
                                          .textTheme
                                          .bodyLarge
                                          ?.copyWith(
                                            color: Colors.black54,
                                            height: 1.5,
                                          ),
                                    ),
                                    const SizedBox(height: 28),
                                    Wrap(
                                      spacing: 12,
                                      runSpacing: 12,
                                      children: [
                                        FilledButton(
                                          onPressed: () {},
                                          child: const Text('Get started'),
                                        ),
                                        OutlinedButton(
                                          onPressed: () {},
                                          child: const Text('View docs'),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                              if (!isCompact) const SizedBox(width: 28),
                              if (isCompact) const SizedBox(height: 28),
                              Expanded(
                                child: _FeaturePanel(),
                              ),
                            ],
                          );
                        },
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _FeaturePanel extends StatelessWidget {
  const _FeaturePanel();

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: colorScheme.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(24),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'What this template gives you',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.w700,
                ),
          ),
          const SizedBox(height: 16),
          const _FeatureItem(
            title: 'Landing page base',
            description: 'A clean hero layout with call to action and supporting copy.',
          ),
          const _FeatureItem(
            title: 'Responsive composition',
            description: 'A single layout that adapts to compact and wide screens.',
          ),
          const _FeatureItem(
            title: 'Ready to extend',
            description: 'Use it as the starting point for routing, state and API integration.',
          ),
        ],
      ),
    );
  }
}

class _FeatureItem extends StatelessWidget {
  const _FeatureItem({required this.title, required this.description});

  final String title;
  final String description;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            margin: const EdgeInsets.only(top: 3),
            width: 10,
            height: 10,
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.primary,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w700,
                      ),
                ),
                const SizedBox(height: 4),
                Text(
                  description,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Colors.black54,
                        height: 1.4,
                      ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
