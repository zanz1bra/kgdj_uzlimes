# KGDJ Uzlīmes — Android app (WebView wrapper)

This is a minimal Android Studio project that wraps the existing website
(`../index.html`, deployed via Netlify) in a native `WebView`, so your
friends can install an app icon instead of opening a browser every time.

It does **not** duplicate any of the map/Supabase/photo-upload logic — it
just loads your deployed site inside the app. All map, Supabase, and photo
upload behavior continues to run exactly as it does in a normal browser.

## 1. Prerequisites

- [Android Studio](https://developer.android.com/studio) (recent stable version).
- Your site must already be deployed to Netlify (or another public host),
  because the app loads it over the network and the photo upload/delete
  features call `/.netlify/functions/*` on that same origin.

## 2. Set your site URL

Open `app/src/main/res/values/strings.xml` and replace the placeholder:

```xml
<string name="app_url" translatable="false">https://REPLACE-WITH-YOUR-NETLIFY-SITE.netlify.app/</string>
```

with your actual deployed URL, e.g. `https://kgdj-uzlimes.netlify.app/`.

## 3. Open the project

1. Launch Android Studio → **Open** → select this `android/` folder.
2. If Android Studio reports the Gradle wrapper jar is missing, click
   **"OK"/"Fix"** when prompted — Android Studio will regenerate it
   automatically (the binary jar is intentionally not committed to the repo).
3. Let Gradle sync finish (bottom status bar).

## 4. Run it on your phone (recommended first step)

1. Enable Developer Options + USB debugging on your Android phone.
2. Connect it via USB and select it as the run target in Android Studio.
3. Click **Run ▶**. The app should install and open, showing the map.

## 5. Build a shareable `.apk`

1. In Android Studio: **Build → Build App Bundle(s) / APK(s) → Build APK(s)**.
2. Once the build finishes, click the notification link ("locate") to find
   `app/build/outputs/apk/debug/app-debug.apk`.
3. Send that `.apk` file to your friends over WhatsApp (or any file
   transfer). They'll need to allow "install unknown apps" for
   WhatsApp/Files the first time — this is expected for apps installed
   outside the Play Store.

   This debug APK is fine for a private friend-group project. If you ever
   want a smaller/optimized build, use **Build → Generate Signed App Bundle
   / APK** to make a signed release APK instead.

## What the wrapper does (and doesn't do)

- Loads the deployed site in a full-screen `WebView` (no browser address
  bar), so it feels like a normal app.
- Supports the photo-upload file picker (`<input type="file">` in
  `index.html`) via `onShowFileChooser`.
- Supports the "delete point"/"delete photo" `confirm()` dialogs and
  `alert()` error messages via `onJsConfirm`/`onJsAlert`.
- Android's back button navigates within the page history instead of
  instantly closing the app.
- Pull-to-refresh reloads the page.
- No offline support: since the app just loads your live site, everyone
  needs an internet connection when the app is open, same as before.
- No app icon/store polish beyond the existing `KGDJ_logo_large.png` used
  as the launcher icon.

## Troubleshooting

- **Blank screen / "can't connect"**: double-check `app_url` in
  `strings.xml` matches your live Netlify URL exactly (including `https://`
  and trailing slash), and that the site is publicly reachable.
- **Photo upload does nothing**: make sure you picked an image and that
  your Netlify Functions/Supabase environment variables are configured on
  the deployed site (this app doesn't add or change any backend behavior).
