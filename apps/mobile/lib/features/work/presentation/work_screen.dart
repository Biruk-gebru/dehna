import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/format.dart';
import 'timer_provider.dart';

class WorkScreen extends ConsumerWidget {
  const WorkScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final timer = ref.watch(timerProvider);
    final notifier = ref.read(timerProvider.notifier);

    final label = switch (timer.phase) {
      TimerPhase.idle    => 'ready when you are',
      TimerPhase.paused  => 'paused',
      TimerPhase.running => 'remaining',
      TimerPhase.onBreak => 'on break',
    };

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            // ── Minimal top bar ──────────────────────────────────
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('ደህና', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, letterSpacing: -0.3)),
                  TextButton(
                    onPressed: () => context.push('/settings'),
                    child: const Text('Settings', style: TextStyle(color: AppColors.textMuted, fontSize: 14)),
                  ),
                ],
              ),
            ),

            // ── Timer ring + display ─────────────────────────────
            Expanded(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  _TimerRing(progress: timer.progress, remaining: timer.remainingSeconds),
                  const SizedBox(height: 12),
                  Text(label, style: const TextStyle(fontSize: 14, color: AppColors.textMuted)),
                  const SizedBox(height: 40),
                  _Controls(phase: timer.phase, notifier: notifier),
                ],
              ),
            ),

            // ── Bottom nav ───────────────────────────────────────
            Padding(
              padding: const EdgeInsets.only(bottom: 24),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  _NavLink('Exercises', () => context.push('/exercises')),
                  const SizedBox(width: 4),
                  _NavLink('History',   () => context.push('/history')),
                  const SizedBox(width: 4),
                  _NavLink('Settings',  () => context.push('/settings')),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _TimerRing extends StatelessWidget {
  final double progress;
  final int remaining;
  const _TimerRing({required this.progress, required this.remaining});

  @override
  Widget build(BuildContext context) {
    const size = 240.0;
    const stroke = 10.0;
    return SizedBox(
      width: size,
      height: size,
      child: Stack(
        alignment: Alignment.center,
        children: [
          CustomPaint(
            size: const Size(size, size),
            painter: _RingPainter(progress: progress, stroke: stroke),
          ),
          Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                formatSeconds(remaining),
                style: const TextStyle(fontFamily: 'monospace', fontSize: 40, fontWeight: FontWeight.w500, letterSpacing: -1, color: AppColors.text),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _RingPainter extends CustomPainter {
  final double progress;
  final double stroke;
  const _RingPainter({required this.progress, required this.stroke});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = (size.width / 2) - stroke;
    final trackPaint = Paint()
      ..color = AppColors.timerBg
      ..strokeWidth = stroke
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;
    final ringPaint  = Paint()
      ..color = AppColors.timerRing
      ..strokeWidth = stroke
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;
    canvas.drawCircle(center, radius, trackPaint);
    final sweep = 2 * 3.14159 * progress.clamp(0.0, 1.0);
    canvas.drawArc(Rect.fromCircle(center: center, radius: radius), -3.14159 / 2, sweep, false, ringPaint);
  }

  @override
  bool shouldRepaint(_RingPainter old) => old.progress != progress;
}

class _Controls extends StatelessWidget {
  final TimerPhase phase;
  final TimerNotifier notifier;
  const _Controls({required this.phase, required this.notifier});

  @override
  Widget build(BuildContext context) {
    if (phase == TimerPhase.idle) {
      return ElevatedButton(
        onPressed: notifier.start,
        style: ElevatedButton.styleFrom(minimumSize: const Size(180, 52)),
        child: const Text('Start working'),
      );
    }
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        if (phase == TimerPhase.running)
          OutlinedButton(onPressed: notifier.pause,  child: const Text('Pause'))
        else
          ElevatedButton(onPressed: notifier.resume, child: const Text('Resume')),
        const SizedBox(width: 12),
        TextButton(
          onPressed: notifier.stop,
          child: const Text('Stop', style: TextStyle(color: AppColors.textMuted)),
        ),
      ],
    );
  }
}

class _NavLink extends StatelessWidget {
  final String label;
  final VoidCallback onTap;
  const _NavLink(this.label, this.onTap);

  @override
  Widget build(BuildContext context) => TextButton(
    onPressed: onTap,
    style: TextButton.styleFrom(foregroundColor: AppColors.textMuted, textStyle: const TextStyle(fontSize: 13)),
    child: Text(label),
  );
}
