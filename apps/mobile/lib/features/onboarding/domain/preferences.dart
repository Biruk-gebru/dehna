import '../../exercises/domain/exercise.dart';

class UserPreferences {
  final List<ProblemArea> problemAreas;
  final int workIntervalMinutes;
  final int breakDurationMinutes;
  final Difficulty exerciseDifficulty;
  final bool soundEnabled;
  final bool notificationsEnabled;
  final bool onboardingCompleted;

  const UserPreferences({
    this.problemAreas        = const [ProblemArea.general],
    this.workIntervalMinutes = 25,
    this.breakDurationMinutes = 5,
    this.exerciseDifficulty  = Difficulty.gentle,
    this.soundEnabled        = false,
    this.notificationsEnabled = true,
    this.onboardingCompleted = false,
  });

  UserPreferences copyWith({
    List<ProblemArea>? problemAreas,
    int? workIntervalMinutes,
    int? breakDurationMinutes,
    Difficulty? exerciseDifficulty,
    bool? soundEnabled,
    bool? notificationsEnabled,
    bool? onboardingCompleted,
  }) => UserPreferences(
    problemAreas:         problemAreas         ?? this.problemAreas,
    workIntervalMinutes:  workIntervalMinutes  ?? this.workIntervalMinutes,
    breakDurationMinutes: breakDurationMinutes ?? this.breakDurationMinutes,
    exerciseDifficulty:   exerciseDifficulty   ?? this.exerciseDifficulty,
    soundEnabled:         soundEnabled         ?? this.soundEnabled,
    notificationsEnabled: notificationsEnabled ?? this.notificationsEnabled,
    onboardingCompleted:  onboardingCompleted  ?? this.onboardingCompleted,
  );
}
