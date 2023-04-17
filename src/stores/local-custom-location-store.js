import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'
import { db } from 'src/db/db'
import { getLongDateNow } from 'src/helpers/date'
import { Platform } from 'quasar'
import { getDistance } from 'ol/sphere'

export const useLocalCustomLocationStore = defineStore('local-custom-locations', {
  state: () => ({
    customLocations: [],
    searchParameters: {
      query: '',
      lastUpdated: null,
      pageNumber: 1,
      pageSize: 10,
      sort: ''
    },
    totalPages: 0
  }),
  getters: {
    getCustomLocations (state) {
      return state.customLocations
    },
    getTotalPages (state) {
      return state.totalPages
    },
    getPageNumber (state) {
      return state.searchParameters.pageNumber
    }
  },
  actions: {
    clearLocationParameters () {
      this.searchParameters = {
        query: this.searchParameters.query,
        pageNumber: 1,
        pageSize: 10,
        sort: ''
      }
    },
    addQueryParameter (query) {
      this.searchParameters.query = query
    },
    incrementPageNumber () {
      this.searchParameters.pageNumber++
    },
    async get (id) {
      const result = await db.customLocations.where('id').equals(parseInt(id)).first()

      return result
    },
    async put (customLocation) {
      await db.customLocations.put(customLocation)
    },
    async tryFetchCustomLocationsForOffline () {
      this.searchParameters.lastUpdated = localStorage.getItem('lastImportCustomLocations')
      const dateNow = getLongDateNow()

      this.totalPages = 1
      this.searchParameters.pageSize = 500
      this.searchParameters.pageNumber = 0
      try {
        while (this.searchParameters.pageNumber < this.totalPages) {
          this.searchParameters.pageNumber += 1
          const response = await api.get('/api/customlocations', {
            params: this.searchParameters
          })

          const pagination = JSON.parse(response.headers.pagination)
          this.totalPages = pagination.totalPages
          const customLocations = response.data

          await db.customLocations.bulkPut(customLocations)
        }

        localStorage.setItem('lastImportCustomLocations', dateNow)
      } catch (error) {
        console.error('Error occured while searching for new custom locations')
      } finally {
        this.searchParameters.pageSize = 10
        this.searchParameters.pageNumber = 1
      }
    },
    async search () {
      if (this.searchParameters.sort === 'distance') {
        await this.searchForNearby()
        return
      }

      let query = db.customLocations.orderBy('id').reverse()

      if (this.searchParameters.query && isNaN(this.searchParameters.query)) {
        const queryLower = this.searchParameters.query.toLowerCase()
        query = query.filter((item) => {
          return item.name.toLowerCase().indexOf(queryLower) > -1
        })
      }

      this.totalPages = Math.ceil(await query.count() / this.searchParameters.pageSize)
      const queryWithOffset = query.offset((this.searchParameters.pageNumber - 1) * this.searchParameters.pageSize)
        .limit(this.searchParameters.pageSize)
        .toArray()

      const localCustomLocations = await queryWithOffset
      if (this.searchParameters.pageNumber > 1) {
        localCustomLocations.map(customLocation => this.customLocations.push(customLocation))
      } else {
        this.customLocations = localCustomLocations
      }
    },
    async searchForNearby () {
      this.searchParameters.sort = 'distance'
      if (Platform.is.cordova) {
        window.BackgroundGeolocation.getCurrentLocation(async (location) => {
          const closestCustomLocations = await this.getClosestFor(location)

          if (this.searchParameters.pageNumber > 1) {
            closestCustomLocations.map(customLocation => this.customLocations.push(customLocation))
          } else {
            this.customLocations = closestCustomLocations
          }
        }, (code, message) => {
          console.error('Error when trying to fetch location', code, message)
        }, {
          enableHighAccuracy: true
        })
      } else {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const closestCustomLocations = await this.getClosestFor(position.coords)

          if (this.searchParameters.pageNumber > 1) {
            closestCustomLocations.map(customLocation => this.customLocations.push(customLocation))
          } else {
            this.customLocations = closestCustomLocations
          }
        }, (error) => {
          console.log(error)
        })
      }
    },
    async getClosestFor (coordinates) {
      const customLocations = (await db.customLocations.toArray()).map(customLocation => {
        const distance = getDistance([customLocation.lng, customLocation.lat], [coordinates.longitude, coordinates.latitude])
        return {
          ...customLocation,
          distance
        }
      })
      const skip = (this.searchParameters.pageNumber - 1) * this.searchParameters.pageSize

      return customLocations.sort((a, b) => a.distance - b.distance)
        .slice(skip, skip + this.searchParameters.pageSize)
    }
  }
})
