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
 * Testing saveUser
 */
test('POST /', async t => {
  let user = fixture.getUser()
  let url = t.context.url

  let options = {
    url: url,
    json: true,
    body: {
      name: user.name,
      username: user.username,
      pasword: user.password
      email: user.email
    }
  }
  let body = await request(options)

  t.deepEqual(body, user)
})
/**
 * Testing getUser
 */
test('GET /:username', async t => {
  let user = fixture.getUser()
  let url = t.context.url

  let options = {
    url: url,
    json: true
  }
  let body = await request(options)

  t.deepEqual(body, user)
})
/**
 * Testing authenticate
 */
test('POST /authenticate', async t => {
   let user = fixture.getUser()
  let url = t.context.url

  let options = {
    url: url,
    json: true,
    body: {  
      username: user.username,
      pasword: user.password
    }
  }
  let body = await request(options)

  t.true(body)
})
/**
 * Testing getImageByUser
 */
test('GET /getImageByUser', async t => {
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
