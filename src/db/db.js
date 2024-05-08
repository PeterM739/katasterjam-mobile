import Dexie from 'dexie'

export const db = new Dexie('kataster-jam-db')

db.version(4).stores({
  tiles: '++id, tileKey, image, offlineId',
  offlineStore: '++id, name',
  caveImports: '++id, numberOfCaves',
  caves: 'caveNumber, name, length, depth, organization, registrationYear, x, y, lat, lng',
  customLocations: 'externalId, id, name, description, type, typeId, isAuthor, organizations, lat, lng, createdDate',
  customLocationsTypes: 'id, name, description',
  customLocationsStatuses: 'id, name, description',
  files: 'externalId, fkId, id, data, fileName, mimeType'
})
