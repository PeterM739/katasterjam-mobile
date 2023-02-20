# Kataster jam

Aplikacija za terensko delo popisa jam

## Install Cordova
Follow instructions here (chapter #1): https://quasar.dev/quasar-cli-vite/developing-cordova-apps/preparation

(install Android Studio, set up PATH, etc... you can skip chapters #2, #3 and #4 - they are already done)
```bash
npm install -g cordova
```

## Install the dependencies
```bash
npm install
# install cordova dependencies
cd src-cordova
cordova platform add android@11
npm install
# check if everything is set up correctly
cordova requirements
```

### Start the app in development mode
```bash
npm run dev
# or run cordova in dev mode
npm run mobile
```

### Build the app for production
```bash
# build full android package
npm run build-mobile
# only update www files (faster)
npm run mobile-update
```
