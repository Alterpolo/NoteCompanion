# Android Production Build Status

## Date: 2025-12-26

## Objective
Build a production APK for the NoteCompanion mobile app that connects to the self-hosted server at `https://notecomp.neodromes.eu`.

## Problem Solved
The Expo dev client couldn't connect to Metro bundler due to WSL/Windows network isolation. Building a production APK embeds the JS bundle, eliminating the need for Metro connection.

## Critical Fix Applied

### Metro 0.83+ SourceMetadataMapConsumer Breaking Change
A patch was applied to `node_modules/react-native/scripts/compose-source-maps.js` to handle a breaking change where `SourceMetadataMapConsumer` was removed/renamed in Metro 0.83+.

**Patched code (lines 59-68):**
```javascript
let composedMapJSON;
try {
  composedMapJSON = JSON.stringify(
    composeSourceMaps([packagerSourcemap, compilerSourcemap]),
  );
} catch (e) {
  // Fallback: use packager sourcemap if composition fails (Metro 0.83+ compatibility)
  console.warn('Warning: Source map composition failed, using packager sourcemap. Error:', e.message);
  composedMapJSON = JSON.stringify(packagerSourcemap);
}
```

**Note:** This patch is in `node_modules` and will be lost on `pnpm install`. Consider:
- Adding a `postinstall` script to reapply the patch
- Using `patch-package` to persist the fix
- Or documenting it clearly for manual reapplication

## Environment Configuration

### `.env` file (`packages/mobile/.env`)
```
EXPO_PUBLIC_API_URL=https://notecomp.neodromes.eu
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_bWFnbmV0aWMtYnJlYW0tMjQuY2xlcmsuYWNjb3VudHMuZGV2JA
EXPO_PUBLIC_UPGRADE_CHECKOUT_URL=https://notecomp.neodromes.eu/upgrade-from-mobile
```

## Build Command
```bash
cd /home/jean-paul/projects/NoteCompanion/packages/mobile/android
./gradlew assembleRelease
```

## APK Output Location
```
packages/mobile/android/app/build/outputs/apk/release/app-release.apk
```

## Build Configuration
- SDK: 36 (Android 16)
- Build Tools: 36.1.0
- NDK: 27.1.12297006
- Kotlin: 2.1.20
- Target architectures: arm64-v8a, armeabi-v7a, x86, x86_64
- JS Bundle: 1875 modules bundled

## Testing Steps (Next Thread)
1. Verify APK exists at output location
2. Start Android emulator
3. Install APK: `adb install <path-to-apk>`
4. Test app connection to `https://notecomp.neodromes.eu`
5. If working, transfer APK to Honor 200 phone for physical device testing

## Build Status: ✅ SUCCESSFUL

**Completed:** 2025-12-26 15:33 CET
**APK Size:** ~106 MB (110,734,678 bytes)

## Known Issues
- The SDK directory warning during build is benign (WSL path vs Windows path mismatch)
- First build takes ~15-20 minutes due to native module compilation
- Subsequent builds are much faster (cached)

## Next Steps (For Next Thread)
1. Start Android emulator: `/mnt/c/Users/Jean-Paul/AppData/Local/Android/Sdk/emulator/emulator.exe -avd <avd-name>`
2. Install APK: `/mnt/c/Users/Jean-Paul/AppData/Local/Android/Sdk/platform-tools/adb.exe install /home/jean-paul/projects/NoteCompanion/packages/mobile/android/app/build/outputs/apk/release/app-release.apk`
3. Test app connection to `https://notecomp.neodromes.eu`
4. Test file upload flow
5. If working, transfer APK to Honor 200 phone (Android 14) for physical device testing
