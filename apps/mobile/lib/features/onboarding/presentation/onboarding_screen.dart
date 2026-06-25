import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../exercises/domain/exercise.dart';
import '../domain/preferences.dart';
import 'preferences_provider.dart';

class OnboardingScreen extends ConsumerStatefulWidget {
  const OnboardingScreen({super.key});

  @override
  ConsumerState<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends ConsumerState<OnboardingScreen> {
  int _step = 0;
  final List<ProblemArea> _areas = [ProblemArea.general];
  int _intervalMinutes = 25;
  Difficulty _difficulty = Difficulty.gentle;

  static const _areaLabels = {
    ProblemArea.back:         'Back',
    ProblemArea.neck:         'Neck',
    ProblemArea.shoulders:    'Shoulders',
    ProblemArea.wristsElbows: 'Wrists',
    ProblemArea.eyes:         'Eyes',
    ProblemArea.knees:        'Hips',
    ProblemArea.legs:         'Legs',
    ProblemArea.general:      'General',
  };

  Future<void> _finish() async {
    final prefs = UserPreferences(
      problemAreas:         _areas,
      workIntervalMinutes:  _intervalMinutes,
      exerciseDifficulty:   _difficulty,
      onboardingCompleted:  true,
    );
    await ref.read(prefsProvider.notifier).savePrefs(prefs);
    if (mounted) context.go('/work');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(28),
          child: switch (_step) {
            0 => _Welcome(onNext: () => setState(() => _step = 1)),
            1 => _AreaPicker(
                selected:    _areas,
                labels:      _areaLabels,
                onChanged:   (a) => setState(() {
                  _areas.contains(a) ? _areas.remove(a) : _areas.add(a);
                }),
                onNext: () => setState(() => _step = 2),
              ),
            2 => _IntervalPicker(
                value:    _intervalMinutes,
                onChanged: (v) => setState(() => _intervalMinutes = v),
                onNext:   () => setState(() => _step = 3),
              ),
            _ => _DifficultyPicker(
                value:    _difficulty,
                onChanged: (d) => setState(() => _difficulty = d),
                onFinish: _finish,
              ),
          },
        ),
      ),
    );
  }
}

// ─── Step widgets ─────────────────────────────────────────────────────────────

class _Welcome extends StatelessWidget {
  final VoidCallback onNext;
  const _Welcome({required this.onNext});

  @override
  Widget build(BuildContext context) => Column(
    mainAxisAlignment: MainAxisAlignment.center,
    children: [
      Text('ደህና', style: Theme.of(context).textTheme.displayLarge),
      const SizedBox(height: 12),
      Text('Be well at your desk.', style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: AppColors.textMuted)),
      const SizedBox(height: 32),
      Text(
        'Short movement breaks, tailored to how your body feels — so every pause actually helps.',
        textAlign: TextAlign.center,
        style: Theme.of(context).textTheme.bodyMedium,
      ),
      const SizedBox(height: 48),
      ElevatedButton(onPressed: onNext, child: const Text('Get started')),
    ],
  );
}

class _AreaPicker extends StatelessWidget {
  final List<ProblemArea> selected;
  final Map<ProblemArea, String> labels;
  final void Function(ProblemArea) onChanged;
  final VoidCallback onNext;
  const _AreaPicker({required this.selected, required this.labels, required this.onChanged, required this.onNext});

