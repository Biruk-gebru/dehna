import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/preferences_repository.dart';
import '../domain/preferences.dart';

final prefsRepoProvider = Provider((_) => PreferencesRepository());

final prefsProvider = AsyncNotifierProvider<PrefsNotifier, UserPreferences>(PrefsNotifier.new);

class PrefsNotifier extends AsyncNotifier<UserPreferences> {
  @override
  Future<UserPreferences> build() =>
      ref.read(prefsRepoProvider).load();

  Future<void> savePrefs(UserPreferences prefs) async {
    state = AsyncData(prefs);
    await ref.read(prefsRepoProvider).save(prefs);
  }
}
