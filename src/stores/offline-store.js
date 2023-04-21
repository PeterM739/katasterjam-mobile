import { defineStore } from 'pinia'
import { db } from 'src/db/db'
import { loadWmtsTilesFor, loadXYZTilesFor } from 'src/utils/layers'
import { getDateTime } from 'src/helpers/date'
import { CancellationTokenSource } from 'src/utils/cancelation-token'

export const useOfflineStore = defineStore('offline-store', {
  state: () => ({
    dialog: false,
    offlineRecords: [],
    offlineManagers: {
      customLocations: async (extent, offlineId, update, inProgress) => {
        // TBD
        // const store = useLocalCustomLocationStore()
        // store.setExtent(extent)
        // await store.search()

        console.log('save custom locations for offline use')
        return 0
      },
      osm: async (offlineRequest) => {
        const url = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
        return await loadXYZTilesFor(offlineRequest, url, 'OSM', true)
      },
      cavesLayer: async function (offlineRequest) {
        const url = 'https://services7.arcgis.com/V2VriwTjJDabpGg6/ArcGIS/rest/services/2022_marec_export_ekataster_tile_layer/MapServer/WMTS/tile/1.0.0/2022_marec_export_ekataster_tile_layer/default/default028mm/{z}/{y}/{x}.png'
        return await loadXYZTilesFor(offlineRequest, url, 'Caves', false)
      },
      lidar: async (offlineRequest) => {
        return await loadWmtsTilesFor(offlineRequest, 'Lidar')
      },
      ortophoto: async (offlineRequest) => {
        return await loadWmtsTilesFor(offlineRequest, 'Ortho')
      }

    },
    allContent: 0,
    currentContent: 0,
    progress: 0.0,
    cancelationToken: new CancellationTokenSource()
  }),
  getters: {
    getShowDialog (state) {
      return state.dialog
    },
    getOfflineRecords (state) {
      return state.offlineRecords
    }
  },
  actions: {
    showDialog () {
      this.dialog = true
    },
    hideDialog () {
      this.dialog = false
      this.cancelationToken.cancel()
    },
    async transferData (selectedItems, ext, name) {
      this.cancelationToken = new CancellationTokenSource()
      const offlineRecord = {
        date: getDateTime(),
        name,
        extent: [...ext],
        selectedItems: [...selectedItems]
      }
      const offlineStoreId = await db.offlineStore.add(offlineRecord)
      this.allContent = selectedItems.length
      let totalSize = 0

      for (let i = 0; i < selectedItems.length; i++) {
        this.currentContent += 1
        try {
          this.progress = 0
          const offlineRequest = {
            extent: ext,
            offlineId: offlineStoreId,
            update: (prog) => {
              this.progress = prog
            },
            inProgress: this.cancelationToken.token
          }
          totalSize += await this.offlineManagers[selectedItems[i]](offlineRequest)
        } catch (error) {
          if (error.message === 'Cancelled!') {
            await this.deleteAll(offlineStoreId)
            this.allContent = 0
            this.currentContent = 0
            this.dialog = false
            return
          }
          console.log('Not implemented yet for item: ', selectedItems[i])
        }
      }
      this.allContent = 0
      this.currentContent = 0
      await db.offlineStore.put({
        ...offlineRecord,
        totalSize
      })
      this.dialog = false
    },
    async searchRecords () {
      this.offlineRecords = await db.offlineStore.toArray()
    },
    async get (id) {
      return await db.offlineStore.where('id').equals(parseInt(id)).first()
    },
    async getNumberOfTiles (offlineId) {
      return await db.tiles.where('offlineId').equals(parseInt(offlineId)).count()
    },
    async deleteAll (recordId) {
      await db.tiles.where('offlineId').equals(parseInt(recordId)).delete()
      await db.offlineStore.where('id').equals(parseInt(recordId)).delete()
    }
  }
})
