import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../exercises/domain/exercise.dart';

enum TimerPhase { idle, running, paused, onBreak }

class TimerState {
  final TimerPhase phase;
  final int totalSeconds;
  final int elapsedSeconds;
  final List<Exercise> currentRoutine;

  const TimerState({
    this.phase          = TimerPhase.idle,
    required this.totalSeconds,
    this.elapsedSeconds = 0,
    this.currentRoutine = const [],
  });

  int get remainingSeconds => (totalSeconds - elapsedSeconds).clamp(0, totalSeconds);
  double get progress => totalSeconds > 0 ? elapsedSeconds / totalSeconds : 0.0;

  TimerState copyWith({
    TimerPhase? phase,
    int? totalSeconds,
    int? elapsedSeconds,
    List<Exercise>? currentRoutine,
  }) => TimerState(
    phase:          phase          ?? this.phase,
    totalSeconds:   totalSeconds   ?? this.totalSeconds,
    elapsedSeconds: elapsedSeconds ?? this.elapsedSeconds,
    currentRoutine: currentRoutine ?? this.currentRoutine,
  );
}

class TimerNotifier extends Notifier<TimerState> {
  Timer? _ticker;
  DateTime? _tickStart;
  int _accumulated = 0;

  @override
  TimerState build() {
    ref.onDispose(_stopTick);
    return TimerState(totalSeconds: 25 * 60);
  }

  void setInterval(int minutes) {
    if (state.phase == TimerPhase.idle) {
      state = state.copyWith(totalSeconds: minutes * 60);
    }
  }

  void start() {
    _accumulated   = 0;
    _tickStart     = DateTime.now();
    state          = state.copyWith(phase: TimerPhase.running, elapsedSeconds: 0);
    _startTick();
  }

  void pause() {
    _stopTick();
    if (_tickStart != null) {
      _accumulated += DateTime.now().difference(_tickStart!).inSeconds;
      _tickStart   = null;
    }
    state = state.copyWith(phase: TimerPhase.paused);
  }

  void resume() {
    _tickStart = DateTime.now();
    state      = state.copyWith(phase: TimerPhase.running);
    _startTick();
  }

  void stop() {
    _stopTick();
    _accumulated = 0;
    _tickStart   = null;
    state        = TimerState(totalSeconds: state.totalSeconds);
  }

  void startBreak(List<Exercise> routine) {
    _stopTick();
    state = state.copyWith(phase: TimerPhase.onBreak, currentRoutine: routine);
  }

  void endBreak() {
    _accumulated = 0;
    _tickStart   = DateTime.now();
    state        = state.copyWith(
      phase:          TimerPhase.running,
      elapsedSeconds: 0,
      currentRoutine: const [],
    );
    _startTick();
  }

  void _startTick() {
    _stopTick();
    _ticker = Timer.periodic(const Duration(milliseconds: 500), (_) {
      if (_tickStart == null) return;
      final runSecs = DateTime.now().difference(_tickStart!).inSeconds;
      final total   = _accumulated + runSecs;
      if (total >= state.totalSeconds) {
        _stopTick();
        state = state.copyWith(elapsedSeconds: state.totalSeconds, phase: TimerPhase.idle);
      } else {
        state = state.copyWith(elapsedSeconds: total);
      }
    });
  }

  void _stopTick() {
    _ticker?.cancel();
    _ticker = null;
  }

}

final timerProvider = NotifierProvider<TimerNotifier, TimerState>(TimerNotifier.new);
