import lodash from 'lodash'
const Cloudant = require('cloudant')

try {
  require('dotenv').load()
} catch (err) { }
const account: string = process.env.CLOUDANT_USERNAME || ''
const key: string = process.env.CLOUDANT_API_KEY || ''
const password: string = process.env.CLOUDANT_API_PASSWORD || ''


export class CloudantController {
  cloudant: any;

  constructor() {
    this.cloudant = Cloudant({ account, key, password })
  }

  // NEEDS _admin permission
  createDatabase(dbName: string): Promise<{} | null> {
    return new Promise<{} | null>((resolve, reject) => {
      this.cloudant.db.create(dbName, (err, body, header) => {
        if (err) {
          console.error(err)
          reject(null)
          return
        }
        console.log('Create Database')
        console.log(body)
        resolve(body)
      })
    })
  }

  // NEEDS _admin permission
  dropDatabase(dbName: string): Promise<{} | null> {
    return new Promise<{} | null>((resolve, reject) => {
      this.cloudant.db.destroy(dbName, (err, body, header) => {
        if (err) {
          console.error(err)
          reject(null)
          return
        }
        console.log('Destroy Database')
        console.log(body)
        resolve(body)
      })
    })
  }

  private use(dbName: string): any {
    return this.cloudant.db.use(dbName)
  }

  insertDocument<T>(dbName: string, insertObj: T, _id?: string): Promise<{} | null> {
    return new Promise<{} | null>((resolve, reject) => {
      const db = this.use(dbName)
      const temp = lodash.defaultsDeep<T, T>(insertObj, _id ? { _id: _id } : {})
      db.insert(temp, (err, body, header) => {
        if (err) {
          console.error(err)
          reject(null)
          return
        }
        console.log('Insert Document')
        console.log(body)
        resolve(body)
      })
    })
  }

  getDocument<T>(dbName: string, _id: string): Promise<T | null> {
    return new Promise<T | null>((resolve, reject) => {
      const db = this.use(dbName)
      db.get(_id, (err, data, header) => {
        if (err) {
          console.error(err)
          reject(null)
          return
        }
        console.log('Get Document')
        console.log(data)
        resolve(data)
      })
    })
  }

  deleteDocument(dbName: string, deleteObj: DocumentBase): Promise<{} | null> {
    return new Promise<{} | null>((resolve, reject) => {
      const db = this.use(dbName)
      db.destroy(deleteObj._id, deleteObj._rev, (err, body, header) => {
        if (err) {
          console.error(err)
          reject(null)
          return
        }
        console.log('Delete Document')
        console.log(body)
        resolve(body)
      })
    })
  }

  searchDocument<T>(dbName: string, designName: string, indexName: string, searchText: string): Promise<T | null> {
    return new Promise<T | null>((resolve, reject) => {
      const db = this.use(dbName)
      db.search(designName, indexName, { q: searchText }, (err, result, header) => {
        if (err) {
          console.error(err)
          reject(null)
          return
        }
        console.log('Search Document')
        console.log(result)
        resolve(result)
      })
    })
  }

}



export interface DocumentBase {
  _id?: string
  _rev?: string
}

export interface SearchResult<T> {
  total_rows: number
  bookmark: string
  rows: SearchResultRow<T>[]
}

interface SearchResultRow<T> {
  id: string
  order: number[]
  fields: T
}