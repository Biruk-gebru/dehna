enum ProblemArea { back, neck, shoulders, wristsElbows, knees, eyes, legs, general }

enum ExerciseType { stretch, mobility, strength, cognitive, eyeBreak }

enum Difficulty { gentle, moderate }

class Exercise {
  final String id;
  final String name;
  final String description;
  final List<ProblemArea> targetAreas;
  final int duration;
  final Difficulty difficulty;
  final ExerciseType type;
  final List<String> steps;
  final List<String> tips;

  const Exercise({
    required this.id,
    required this.name,
    required this.description,
    required this.targetAreas,
    required this.duration,
    required this.difficulty,
    required this.type,
    required this.steps,
    required this.tips,
  });

  factory Exercise.fromJson(Map<String, dynamic> j) => Exercise(
    id:          j['id'] as String,
    name:        j['name'] as String,
    description: j['description'] as String,
    targetAreas: (j['targetAreas'] as List).map(_parseArea).toList(),
    duration:    j['duration'] as int,
    difficulty:  j['difficulty'] == 'moderate' ? Difficulty.moderate : Difficulty.gentle,
    type:        _parseType(j['type'] as String),
    steps:       List<String>.from(j['steps'] as List),
    tips:        List<String>.from(j['tips'] as List),
  );

  static ProblemArea _parseArea(dynamic s) => switch (s as String) {
    'back'           => ProblemArea.back,
    'neck'           => ProblemArea.neck,
    'shoulders'      => ProblemArea.shoulders,
    'wrists-elbows'  => ProblemArea.wristsElbows,
    'knees-hips'     => ProblemArea.knees,
    'eyes'           => ProblemArea.eyes,
    'legs'           => ProblemArea.legs,
    _                => ProblemArea.general,
  };

  static ExerciseType _parseType(String s) => switch (s) {
    'eye-break' => ExerciseType.eyeBreak,
    'stretch'   => ExerciseType.stretch,
    'mobility'  => ExerciseType.mobility,
    'strength'  => ExerciseType.strength,
    _           => ExerciseType.cognitive,
  };
}
