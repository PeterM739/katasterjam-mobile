import Dexie from 'dexie'

export const db = new Dexie('kataster-jam-db')

db.version(2).stores({
  tiles: '++id, tile_key, image, importId',
  caveImports: '++id, numberOfCaves',
  caves: 'caveNumber, name, length, depth, organization, registrationYear, x, y, lat, lng',
  customLocations: 'externalId, id, name, description, type, typeId, isAuthor, organizations, lat, lng'
})
