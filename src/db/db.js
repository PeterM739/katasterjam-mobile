import Dexie from 'dexie'

export const db = new Dexie('kataster-jam-db')

db.version(3).stores({
  tiles: '++id, tileKey, image, offlineId',
  offlineStore: '++id, name',
  caveImports: '++id, numberOfCaves',
  caves: 'caveNumber, name, length, depth, organization, registrationYear, x, y, lat, lng'
})
