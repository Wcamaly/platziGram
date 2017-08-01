'use strict'
import test from 'ava'
import micro from 'micro'
import listen from 'test-listen'
import request from 'request-promise'
import picture from '../picture'
import fixture from './fixtures/'
import utils from '../lib/utils'
import config from '../config'
/**
 * Before Test create micro
 */
test.beforeEach(async t => {
  let srv = micro(picture)
  t.context.url = await listen(srv)
})
/**
 * Testing View Image GET /:id
 */
test('GET /:id', async t => {
  let image = fixture.getImage()
  let url = t.context.url

  let body = await request({
    url: `${url}/${image.publicId}`,
    json: true
  })

  t.deepEqual(body, image)
})
/**
 * Testing not Token ADD Image POST /:id
 */
test('no token POST /', async t => {
  let image = fixture.getImage()
  let url = t.context.url
  let options = {
    method: 'POST',
    url: url,
    json: true,
    body: {
      description: image.description,
      src: image.src,
      userId: image.userId
    },
    resolveWithFullResponse: true
  }
  t.throws(request(options), /Invalid token/)
})
/**
 * Testing Secure ADD Image POST /:id
 */
test('secure POST /', async t => {
  let image = fixture.getImage()
  let url = t.context.url
  let token = await utils.signToken({ userId: image.userID }, config.secret)

  let options = {
    method: 'POST',
    url: url,
    json: true,
    body: {
      description: image.description,
      src: image.src,
      userId: image.userId
    },
    headers: {
      'Authorization': `Bearer ${token}`
    },
    resolveWithFullResponse: true
  }

  let response = await request(options)
  t.is(response.statusCode, 201)
  t.deepEqual(response.body, image)
})
/**
 * Testing Secure ADD Image POST /:id
 */
test('invalid Token POST /', async t => {
  let image = fixture.getImage()
  let url = t.context.url
  let token = await utils.signToken({ userId: 'hacky' }, config.secret)
  console.log(token)

  let options = {
    method: 'POST',
    url: url,
    json: true,
    body: {
      description: image.description,
      src: image.src,
      userId: image.userId
    },
    headers: {
      'Authorization': `Bearer ${token}`
    },
    resolveWithFullResponse: true
  }
  t.throws(request(options), /Invalid token/)
})
/**
 * Testing Plus like to Image POST /:id
 */
test('POST /:id/like', async t => {
  let image = fixture.getImage()
  let url = t.context.url

  let options = {
    method: 'POST',
    url: `${url}/${image.id}/like`,
    json: true
  }

  let body = await request(options)
  let imageNew = JSON.parse(JSON.stringify(image))
  imageNew.liked = true
  imageNew.likes++

  t.deepEqual(body, imageNew)
})
/**
 * Testing List Images
 */
test('POST /list', async t => {
  let image = fixture.getImages(4)
  let url = t.context.url

  let options = {
    method: 'POST',
    url: `${url}/list`,
    json: true
  }

  let body = await request(options)

  t.is(body.length, image.length)
})
/**
 * Testing List Tags
 */
test('GET /tag', async t => {
  let image = fixture.getImages(4)
  let url = t.context.url

  let options = {
    method: 'GET',
    url: `${url}/tag`,
    json: true,
    body: {
      tag: 'awesome'
    }
  }

  let body = await request(options)

  t.is(body.length, image.length)
})
