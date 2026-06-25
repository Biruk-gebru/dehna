import 'dart:convert';
import 'package:flutter/services.dart';
import '../domain/exercise.dart';

class ExerciseRepository {
  List<Exercise>? _cache;

  Future<List<Exercise>> loadAll() async {
    if (_cache != null) return _cache!;
    final raw  = await rootBundle.loadString('assets/data/exercises.json');
    final list = jsonDecode(raw) as List;
    _cache = list.map((e) => Exercise.fromJson(e as Map<String, dynamic>)).toList();
    return _cache!;
  }

  Future<List<Exercise>> selectRoutine({
    required List<Exercise> catalog,
    required List<ProblemArea> problemAreas,
    required Difficulty difficulty,
    required List<String> recentIds,
    required double hoursWorked,
  }) async {
    final recent    = recentIds.toSet();
    var available   = catalog
        .where((e) => !recent.contains(e.id) && (e.difficulty == Difficulty.gentle || e.difficulty == difficulty))
        .toList();

    // Fallback if recency filter emptied the pool
    if (available.isEmpty) {
      available = catalog
          .where((e) => e.difficulty == Difficulty.gentle || e.difficulty == difficulty)
          .toList();
    }
    if (available.isEmpty) available = List.of(catalog);

    // Mandatory: one cognitive
    final cogPool   = available.where((e) => e.type == ExerciseType.cognitive).toList()..shuffle();
    final cognitive = cogPool.isNotEmpty ? cogPool.first : null;

    // Mandatory: eye break if flagged or 2+ hours worked
    final needsEye  = problemAreas.contains(ProblemArea.eyes) || hoursWorked >= 2;
    final eyePool   = available.where((e) => e.type == ExerciseType.eyeBreak).toList()..shuffle();
    final eyeBreak  = needsEye && eyePool.isNotEmpty ? eyePool.first : null;

    final pinned    = [cognitive, eyeBreak].whereType<Exercise>().toList();
    final pinnedIds = pinned.map((e) => e.id).toSet();

    // Weighted fill by problem area
    final fillPool  = <Exercise>[];
    for (final ex in available) {
      if (pinnedIds.contains(ex.id)) continue;
      final matches = ex.targetAreas.any(problemAreas.contains);
      for (var i = 0; i < (matches ? 3 : 1); i++) { fillPool.add(ex); }
    }
    fillPool.shuffle();

    final targetSeconds = difficulty == Difficulty.gentle ? 5 * 60 : 7 * 60;
    final filled        = List<Exercise>.from(pinned);
    var totalDur        = filled.fold(0, (s, e) => s + e.duration);
    final seen          = {...pinnedIds};

    for (final ex in fillPool) {
      if (seen.contains(ex.id)) continue;
      if (filled.length >= 5) break;
      if (totalDur + ex.duration <= targetSeconds + 30) {
        filled.add(ex);
        seen.add(ex.id);
        totalDur += ex.duration;
      }
    }

    final nonCog = filled.where((e) => e.type != ExerciseType.cognitive).toList()..shuffle();
    final cogs   = filled.where((e) => e.type == ExerciseType.cognitive).toList();
    return [...nonCog, ...cogs];
  }
}
