import { defineStore } from 'pinia'
import { Platform } from 'quasar'

export const useLocationStore = defineStore('location', {
  state: () => ({
    locationUpdates: [],
    foregroundLocationActivated: false,
    isCordova: Platform.is.cordova,
    projection: null,
    rotation: 45,
    watchId: null,
    locationTracking: false,
    navigationActive: false,
    myLocation: [],
    myLocationCoordinates: [],
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
    getMyLocationCoordinates (state) {
      return state.myLocationCoordinates
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
          this.locationUpdates.map(update => update.locationUpdated(location, this.projection))
        })

        this.watchId = navigator.compass.watchHeading((heading) => {
          this.rotation = heading.magneticHeading
        }, (compassError) => {
          alert('Compass error: ' + compassError.code)
        }, {
          frequency: 1000
        })
      }
      navigator.geolocation.watchPosition((position) => {
        if (this.foregroundLocationActivated && position.coords.accuracy > 10 && this.isCordova) {
          return
        }

        this.locationUpdates.map(update => update.locationUpdated(position.coords, this.projection))
      }, (code, message) => {
        console.error('Error when trying to fetch location', code, message)
      }, {
        enableHighAccuracy: true
      })
    },
    toggleLocationTracking () {
      this.locationTracking = !this.locationTracking
      if (this.isCordova) {
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
      this.locationUpdates.map(update => update.locationStopped())
    },
    registerForLocationUpdates (locationUpdate) {
      this.locationUpdates.push(locationUpdate)
    },
    updateMyLocation (coords, myLocation) {
      this.myLocation = myLocation
      this.myLocationCoordinates = coords
    },
    updateMyTrack (coords) {
      this.myTrack.push(coords)
    },
    updateNavigation (coords) {
      this.navigateTo = coords.length === 0 ? [] : [this.goTo.getGeometry().getCoordinates(), coords]
    }
  }
})
