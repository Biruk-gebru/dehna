import 'package:flutter_test/flutter_test.dart';
import 'package:dehna/main.dart';

void main() {
  testWidgets('app launches without crashing', (WidgetTester tester) async {
    await tester.pumpWidget(const DehnaApp());
    expect(find.byType(DehnaApp), findsOneWidget);
  });
}
