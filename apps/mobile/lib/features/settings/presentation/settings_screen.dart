import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../exercises/domain/exercise.dart';
import '../../onboarding/domain/preferences.dart';
import '../../onboarding/presentation/preferences_provider.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncPrefs = ref.watch(prefsProvider);
    return Scaffold(
      appBar: AppBar(
        title: const Text('ደህና'),
        actions: [TextButton(onPressed: () => context.pop(), child: const Text('← Work', style: TextStyle(color: AppColors.textMuted)))],
        automaticallyImplyLeading: false,
      ),
      body: asyncPrefs.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
        data: (prefs) => _SettingsBody(prefs: prefs),
      ),
    );
  }
}

class _SettingsBody extends ConsumerWidget {
  final UserPreferences prefs;
  const _SettingsBody({required this.prefs});

  void _save(WidgetRef ref, UserPreferences updated) =>
      ref.read(prefsProvider.notifier).savePrefs(updated);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 40),
      children: [
        Text('Settings', style: Theme.of(context).textTheme.headlineMedium),
        const SizedBox(height: 28),

        // Work interval
        _SectionHeader('Focus interval'),
        const SizedBox(height: 12),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [15, 20, 25, 30, 45, 60].map((m) {
            final active = prefs.workIntervalMinutes == m;
            return GestureDetector(
              onTap: () => _save(ref, prefs.copyWith(workIntervalMinutes: m)),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 120),
                padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
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
        const SizedBox(height: 24),
        const Divider(),
        const SizedBox(height: 20),

        // Break duration
        _SectionHeader('Break duration'),
        const SizedBox(height: 12),
        Text(
          '${prefs.breakDurationMinutes} min',
          style: const TextStyle(fontFamily: 'monospace', fontSize: 24, fontWeight: FontWeight.w300, color: AppColors.text),
          textAlign: TextAlign.center,
        ),
        Slider(
          value: prefs.breakDurationMinutes.toDouble(),
          min: 3, max: 15, divisions: 12,
          activeColor: AppColors.primary,
          inactiveColor: AppColors.border,
          onChanged: (v) => _save(ref, prefs.copyWith(breakDurationMinutes: v.round())),
        ),
        const SizedBox(height: 16),
        const Divider(),
        const SizedBox(height: 20),

        // Exercise intensity
        _SectionHeader('Exercise intensity'),
        const SizedBox(height: 12),
        Row(children: Difficulty.values.map((d) {
          final active = prefs.exerciseDifficulty == d;
          return Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 4),
              child: GestureDetector(
                onTap: () => _save(ref, prefs.copyWith(exerciseDifficulty: d)),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 120),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  decoration: BoxDecoration(
                    color: active ? AppColors.primary.withValues(alpha: 0.08) : AppColors.surface,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: active ? AppColors.primary : AppColors.border, width: active ? 1.5 : 1),
                  ),
                  child: Text(
                    d == Difficulty.gentle ? 'Gentle' : 'Moderate',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontWeight: FontWeight.w500, color: active ? AppColors.primary : AppColors.text),
                  ),
                ),
              ),
            ),
          );
        }).toList()),
        const SizedBox(height: 20),
        const Divider(),
        const SizedBox(height: 20),

        // Sound & Notifications
        _SectionHeader('Alerts'),
        const SizedBox(height: 8),
        SwitchListTile(
          contentPadding: EdgeInsets.zero,
          title: const Text('Play chime when break starts', style: TextStyle(fontSize: 14, color: AppColors.text)),
          value: prefs.soundEnabled,
          activeThumbColor: AppColors.primary,
          onChanged: (v) => _save(ref, prefs.copyWith(soundEnabled: v)),
        ),
        SwitchListTile(
          contentPadding: EdgeInsets.zero,
          title: const Text('Notify when break starts', style: TextStyle(fontSize: 14, color: AppColors.text)),
          value: prefs.notificationsEnabled,
          activeThumbColor: AppColors.primary,
          onChanged: (v) => _save(ref, prefs.copyWith(notificationsEnabled: v)),
        ),
      ],
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;
  const _SectionHeader(this.title);
  @override
  Widget build(BuildContext context) => Text(
    title,
    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: AppColors.textMuted, letterSpacing: 0.3),
  );
}
