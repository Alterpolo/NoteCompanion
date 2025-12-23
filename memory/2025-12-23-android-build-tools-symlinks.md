# Android Build Tools Symlinks Fix for WSL

**Date**: 2025-12-23
**Issue**: Building Android apps from WSL with Windows Android SDK fails with "AAPT not found" errors
**Solution**: Create symlinks for all .exe files in build-tools directory

## Problem

When building Android applications from WSL using the Windows Android SDK, Gradle expects to find build tools without the `.exe` extension (e.g., `aapt`, `aapt2`, `dexdump`). However, the Windows SDK only provides these tools with the `.exe` extension (`aapt.exe`, `aapt2.exe`, `dexdump.exe`).

This causes build failures with errors like:
```
Build-tool 36.1.0 is missing AAPT at /mnt/c/Users/Jean-Paul/AppData/Local/Android/Sdk/build-tools/36.1.0/aapt
Could not determine the dependencies of task ':app:compileDebugJavaWithJavac'.
Installed Build Tools revision 36.1.0 is corrupted.
```

## Root Cause

- Gradle (running in WSL Linux environment) looks for tools without extensions
- Windows SDK provides tools with .exe extensions
- WSL can access Windows filesystem via `/mnt/c/` but the extension mismatch causes Gradle to fail

## Solution

Create symbolic links for all .exe files in the build-tools directory:

```bash
cd /mnt/c/Users/Jean-Paul/AppData/Local/Android/Sdk/build-tools/36.1.0
for exe in *.exe; do
  base=${exe%.exe}
  if [ ! -e "$base" ]; then
    ln -sf "$exe" "$base"
    echo "Created: $base -> $exe"
  fi
done
```

This creates symlinks like:
- `aapt -> aapt.exe`
- `aapt2 -> aapt2.exe`
- `aidl -> aidl.exe`
- `dexdump -> dexdump.exe`
- `zipalign -> zipalign.exe`
- And all linker executables (`ld`, `ld.lld`, etc.)

## Why This Works

1. Symlinks work across WSL/Windows filesystem boundary
2. When Gradle looks for `aapt`, the symlink redirects to `aapt.exe`
3. Windows executes the .exe file normally
4. Gradle receives the expected output

## When to Apply

This fix must be applied:
- **Once per build tools version** (e.g., if you upgrade from 36.1.0 to 37.0.0, repeat for new version)
- **After fresh Android SDK installation**
- **When switching between different build tools versions in app.config.ts**

## Verification

After creating symlinks, verify they exist:
```bash
ls -la /mnt/c/Users/Jean-Paul/AppData/Local/Android/Sdk/build-tools/36.1.0/aapt
```

Should show:
```
lrwxrwxrwx 1 jean-paul jean-paul 8 Dec 23 10:30 aapt -> aapt.exe
```

## Alternative Solutions Considered

1. **Changing buildToolsVersion**: Would require downgrading, loses access to latest features
2. **Building from Windows CMD**: UNC paths (`\\wsl$\Ubuntu\...`) not supported by Gradle
3. **Installing Linux Android SDK in WSL**: Requires duplicate ~5GB download, maintenance overhead
4. **Wrapper scripts**: More complex, symlinks are simpler and performant

## References

- Project: Note Companion Mobile (Expo SDK 54, React Native 0.81.5)
- Config: `packages/mobile/app.config.ts` - `buildToolsVersion: "36.1.0"`
- Build command: `cd /home/jean-paul/projects/NoteCompanion/packages/mobile/android && ./gradlew assembleDebug`
