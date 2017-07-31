'use strict'

import { send, json } from 'micro'
import HttpHash from 'http-hash'
import Db from 'platzigram-db'
import DbSub from './test/stub/db'
import config from './config'

const env = process.env.NODE_ENV || 'production'
const hash = HttpHash()
let db = new Db(config.db)

if (env === 'test') {
  db = new DbSub()
}

/**
 * POst add Image to DB
 * @param  {OBJ} req     Request to petion
 * @param  {OBJ} res     Response petion
 * @param  {OBJ} params  Paramans in URl
 */
hash.set('POST /', async function postPictures (req, res, params) {
  let user = await json(params)
  await db.connect()
  let result = await db.saveUser(user)
  await db.disconect()
  send(res, 201, result)
})

/**
 * Get User to DB
 * @param  {OBJ} req     Request to petion
 * @param  {OBJ} res     Response petion
 * @param  {OBJ} params  Paramans in URl
 */
hash.set('GET /:username', async function getPicture (req, res, params) {
  let username = params.username
  await db.connect()
  let user = await db.getUser(username)
  await db.disconect()
  send(res, 200, user)
})
/**
 * @param  {OBJ} req     Request to petion
 * @param  {OBJ} res     Response petion
 * @param  {OBJ} params  Paramans in URl
 */
hash.set('POST /:id/like', async function postPictures (req, res, params) {
})
/**
 * Post List image
 * @param  {OBJ} req     Request to petion
 * @param  {OBJ} res     Response petion
 * @param  {OBJ} params  Paramans in URl
 */
hash.set('POST /list', async function postPictures (req, res, params) {
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
