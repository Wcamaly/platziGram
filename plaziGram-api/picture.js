'use strict'

import { send, json } from 'micro'
import HttpHash from 'http-hash'
import Db from 'platzigram-db'
import DbSub from './test/stub/db'
import config from './config'
import utils from './lib/utils'

const env = process.env.NODE_ENV || 'production'
const hash = HttpHash()
let db = new Db(config.db)

if (env === 'test') {
  db = new DbSub()
}
/**
 * Get Image to DB
 * @param  {OBJ} req     Request to petion
 * @param  {OBJ} res     Response petion
 * @param  {OBJ} params  Paramans in URl
 */
hash.set('GET /:id', async function getPicture (req, res, params) {
  let id = params.id
  await db.connect()
  let image = await db.getImage(id)
  db.disconect()
  send(res, 200, image)
})
/**
 * POst add Image to DB
 * @param  {OBJ} req     Request to petion
 * @param  {OBJ} res     Response petion
 * @param  {OBJ} params  Paramans in URl
 */
hash.set('POST /', async function postPictures (req, res, params) {
  let image = await json(req)
  try {
    let token = await utils.extractToken(req)
    let encode = await utils.verifyToken(token, config.secret)
    if (encode && encode.userID != image.userId)
  } catch (e) {
    return send(res, 401, { error: 'Invalid token' })
  }
  await db.connect()
  let created = await db.saveImage(image)
  await db.disconect()
  send(res, 201, created)
})
/**
 * Post Like plus Image in DB
 * @param  {OBJ} req     Request to petion
 * @param  {OBJ} res     Response petion
 * @param  {OBJ} params  Paramans in URl
 */
hash.set('POST /:id/like', async function postPictures (req, res, params) {
  let id = params.id
  await db.connect()
  let result = await db.likeImage(id)
  await db.disconect()
  send(res, 201, result)
})
/**
 * Post List image
 * @param  {OBJ} req     Request to petion
 * @param  {OBJ} res     Response petion
 * @param  {OBJ} params  Paramans in URl
 */
hash.set('POST /list', async function postPictures (req, res, params) {
  await db.connect()
  let result = await db.getImages()
  await db.disconect()
  send(res, 201, result)
})
/**
 * Post List image contain Tag
 * @param  {OBJ} req     Request to petion
 * @param  {OBJ} res     Response petion
 * @param  {OBJ} params  Paramans in URl
 */
hash.set('GET /tag', async function postPictures (req, res, params) {
  let tag = await json(req).tag
  await db.connect()
  let result = await db.getImageByTag(tag)
  await db.disconect()
  send(res, 200, result)
})

export default async function main (req, res) {
  let { method, url } = req
  let match = hash.get(`${method.toUpperCase()} ${url}`)

  if (match.handler) {
    try {
      await match.handler(req, res, match.params)
    } catch (e) {
      send(res, 500, {error: e.message})
    }
  } else {
    send(res, 404, {error: 'route not found'})
  }
}