  @override
  Widget build(BuildContext context) => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      const SizedBox(height: 24),
      Text('What would you like to work on?', style: Theme.of(context).textTheme.headlineSmall),
      const SizedBox(height: 6),
      Text('Areas you select will be prioritized during breaks.', style: Theme.of(context).textTheme.bodyMedium),
      const SizedBox(height: 24),
      Expanded(
        child: GridView.count(
          crossAxisCount: 2,
          mainAxisSpacing: 12,
          crossAxisSpacing: 12,
          childAspectRatio: 2.4,
          children: ProblemArea.values.map((area) {
            final active = selected.contains(area);
            return GestureDetector(
              onTap: () => onChanged(area),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 150),
                decoration: BoxDecoration(
                  color: active ? AppColors.primary.withValues(alpha: 0.1) : AppColors.surface,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: active ? AppColors.primary : AppColors.border, width: active ? 1.5 : 1),
                ),
                alignment: Alignment.center,
                child: Text(labels[area]!, style: TextStyle(fontWeight: active ? FontWeight.w600 : FontWeight.w400, color: active ? AppColors.primary : AppColors.text)),
              ),
            );
          }).toList(),
        ),
      ),
      const SizedBox(height: 16),
      SizedBox(width: double.infinity, child: ElevatedButton(onPressed: selected.isEmpty ? null : onNext, child: const Text('Continue →'))),
    ],
  );
}

class _IntervalPicker extends StatelessWidget {
  final int value;
  final void Function(int) onChanged;
  final VoidCallback onNext;
  const _IntervalPicker({required this.value, required this.onChanged, required this.onNext});

  @override
  Widget build(BuildContext context) {
    const options = [15, 20, 25, 30, 45, 60];
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text('How long do you want to focus?', style: Theme.of(context).textTheme.headlineSmall, textAlign: TextAlign.center),
        const SizedBox(height: 6),
        Text('You can change this anytime in settings.', style: Theme.of(context).textTheme.bodyMedium, textAlign: TextAlign.center),
        const SizedBox(height: 32),
        Wrap(
          spacing: 10,
          runSpacing: 10,
          alignment: WrapAlignment.center,
          children: options.map((m) {
            final active = value == m;
            return GestureDetector(
              onTap: () => onChanged(m),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 150),
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                decoration: BoxDecoration(
                  color: active ? AppColors.primary : AppColors.surface,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: active ? AppColors.primary : AppColors.border),
                ),
                child: Text('${m}m', style: TextStyle(fontWeight: FontWeight.w500, color: active ? Colors.white : AppColors.text)),
              ),
            );
          }).toList(),
        ),
        const SizedBox(height: 48),
        SizedBox(width: double.infinity, child: ElevatedButton(onPressed: onNext, child: const Text('Continue →'))),
      ],
    );
  }
}

class _DifficultyPicker extends StatelessWidget {
  final Difficulty value;
  final void Function(Difficulty) onChanged;
  final VoidCallback onFinish;
  const _DifficultyPicker({required this.value, required this.onChanged, required this.onFinish});

  @override
  Widget build(BuildContext context) => Column(
    mainAxisAlignment: MainAxisAlignment.center,
    children: [
      Text('How should the exercises feel?', style: Theme.of(context).textTheme.headlineSmall, textAlign: TextAlign.center),
      const SizedBox(height: 6),
      Text('Gentle is safe for most people.', style: Theme.of(context).textTheme.bodyMedium, textAlign: TextAlign.center),
      const SizedBox(height: 32),
      Row(
        children: Difficulty.values.map((d) {
          final active = value == d;
          return Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 6),
              child: GestureDetector(
                onTap: () => onChanged(d),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 150),
                  padding: const EdgeInsets.symmetric(vertical: 20),
                  decoration: BoxDecoration(
                    color: active ? AppColors.primary.withValues(alpha: 0.08) : AppColors.surface,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: active ? AppColors.primary : AppColors.border, width: active ? 1.5 : 1),
                  ),
                  child: Column(children: [
                    Text(d == Difficulty.gentle ? 'Gentle' : 'Moderate', style: TextStyle(fontWeight: FontWeight.w600, color: active ? AppColors.primary : AppColors.text)),
                    const SizedBox(height: 4),
                    Text(d == Difficulty.gentle ? 'Low-impact' : 'More effort', style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
                  ]),
                ),
              ),
            ),
          );
        }).toList(),
      ),
      const SizedBox(height: 48),
      SizedBox(width: double.infinity, child: ElevatedButton(onPressed: onFinish, child: const Text('Start working'))),
    ],
  );
}
