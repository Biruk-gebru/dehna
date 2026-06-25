class BreakRecord {
  final DateTime startedAt;
  final int durationSeconds;
  final List<String> exercisesShown;
  final bool completed;

  const BreakRecord({
    required this.startedAt,
    required this.durationSeconds,
    required this.exercisesShown,
    required this.completed,
  });
}

enum SessionStatus { active, completed, abandoned }

class WorkSession {
  final int? id;
  final DateTime startedAt;
  final DateTime? endedAt;
  final int durationMinutes;
  final List<BreakRecord> breaks;
  final SessionStatus status;

  const WorkSession({
    this.id,
    required this.startedAt,
    this.endedAt,
    this.durationMinutes = 0,
    this.breaks = const [],
    this.status = SessionStatus.active,
  });

  WorkSession copyWith({
    int? id,
    DateTime? endedAt,
    int? durationMinutes,
    List<BreakRecord>? breaks,
    SessionStatus? status,
  }) => WorkSession(
    id:              id              ?? this.id,
    startedAt:       startedAt,
    endedAt:         endedAt         ?? this.endedAt,
    durationMinutes: durationMinutes ?? this.durationMinutes,
    breaks:          breaks          ?? this.breaks,
    status:          status          ?? this.status,
  );
}
