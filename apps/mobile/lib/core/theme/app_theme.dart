import 'package:flutter/material.dart';

// Earth-terracotta palette — mirrors the web design system
abstract final class AppColors {
  static const bg            = Color(0xFFF5F3EF);
  static const surface       = Color(0xFFFFFFFF);
  static const surfaceHover  = Color(0xFFF0EDE8);
  static const text          = Color(0xFF1C1510);
  static const textMuted     = Color(0xFF6B6358);
  static const primary       = Color(0xFFD3643B);
  static const primaryDark   = Color(0xFFB8522D);
  static const border        = Color(0xFFE8E4DE);
  static const timerRing     = Color(0xFF94C7B6);
  static const timerBg       = Color(0xFFDDD9D2);
  static const breakBg       = Color(0xFFD6E1C7);
  static const success       = Color(0xFF94C7B6);
}

ThemeData buildTheme() {
  return ThemeData(
    useMaterial3: true,
    scaffoldBackgroundColor: AppColors.bg,
    colorScheme: ColorScheme.light(
      primary: AppColors.primary,
      onPrimary: Colors.white,
      surface: AppColors.surface,
      onSurface: AppColors.text,
    ),
    fontFamily: 'Inter',
    textTheme: const TextTheme(
      displayLarge: TextStyle(fontSize: 48, fontWeight: FontWeight.w300, color: AppColors.text, letterSpacing: -1),
      headlineMedium: TextStyle(fontSize: 28, fontWeight: FontWeight.w300, color: AppColors.text, letterSpacing: -0.5),
      headlineSmall: TextStyle(fontSize: 22, fontWeight: FontWeight.w400, color: AppColors.text),
      bodyLarge: TextStyle(fontSize: 16, fontWeight: FontWeight.w400, color: AppColors.text, height: 1.5),
      bodyMedium: TextStyle(fontSize: 14, fontWeight: FontWeight.w400, color: AppColors.textMuted, height: 1.5),
      labelSmall: TextStyle(fontSize: 12, fontWeight: FontWeight.w400, color: AppColors.textMuted),
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: AppColors.bg,
      foregroundColor: AppColors.text,
      elevation: 0,
      scrolledUnderElevation: 0,
      titleTextStyle: TextStyle(
        fontSize: 16,
        fontWeight: FontWeight.w500,
        color: AppColors.text,
        letterSpacing: -0.3,
      ),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        shape: const StadiumBorder(),
        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
        textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
        elevation: 0,
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: AppColors.text,
        side: const BorderSide(color: AppColors.border),
        shape: const StadiumBorder(),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
        textStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.w500),
      ),
    ),
    dividerTheme: const DividerThemeData(color: AppColors.border, thickness: 1, space: 0),
    cardTheme: CardThemeData(
      color: AppColors.surface,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: const BorderSide(color: AppColors.border),
      ),
      margin: EdgeInsets.zero,
    ),
  );
}
