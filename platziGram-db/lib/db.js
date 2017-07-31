'use strict'
const r = require('rethinkdb')
const co = require('co')
const Promise = require('bluebird')
const uuid = require('uuid-base62')
const utils = require('./utils')

const defaults = {
  host: 'localhost',
  port: 28015,
  db: 'platzigram'
}

class Db {
  /**
   * Function contructor
   * @param  {OBJ}
   */
  constructor (options) {
    options = options || {}
    this.host = options.host || defaults.host
    this.port = options.port || defaults.port
    this.db = options.db || defaults.db
    this.setup = options.setup || false
  }

  connect (cb) {
    this.connection = r.connect({
      host: this.host,
      port: this.port
    })
    this.connected = true
    let db = this.db
    let connection = this.connection
    if (!this.setup) {
      return Promise.resolve(connection).asCallback(cb)
    }
    let setup = co.wrap(function * () {
      let conn = yield connection
      let dbList = yield r.dbList().run(conn)
      if (dbList.indexOf(db) === -1) {
        yield r.dbCreate(db).run(conn)
      }

      let dbTables = yield r.db(db).tableList().run(conn)
      if (dbTables.indexOf('images') === -1) {
        yield r.db(db).tableCreate('images').run(conn)
        yield r.db(db).table('images').indexCreate('createdAt').run(conn)
        yield r.db(db).table('images').indexCreate('userId', {multi: true}).run(conn)
      }
      if (dbTables.indexOf('users') === -1) {
        yield r.db(db).tableCreate('users').run(conn)
        yield r.db(db).table('users').indexCreate('username').run(conn)
      }

      return conn
    })

    return Promise.resolve(setup()).asCallback(cb)
  }

