import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'
import { db } from 'src/db/db'
import { getLongDateNow } from 'src/helpers/date'

export const useLocalCustomLocationStore = defineStore('local-custom-locations', {
  state: () => ({
    customLocations: [],
    searchParameters: {
      query: '',
      lastUpdated: null,
      pageNumber: 1
    },
    totalPages: 0,
    searchAbort: new AbortController()
  }),
  getters: {
    getTotalPages (state) {
      return state.totalPages
    },
    getPageNumber (state) {
      return state.searchParameters.pageNumber
    }
  },
  actions: {
    async tryFetchCustomLocationsForOffline () {
      this.searchParameters.lastUpdated = localStorage.getItem('lastImportCustomLocations')

      localStorage.setItem('lastImportCustomLocations', getLongDateNow())

      this.totalPages = 1
      this.searchParameters.pageSize = 500
      this.searchParameters.pageNumber = 0

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
      this.searchParameters.pageSize = 10
      this.searchParameters.pageNumber = 1
    }
  }
})
