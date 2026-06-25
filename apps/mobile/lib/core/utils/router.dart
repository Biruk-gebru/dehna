import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/onboarding/presentation/preferences_provider.dart';
import '../../features/onboarding/presentation/onboarding_screen.dart';
import '../../features/work/presentation/work_screen.dart';
import '../../features/exercises/presentation/exercises_screen.dart';
import '../../features/history/presentation/history_screen.dart';
import '../../features/settings/presentation/settings_screen.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final prefsAsync = ref.watch(prefsProvider);

  return GoRouter(
    initialLocation: '/work',
    redirect: (context, state) {
      final prefs = prefsAsync.valueOrNull;
      if (prefs == null) return null; // still loading
      final onboarded = prefs.onboardingCompleted;
      final goingToOnboarding = state.matchedLocation == '/onboarding';

      if (!onboarded && !goingToOnboarding) return '/onboarding';
      if (onboarded && goingToOnboarding)   return '/work';
      return null;
    },
    routes: [
      GoRoute(path: '/onboarding', builder: (_, _) => const OnboardingScreen()),
      GoRoute(path: '/work',       builder: (_, _) => const WorkScreen()),
      GoRoute(path: '/exercises',  builder: (_, _) => const ExercisesScreen()),
      GoRoute(path: '/history',    builder: (_, _) => const HistoryScreen()),
      GoRoute(path: '/settings',   builder: (_, _) => const SettingsScreen()),
    ],
  );
});
