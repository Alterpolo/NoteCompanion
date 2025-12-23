# Configuration Android SDK 36.1 pour Note Companion - 23 décembre 2025

## Configuration appliquée

Android SDK 36.1 est maintenant installé et configuré pour le projet mobile.

### Modifications effectuées

#### 1. [app.config.ts](../packages/mobile/app.config.ts:140-154)

Ajout de la configuration complète pour Android SDK 36 dans expo-build-properties :

```typescript
[
  "expo-build-properties",
  {
    android: {
      compileSdkVersion: 36,
      targetSdkVersion: 36,
      buildToolsVersion: "36.1.0",
      minSdkVersion: 24,
      usesCleartextTraffic: true,
    },
    ios: {
      useFrameworks: "static",
      syncPlugins: false,
    },
  },
],
```

**Changements :**
- ✅ `compileSdkVersion: 36` (ajouté)
- ✅ `targetSdkVersion: 36` (ajouté)
- ✅ `buildToolsVersion: "36.1.0"` (ajouté)
- ✅ `minSdkVersion: 24` (ajouté)
- ✅ `usesCleartextTraffic: true` (déjà présent)

#### 2. [gradle.properties](../packages/mobile/android/gradle.properties:66)

Mise à jour de la version des build tools :

```properties
android.buildToolsVersion=36.1.0
```

**Changement :** 35.0.0 → 36.1.0

## Prochaines étapes pour builder

### Étape 1 : Nettoyer le projet

Pour éviter les conflits avec l'ancienne configuration, nettoyer complètement :

```bash
cd packages/mobile

# Nettoyer les node_modules et cache
pnpm clean

# Réinstaller les dépendances
pnpm install

# Nettoyer le cache Gradle
cd android
./gradlew clean
rm -rf .gradle build app/build
cd ..
```

### Étape 2 : Reconstruire les fichiers natifs (IMPORTANT)

Cette commande va régénérer le dossier `android/` avec les nouvelles configurations :

```bash
cd packages/mobile
npx expo prebuild --clean
```

**Note :** Cette commande applique les configurations de `expo-build-properties` au projet Android natif.

### Étape 3 : Builder l'application

#### Option A : Build depuis WSL (recommandé)

```bash
cd packages/mobile
npx expo run:android
```

Cette commande :
- Compile l'application
- Installe sur un émulateur ou appareil connecté
- Lance l'application

#### Option B : Build APK debug depuis Gradle

```bash
cd packages/mobile/android
./gradlew assembleDebug
```

L'APK sera dans : `android/app/build/outputs/apk/debug/app-debug.apk`

#### Option C : Build APK release depuis Gradle

```bash
cd packages/mobile/android
./gradlew assembleRelease
```

L'APK sera dans : `android/app/build/outputs/apk/release/app-release.apk`

**⚠️ Rappel :** Le build release utilise actuellement le keystore de debug (non sécurisé pour production).

### Étape 4 : Ouvrir dans Android Studio (si nécessaire)

Si tu veux utiliser Android Studio :

1. **Depuis Windows**, ouvrir Android Studio
2. Ouvrir le projet : `\\wsl$\Ubuntu\home\jean-paul\projects\NoteCompanion\packages\mobile\android`
3. Ou créer un `local.properties` avec le SDK path Windows :
   ```properties
   sdk.dir=C\:\\Users\\[USER]\\AppData\\Local\\Android\\Sdk
   ```
4. Sync Gradle
5. Build > Make Project

## Vérifications après build

### Vérifier la configuration appliquée

```bash
cd packages/mobile
npx expo config --type public | grep -A20 android
```

Devrait afficher les versions SDK 36.

### Vérifier l'APK généré

```bash
cd packages/mobile/android/app/build/outputs/apk/debug
ls -lh app-debug.apk

# Voir les détails
aapt dump badging app-debug.apk | grep -E "package|sdkVersion|targetSdkVersion"
```