  disconnect (cb) {
    if (!this.connected) {
      return Promise.reject(new Error('not connected')).asCallback(cb)
    }
    this.connected = false
    return Promise.resolve(this.connection).then((conn) => conn.close())
  }
  /**
   * @param
   *    image Obj
   *    cb callback error
   * @return
   *    promise resolve Image save
   */
  saveImage (image, cb) {
    if (!this.connected) {
      return Promise.reject(new Error('not connected')).asCallback(cb)
    }
    let connection = this.connection
    let db = this.db

    let tasks = co.wrap(function * () {
      let conn = yield connection
      image.createdAt = new Date()
      image.tags = utils.extractTags(image.description)
      let result = yield r.db(db).table('images').insert(image).run(conn)

      if (result.errors > 0) {
        return Promise.reject(new Error(result.first_error))
      }
      image.id = result.generated_keys[0]

      yield r.db(db).table('images').get(image.id).update({
        publicId: uuid.encode(image.id)
      }).run(conn)

      let created = yield r.db(db).table('images').get(image.id).run(conn)

      return Promise.resolve(created)
    })

    return Promise.resolve(tasks()).asCallback(cb)
  }
  /**
   * @param
   *    id type String
   *    cb callback error
   * @return
   *  promise resolve Image add like
   */
  likeImage (id, cb) {
    if (!this.connected) {
      return Promise.reject(new Error('not connected')).asCallback(cb)
    }
    let connection = this.connection
    let db = this.db
    let imageId = uuid.decode(id)
    let getImage = this.getImage.bind(this)
    let tasks = co.wrap(function * () {
      let conn = yield connection
      let image = yield getImage(id)

      yield r.db(db).table('images').get(imageId).update({
        liked: true,
        likes: image.likes + 1
      }).run(conn)
      let created = getImage(id)
      return Promise.resolve(created)
    })

    return Promise.resolve(tasks()).asCallback(cb)
  }
  /**
   * @param
   *    id type String
   *    cb callback error
   * @return
   *    promise resolve get Image  with id
   */
  getImage (id, cb) {
    if (!this.connected) {
      return Promise.reject(new Error('not connected')).asCallback(cb)
    }
    let connection = this.connection
    let db = this.db
    let imageId = uuid.decode(id)

    let tasks = co.wrap(function * () {
      let conn = yield connection
      let image = yield r.db(db).table('images').get(imageId).run(conn)
      if (!image) {
        return Promise.reject(new Error(`image ${imageId} not found`))
      }
      return Promise.resolve(image)
    })

    return Promise.resolve(tasks()).asCallback(cb)
  }
   /**
   * @param
   * @return
   *    promise resolve get Image  with id
   */
  getImages () {
    if (!this.connected) {
      return Promise.reject(new Error('not connected'))
    }
    let connection = this.connection
    let db = this.db

    let tasks = co.wrap(function * () {
      let conn = yield connection
      let images = yield r.db(db).table('images').orderBy({
        index: r.desc('createdAt')
      }).run(conn)
      let result = yield images.toArray()
      return Promise.resolve(result)
    })

    return Promise.resolve(tasks())
  }
  /**
   * @param
   *    user obj
   *    cb calback error
   * @return
   *    promise user created db
   */
  saveUser (user, cb) {
    if (!this.connected) {
      return Promise.reject(new Error('not connected')).asCallback(cb)
    }
    let connection = this.connection
    let db = this.db

    let tasks = co.wrap(function * () {
      let conn = yield connection
      user.password = utils.encrypt(user.password)
      user.createdAt = new Date()

      let result = yield r.db(db).table('users').insert(user).run(conn)

      if (result.errors > 0) {
        return Promise.reject(new Error(result.first_error))
      }
      user.id = result.generated_keys[0]

      let created = yield r.db(db).table('users').get(user.id).run(conn)

      return Promise.resolve(created)
    })

    return Promise.resolve(tasks())
  }
  /**
   * @param
   *    username name user String
   * @return
   *    promise user solicitud obj
   */
  getUser (username) {
    if (!this.connected) {
      return Promise.reject(new Error('not connected'))
    }
    let connection = this.connection
    let db = this.db

    let tasks = co.wrap(function * () {
      let conn = yield connection
      yield r.db(db).table('users').indexWait().run(conn)
      let user = yield r.db(db).table('users').getAll(username, {
        index: 'username'
      }).run(conn)

      let result = null
      try {
        result = yield user.next()
      } catch (e) {
        return Promise.reject(new Error(`user ${username} not found`))
      }

      return Promise.resolve(result)
    })

    return Promise.resolve(tasks())
  }
  /**
   * @param
   *    username name user String
   *    password pass user String
   * @return
   *    boolean
   */
  authenticate (username, password) {
    if (!this.connected) {
      return Promise.reject(new Error('not connected'))
    }
    let getUser = this.getUser.bind(this)

    let tasks = co.wrap(function * () {
      let user = null
      try {
        user = yield getUser(username)
        if (user.password === utils.encrypt(password)) {
          return Promise.resolve(true)
        }
      } catch (e) {
      }
      return Promise.resolve(false)
    })

    return Promise.resolve(tasks())
  }
  /**
   * @param
   *    id String
   * @return
   *    promises array images
   */
  getImageByUser (userId) {
    if (!this.connected) {
      return Promise.reject(new Error('not connected'))
    }
    let connection = this.connection
    let db = this.db

    let tasks = co.wrap(function * () {
      let conn = yield connection
      yield r.db(db).table('images').indexWait().run(conn)
      let images = yield r.db(db).table('images').getAll(userId, {
        index: 'userId'
      }).orderBy(r.desc('createdAt')).run(conn)

      let result = yield images.toArray()
      return Promise.resolve(result)
    })

    return Promise.resolve(tasks())
  }
  /**
   * @param
   *    Tag String
   * @return
   *    promises array images
   */
  getImageByTag (tag) {
    if (!this.connected) {
      return Promise.reject(new Error('not connected'))
    }
    let connection = this.connection
    let db = this.db
    tag = utils.normalize(tag)
    let tasks = co.wrap(function * () {
      let conn = yield connection
      yield r.db(db).table('images').indexWait().run(conn)
      let images = yield r.db(db).table('images').filter((img) => {
        return img('tags').contains(tag)
      }).orderBy(r.desc('createdAt')).run(conn)

      let result = yield images.toArray()
      return Promise.resolve(result)
    })
    return Promise.resolve(tasks())
  }
}
module.exports = Db
