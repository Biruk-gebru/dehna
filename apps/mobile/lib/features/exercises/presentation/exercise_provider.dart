import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/exercise_repository.dart';
import '../domain/exercise.dart';

final exerciseRepoProvider = Provider((_) => ExerciseRepository());

final exerciseCatalogProvider = FutureProvider<List<Exercise>>((ref) =>
    ref.read(exerciseRepoProvider).loadAll());
