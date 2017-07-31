'use strict'
import test from 'ava'
import micro from 'micro'
import listen from 'test-listen'
import request from 'request-promise'
import picture from '../picture'
import fixture from './fixtures/'
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
 * Testing ADD Image POST /:id
 */
test('POST /', async t => {
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
  let response = await request(options)
  t.is(response.statusCode, 201)
  t.deepEqual(response.body, image)
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
