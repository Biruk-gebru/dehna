import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../domain/exercise.dart';
import 'exercise_provider.dart';

class ExercisesScreen extends ConsumerStatefulWidget {
  const ExercisesScreen({super.key});
  @override
  ConsumerState<ExercisesScreen> createState() => _ExercisesScreenState();
}

class _ExercisesScreenState extends ConsumerState<ExercisesScreen> {
  ExerciseType? _type;
  ProblemArea?  _area;
  String        _query = '';
  String?       _openId;

  static const _typeColors = {
    ExerciseType.eyeBreak:  Color(0xFF5A9E8F),
    ExerciseType.stretch:   Color(0xFFC05A2A),
    ExerciseType.mobility:  Color(0xFF7A6040),
    ExerciseType.strength:  Color(0xFF9A3820),
    ExerciseType.cognitive: Color(0xFF5A7A5E),
  };
  static const _typeLabels = {
    ExerciseType.eyeBreak:  'Eye break',
    ExerciseType.stretch:   'Stretch',
    ExerciseType.mobility:  'Mobility',
    ExerciseType.strength:  'Strength',
    ExerciseType.cognitive: 'Cognitive',
  };
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

  @override
  Widget build(BuildContext context) {
    final catalogAsync = ref.watch(exerciseCatalogProvider);
    return Scaffold(
      appBar: AppBar(
        title: const Text('ደህና'),
        actions: [TextButton(onPressed: () => Navigator.pop(context), child: const Text('← Back', style: TextStyle(color: AppColors.textMuted)))],
      ),
      body: catalogAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
        data: (catalog) {
          final q = _query.trim().toLowerCase();
          final filtered = catalog.where((e) {
            if (_type != null && e.type != _type) return false;
            if (_area != null && !e.targetAreas.contains(_area)) return false;
            if (q.isNotEmpty && !e.name.toLowerCase().contains(q) && !e.description.toLowerCase().contains(q)) return false;
            return true;
          }).toList();

          return CustomScrollView(
            slivers: [
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
                sliver: SliverToBoxAdapter(
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text('Exercises', style: Theme.of(context).textTheme.headlineMedium),
                    const SizedBox(height: 16),
                    // Search
                    TextField(
                      onChanged: (v) => setState(() { _query = v; _openId = null; }),
                      decoration: InputDecoration(
                        hintText: 'Search exercises…',
                        hintStyle: const TextStyle(color: AppColors.textMuted),
                        filled: true,
                        fillColor: AppColors.surface,
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: AppColors.border)),
                        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: AppColors.border)),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        prefixIcon: const Icon(Icons.search, color: AppColors.textMuted, size: 18),
                      ),
                    ),
                    const SizedBox(height: 12),
                    // Type filters
                    SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        children: ExerciseType.values.map((t) {
                          final active = _type == t;
                          final color  = _typeColors[t]!;
                          return Padding(
                            padding: const EdgeInsets.only(right: 8),
                            child: GestureDetector(
                              onTap: () => setState(() { _type = active ? null : t; _openId = null; }),
                              child: AnimatedContainer(
                                duration: const Duration(milliseconds: 150),
                                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                                decoration: BoxDecoration(
                                  color: active ? color : AppColors.surface,
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(_typeLabels[t]!, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: active ? Colors.white : AppColors.textMuted)),
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                    const SizedBox(height: 8),
                    // Area filters
                    SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        children: ProblemArea.values.map((a) {
                          final active = _area == a;
                          return Padding(
                            padding: const EdgeInsets.only(right: 8),
                            child: GestureDetector(
                              onTap: () => setState(() { _area = active ? null : a; _openId = null; }),
                              child: AnimatedContainer(
                                duration: const Duration(milliseconds: 150),
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                                decoration: BoxDecoration(
                                  color: active ? AppColors.text : Colors.transparent,
                                  borderRadius: BorderRadius.circular(4),
                                  border: Border.all(color: AppColors.border),
                                ),
                                child: Text(_areaLabels[a]!, style: TextStyle(fontSize: 12, color: active ? AppColors.bg : AppColors.textMuted)),
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text('${filtered.length} of ${catalog.length} exercises', style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
                    const SizedBox(height: 8),
                  ]),
                ),
              ),
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 32),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, i) {
                      final ex   = filtered[i];
                      final open = _openId == ex.id;
                      final color = _typeColors[ex.type]!;
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 8),
                        child: _ExerciseTile(exercise: ex, open: open, typeColor: color, typeLabel: _typeLabels[ex.type]!, areaLabel: ex.targetAreas.map((a) => _areaLabels[a] ?? '').join(', '), onToggle: () => setState(() => _openId = open ? null : ex.id)),
                      );
                    },
                    childCount: filtered.length,
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _ExerciseTile extends StatelessWidget {
  final Exercise exercise;
  final bool open;
  final Color typeColor;
  final String typeLabel;
  final String areaLabel;
  final VoidCallback onToggle;
  const _ExerciseTile({required this.exercise, required this.open, required this.typeColor, required this.typeLabel, required this.areaLabel, required this.onToggle});

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 150),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: open ? typeColor.withValues(alpha: 0.4) : AppColors.border, width: open ? 1.5 : 1),
      ),
      child: Column(
        children: [
          InkWell(
            onTap: onToggle,
            borderRadius: BorderRadius.circular(12),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              child: Row(children: [
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(exercise.name, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 15, color: AppColors.text)),
                  const SizedBox(height: 2),
                  Text(areaLabel, style: const TextStyle(fontSize: 13, color: AppColors.textMuted)),
                ])),
                Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
                  Text(typeLabel, style: TextStyle(fontSize: 13, color: typeColor, fontWeight: FontWeight.w500)),
                  const SizedBox(height: 2),
                  Text('${exercise.duration}s', style: const TextStyle(fontFamily: 'monospace', fontSize: 12, color: AppColors.textMuted)),
                ]),
                const SizedBox(width: 8),
                Icon(open ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down, color: AppColors.textMuted, size: 18),
              ]),
            ),
          ),
          if (open) ...[
            const Divider(height: 1),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(exercise.description, style: const TextStyle(fontSize: 14, color: AppColors.textMuted, height: 1.5)),
                const SizedBox(height: 12),
                ...exercise.steps.asMap().entries.map((e) => Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text('${e.key + 1}. ', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: typeColor)),
                    Expanded(child: Text(e.value, style: const TextStyle(fontSize: 14, color: AppColors.text, height: 1.5))),
                  ]),
                )),
                if (exercise.tips.isNotEmpty) ...[
                  const SizedBox(height: 4),
                  Text(exercise.tips.first, style: const TextStyle(fontSize: 13, color: AppColors.textMuted, fontStyle: FontStyle.italic, height: 1.5)),
                ],
              ]),
            ),
          ],
        ],
      ),
    );
  }
}
