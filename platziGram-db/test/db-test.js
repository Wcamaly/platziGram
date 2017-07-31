'use strict'
/**
 * Import dependencies
 * @type
 *    test  Ava Depencie external,
 *    Db  Database Dependencie,
 *    uuid  Id genereted dependencie external,
 *    r  conection Db rethinksdb external,
 *    fixture  data default for test
 */
const test = require('ava')
const Db = require('../')
const uuid = require('uuid-base62')
const r = require('rethinkdb')
const fixtures = require('./fixtures/index')
const utils = require('../lib/utils')
/**
 * Connection to DB
 */
test.beforeEach('setup db', async t => {
  const dbName = `plazigram_${uuid.v4()}`
  const db = new Db({db: dbName, setup: true })
  await db.connect()
  t.context.db = db
  t.context.dbName = dbName
  t.true(db.connected, 'should be connect')
})

/**
 * Disconect to DB
 */
test.afterEach.always('cleanUp database', async t => {
  let db = t.context.db
  let dbName = t.context.dbName
  await db.disconnect()
  t.false(db.connected, 'should not be connect')
  let conn = await r.connect({})
  await r.dbDrop(dbName).run(conn)
})
/**
 * Testin for Save Images
 */
test('save image', async t => {
  let db = t.context.db

  t.is(typeof db.saveImage, 'function', 'saveImage is function')
  let image = fixtures.getImage()
  let created = await db.saveImage(image)
  t.is(created.url, image.url)
  t.is(created.description, image.description)
  t.deepEqual(created.tags, ['awesome', 'tags'])
  t.is(created.likes, image.likes)
  t.is(created.liked, image.liked)
  t.is(created.userId, image.userId)
  t.is(typeof created.id, 'string')
  t.is(created.publicId, uuid.encode(created.id))
  t.truthy(created.createdAt)
})
/**
 * Testing add like image
 */
test('Like image', async t => {
  let db = t.context.db
  t.is(typeof db.likeImage, 'function', 'likeImage is a function')

  let image = fixtures.getImage()
  let creted = await db.saveImage(image)
  let result = await db.likeImage(creted.publicId)

  t.true(result.liked)
  t.is(result.likes, image.likes + 1)
})

/**
 * Testin get Image
 */
test('Get image', async t => {
  let db = t.context.db
  t.is(typeof db.getImage, 'function', 'getImage is a function')

  let image = fixtures.getImage(3)
  let created = await db.saveImage(image)
  let result = await db.getImage(created.publicId)

  t.deepEqual(result, created)

  await t.throws(db.getImage('foo'), /not found/)
})
/**
 * testing get images
 */
test('List all Images', async t => {
  let db = t.context.db
  t.is(typeof db.getImages, 'function', 'getImages is a function')

  let images = fixtures.getImages()
  let saveImages = images.map(img => db.sabeImage(img))
  let created = await Promise.all(saveImages)
  let result = await db.getImages()
  t.is(created.length, result.length)
})
/**
 * Testing Save User
 */
test('Save User', async t => {
  let db = t.context.db
  t.is(typeof db.saveUser, 'function', 'saveUser is funciont')

  let user = fixtures.getUser()
  let pass = user.password
  let result = await db.saveUser(user)

  t.is(user.name, result.name)
  t.is(user.email, result.email)
  t.is(user.username, result.username)
  t.is(utils.encrypt(pass), result.password)
  t.is(typeof result.id, 'string')
  t.truthy(result.createdAt)
})
/**
 * Testing get User
 */
test('get user', async t => {
  let db = t.context.db
  t.is(typeof db.getUser, 'function', 'getUser is a function')

  let user = fixtures.getUser()
  let created = await db.saveUser(user)
  let result = await db.getUser(user.username)

  t.deepEqual(result, created)

  await t.throws(db.getUser('foo'), /not found/)
})
/**
 * Testing Authenticate
 */
test('Authenticate User', async t => {
  let db = t.context.db
  t.is(typeof db.authenticate, 'function', 'authenticate is function')

  let user = fixtures.getUser()
  let plainPassword = user.password
  await db.saveUser(user)
  let result = await db.authenticate(user.username, plainPassword)

  t.true(result)

  let fail = await db.authenticate(user.username, '123')

  t.false(fail)

  let failure = await db.authenticate('foo', '123')

  t.false(failure)
})
/**
 * Testing list images for USer
 */
test('list images for user', async t => {
  let db = t.context.db
  t.is(typeof db.getImageByUser, 'function', 'getImageByUser is function')
  let images = fixtures.getImages(10)
  let userId = uuid.uuid()
  let random = Math.floor((Math.random() * images.length) + 1)
  let saveImage = []
  for (let i = 0; i < images.length; i++) {
    if (i < random) {
      images[i].userId = userId
    }
    saveImage.push(db.saveImage(images[i]))
  }

  await Promise.all(saveImage)

  let result = await db.getImageByUser(userId)
  t.is(result.length, random)
})
/**
 * Testing list images for Tag
 */
test('list images for Tag', async t => {
  let db = t.context.db
  t.is(typeof db.getImageByTag, 'function', 'getImageByTag is function')
  let images = fixtures.getImages(10)
  let tag = '#filterit'
  let random = Math.floor((Math.random() * images.length) + 1)
  let saveImage = []
  for (let i = 0; i < images.length; i++) {
    if (i < random) {
      images[i].description = tag
    }
    saveImage.push(db.saveImage(images[i]))
  }

  await Promise.all(saveImage)

  let result = await db.getImageByTag(tag)
  t.is(result.length, random)
})