Devrait afficher :
- `minSdkVersion:'24'`
- `targetSdkVersion:'36'`

### Tester l'installation

```bash
# Lister les appareils connectés
adb devices

# Installer l'APK
adb install -r android/app/build/outputs/apk/debug/app-debug.apk

# Lancer l'app
adb shell am start -n com.notecompanion.app/.MainActivity
```

## Résolution de problèmes potentiels

### Problème : "SDK location not found"

**Solution :** Créer `android/local.properties` :
```bash
echo "sdk.dir=/home/[USER]/Android/Sdk" > android/local.properties
```

Ou sous Windows :
```bash
echo "sdk.dir=C:\\Users\\[USER]\\AppData\\Local\\Android\\Sdk" > android/local.properties
```

### Problème : "Installed Build Tools revision 36.1.0 is corrupted"

**Solution :** Réinstaller les build tools depuis Android Studio :
1. Tools > SDK Manager
2. SDK Tools tab
3. Décocher "Android SDK Build-Tools 36.1"
4. Apply
5. Recocher "Android SDK Build-Tools 36.1"
6. Apply

### Problème : Erreurs de dépendances Gradle

**Solution :** Nettoyer le cache Gradle global :
```bash
rm -rf ~/.gradle/caches
cd packages/mobile/android
./gradlew --refresh-dependencies
```

### Problème : Erreur lors de npx expo prebuild

Si `expo prebuild` échoue à cause de plugins :

```bash
# Installer expo-cli si nécessaire
npm install -g @expo/cli

# Réessayer avec verbose
npx expo prebuild --clean --platform android --verbose
```

### Problème : Build échoue avec "Execution failed for task ':app:mergeDebugResources'"

**Solution :** Problème de ressources dupliquées. Vérifier les erreurs spécifiques et :
```bash
cd packages/mobile/android
./gradlew clean
./gradlew :app:dependencies
```

## Compatibilité SDK 36 avec Expo 54

✅ **Confirmé compatible** : Des développeurs ont réussi à utiliser Android SDK 36 avec Expo SDK 54, bien que la documentation officielle recommande SDK 35.

**Avantages de SDK 36 :**
- Support des dernières APIs Android
- Préparation pour les futures exigences Google Play
- Meilleures performances de build

**Points d'attention :**
- Certaines bibliothèques tierces peuvent ne pas être testées avec SDK 36
- La nouvelle architecture RN (`newArchEnabled=true`) peut avoir des incompatibilités
- Tester minutieusement toutes les fonctionnalités

## Commandes de build rapides

```bash
# Build et run en une commande (recommandé)
cd packages/mobile && npx expo run:android

# Build APK debug seulement
cd packages/mobile/android && ./gradlew assembleDebug

# Build APK release seulement
cd packages/mobile/android && ./gradlew assembleRelease

# Build et installer sur appareil
cd packages/mobile/android && ./gradlew installDebug

# Nettoyer et rebuild complet
cd packages/mobile && \
  pnpm clean && \
  pnpm install && \
  npx expo prebuild --clean && \
  npx expo run:android
```

## État actuel du projet

- ✅ Configuration SDK 36.1 appliquée dans app.config.ts
- ✅ gradle.properties mise à jour
- ⏳ Fichiers natifs à régénérer avec `npx expo prebuild --clean`
- ⏳ Build à tester avec la nouvelle configuration

## Prochaine étape recommandée

**Exécuter immédiatement :**

```bash
cd packages/mobile
npx expo prebuild --clean
npx expo run:android
```

Cette commande va :
1. Régénérer les fichiers Android natifs avec SDK 36
2. Builder l'application
3. L'installer et la lancer sur un appareil/émulateur connecté

Si tu n'as pas d'appareil connecté, utiliser d'abord :
```bash
# Lancer un émulateur Android
emulator -avd [NOM_AVD]

# Ou lister les AVDs disponibles
emulator -list-avds
```
