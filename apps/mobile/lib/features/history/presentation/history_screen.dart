import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';

class HistoryScreen extends StatelessWidget {
  const HistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('ደህና'),
        actions: [TextButton(onPressed: () => context.pop(), child: const Text('← Work', style: TextStyle(color: AppColors.textMuted)))],
        automaticallyImplyLeading: false,
      ),
      body: CustomScrollView(
        slivers: [
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
            sliver: SliverToBoxAdapter(
              child: Text('History', style: Theme.of(context).textTheme.headlineMedium),
            ),
          ),
          // TODO: wire to local database (Isar)
          const SliverFillRemaining(
            child: Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.history_rounded, size: 48, color: AppColors.border),
                  SizedBox(height: 16),
                  Text('No sessions yet', style: TextStyle(fontWeight: FontWeight.w500, color: AppColors.text)),
                  SizedBox(height: 4),
                  Text('Complete a work session to see it here.', style: TextStyle(fontSize: 13, color: AppColors.textMuted)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
