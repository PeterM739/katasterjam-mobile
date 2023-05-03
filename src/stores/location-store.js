import { defineStore } from 'pinia'
import { Platform } from 'quasar'
import { fromLonLat } from 'ol/proj'

export const useLocationStore = defineStore('location', {
  state: () => ({
    foregroundLocationActivated: false,
    isCordova: Platform.is.cordova,
    projection: null,
    rotation: 45,
    watchId: null,
    locationTracking: false,
    navigationActive: false,
    myLocation: {},
    myTrack: [],
    navigateTo: []
  }),

  getters: {
    getProjection (state) {
      return state.projection
    },
    getRotation (state) {
      return state.rotation
    },
    getLocationTracking (state) {
      return state.locationTracking
    },
    getNavigationActive (state) {
      return state.navigationActive
    },
    getMyLocation (state) {
      return state.myLocation
    },
    getMyLocationAccuracy (state) {
      return state.myLocation.accuracy
    },
    getMyLocationCoordinates (state) {
      return state.myLocation.coordinates
    },
    getMyTrack (state) {
      return state.myTrack
    },
    getNavigateTo (state) {
      return state.navigateTo
    },
    foregroundNotNeeded (state) {
      return !state.locationTracking && !state.navigationActive
    }
  },
  actions: {
    initialize (projection) {
      this.projection = projection
      if (this.isCordova) {
        window.BackgroundGeolocation.configure({
          locationProvider: window.BackgroundGeolocation.DISTANCE_FILTER_PROVIDER,
          desiredAccuracy: window.BackgroundGeolocation.MEDIUM_ACCURACY,
          stationaryRadius: 10,
          distanceFilter: 10, // only when using location provider: DISTANCE_FILTER_PROVIDER
          stopOnTerminate: false,
          debug: true,
          startForeground: true,
          notificationsEnabled: true, // try using non background and then apply foreground when start tracking or when start navigation in this case location button can be used to center to current location
          httpHeaders: { 'X-Auth': 'če ga rabiš' },
          interval: 5000, // only when using location provider: ACTIVITY_PROVIDER
          fastestInterval: 2000, // only when using location provider: ACTIVITY_PROVIDER
          activitiesInterval: 1000 // only when using location provider: ACTIVITY_PROVIDER
          // url: 'https://katasterjam.si/api/track',
          // syncUrl: 'https://katasterjam.si/api/sync'
        })

        window.BackgroundGeolocation.on('authorization', (status) => {
          if (status !== window.BackgroundGeolocation.AUTHORIZED) {
            setTimeout(() => {
              navigator.notification.confirm('Please enable location access', b => {
                if (b === 1) {
                  window.BackgroundGeolocation.showAppSettings()
                }
              }, 'Kataster jam')
            }, 1000)
          }
        })

        window.BackgroundGeolocation.on('location', (location) => {
          this.newLocationUpdate(location)
        })

        this.initCompass()
        document.addEventListener('pause', (ev) => {
          console.log('pause: ', this.watchId)

          if (this.watchId) {
            navigator.compass.clearWatch(this.watchId)
          }
        }, false)
        document.addEventListener('resume', (ev) => {
          console.log('resume: ', this.watchId)
          this.initCompass()
        }, false)
      }
      navigator.geolocation.watchPosition((position) => {
        if (this.foregroundLocationActivated && position.coords.accuracy > 10 && this.isCordova) {
          return
        }
        this.newLocationUpdate(position.coords)
      }, (code, message) => {
        console.error('Error when trying to fetch location', code, message)
      }, {
        enableHighAccuracy: true
      })
    },
    newLocationUpdate (location) {
      const coords = fromLonLat([location.longitude, location.latitude])
      this.myLocation = {
        coordinates: coords,
        accuracy: location.accuracy,
        latitude: location.latitude,
        longitude: location.longitude
      }
      if (this.getLocationTracking) {
        this.updateMyTrack(coords)
      }
      if (this.getNavigationActive) {
        this.updateNavigation(coords)
      }
    },
    toggleLocationTracking () {
      this.locationTracking = !this.locationTracking
      if (this.locationTracking && this.isCordova) {
        window.BackgroundGeolocation.configure({
          notificationTitle: 'Location tracking',
          notificationText: 'Tracking your location is in progress'
        })
      }
      this.locationTracking ? this.startForeground() : this.stopForeground()
    },
    stopNavigation () {
      this.navigationActive = false
      this.stopForeground()
      this.updateNavigation([])
    },
    startNavigation (goTo) {
      this.goTo = goTo
      if (this.navigateTo.length === 2) {
        this.navigateTo[0] = this.goTo.getGeometry().getCoordinates()
      }
      if (this.isCordova) {
        window.BackgroundGeolocation.configure({
          notificationTitle: 'Navigation',
          notificationText: 'Navigation to a location is in progress'
        })
      }
      this.navigationActive = true
      this.startForeground()
    },
    startForeground () {
      if (!this.foregroundLocationActivated) {
        if (this.isCordova) {
          window.BackgroundGeolocation.start()
        }
        this.foregroundLocationActivated = true
      }
    },
    stopForeground () {
      if (this.foregroundLocationActivated && this.foregroundNotNeeded) {
        if (this.isCordova) {
          window.BackgroundGeolocation.stop()
        }
        this.foregroundLocationActivated = false
      }
    },
    updateMyTrack (coords) {
      this.myTrack.push(coords)
    },
    updateNavigation (coords) {
      this.navigateTo = coords.length === 0 ? [] : [this.goTo.getGeometry().getCoordinates(), coords]
    },
    initCompass () {
      this.watchId = navigator.compass.watchHeading((heading) => {
        this.rotation = heading.magneticHeading
      }, (compassError) => {
        alert('Compass error: ' + compassError.code)
      }, {
        frequency: 1000
      })
    }
  }
})
