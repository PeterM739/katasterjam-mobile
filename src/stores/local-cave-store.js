import { defineStore } from 'pinia'
import { db } from 'src/db/db'
import { api } from 'src/boot/axios'
import * as olProj from 'ol/proj'

export const useCavesStore = defineStore('caves', {
  state: () => ({
    caves: [],
    searchParameters: {
      pageNumber: 1,
      pageSize: 500
    },
    totalPages: 1
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
    async tryFetchCavesForOffline () {
      const importResponse = await api.get('/api/caves/imports/latest', {
        params: this.searchParameters
      })

      const importRecord = await db.caveImports.orderBy('id').last()
      if (importRecord && importRecord.id === importResponse.data.id) {
        return
      }

      await db.caveImports.put(importResponse.data)
      this.totalPages = importResponse.data.numberOfCaves
      this.searchParameters.pageNumber = 0
      while (this.searchParameters.pageNumber < this.totalPages) {
        this.searchParameters.pageNumber += 1
        const response = await api.get('/api/caves', {
          params: this.searchParameters
        })
        const pagination = JSON.parse(response.headers.pagination)
        this.totalPages = pagination.totalPages
        const caves = response.data.map(cave => {
          const xy = olProj.fromLonLat([cave.lng, cave.lat])

          return {
            x: xy[0],
            y: xy[1],
            ...cave
          }
        })
        await db.caves.bulkPut(caves)
      }
    }
  }
})
