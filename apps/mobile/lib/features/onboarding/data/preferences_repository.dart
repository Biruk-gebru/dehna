import 'package:shared_preferences/shared_preferences.dart';
import '../domain/preferences.dart';
import '../../exercises/domain/exercise.dart';

class PreferencesRepository {
  static const _prefix = 'dehna_';

  Future<UserPreferences> load() async {
    final p = await SharedPreferences.getInstance();
    final areas = (p.getStringList('${_prefix}areas') ?? ['general'])
        .map(_parseArea)
        .toList();
    return UserPreferences(
      problemAreas:         areas,
      workIntervalMinutes:  p.getInt('${_prefix}work_interval')    ?? 25,
      breakDurationMinutes: p.getInt('${_prefix}break_duration')   ?? 5,
      exerciseDifficulty:   p.getString('${_prefix}difficulty')    == 'moderate'
                              ? Difficulty.moderate : Difficulty.gentle,
      soundEnabled:         p.getBool('${_prefix}sound')           ?? false,
      notificationsEnabled: p.getBool('${_prefix}notifications')   ?? true,
      onboardingCompleted:  p.getBool('${_prefix}onboarding_done') ?? false,
    );
  }

  Future<void> save(UserPreferences prefs) async {
    final p = await SharedPreferences.getInstance();
    await Future.wait([
      p.setStringList('${_prefix}areas',         prefs.problemAreas.map(_areaKey).toList()),
      p.setInt('${_prefix}work_interval',         prefs.workIntervalMinutes),
      p.setInt('${_prefix}break_duration',        prefs.breakDurationMinutes),
      p.setString('${_prefix}difficulty',         prefs.exerciseDifficulty == Difficulty.moderate ? 'moderate' : 'gentle'),
      p.setBool('${_prefix}sound',                prefs.soundEnabled),
      p.setBool('${_prefix}notifications',        prefs.notificationsEnabled),
      p.setBool('${_prefix}onboarding_done',      prefs.onboardingCompleted),
    ]);
  }

  static ProblemArea _parseArea(String s) => switch (s) {
    'back'          => ProblemArea.back,
    'neck'          => ProblemArea.neck,
    'shoulders'     => ProblemArea.shoulders,
    'wrists-elbows' => ProblemArea.wristsElbows,
    'knees-hips'    => ProblemArea.knees,
    'eyes'          => ProblemArea.eyes,
    'legs'          => ProblemArea.legs,
    _               => ProblemArea.general,
  };

  static String _areaKey(ProblemArea a) => switch (a) {
    ProblemArea.back          => 'back',
    ProblemArea.neck          => 'neck',
    ProblemArea.shoulders     => 'shoulders',
    ProblemArea.wristsElbows  => 'wrists-elbows',
    ProblemArea.knees         => 'knees-hips',
    ProblemArea.eyes          => 'eyes',
    ProblemArea.legs          => 'legs',
    ProblemArea.general       => 'general',
  };
}
