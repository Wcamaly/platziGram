// 'use strict'
// import test from 'ava'
// import micro from 'micro'
// import listen from 'test-listen'
// import request from 'request-promise'
// import user from '../user'
// import fixture from './fixtures/'
// /**
//  * Before Test create micro
//  */
// test.beforeEach(async t => {
//   let srv = micro(user)
//   t.context.url = await listen(srv)
// })
// /**
//  * Testing saveUser
//  */
// test('POST /', async t => {
//   let user = fixture.getUser()
//   let url = t.context.url

//   let options = {
//     url: url,
//     json: true,
//     body: {
//       name: user.name,
//       username: user.username,
//       pasword: user.password,
//       email: user.email
//     },
//     resolveWithFullResponse: true
//   }
//   let response = await request(options)
//   t.is(response.statusCode, 201)
//   delete user.password
//   delete user.email

//   t.deepEqual(response.body, user)
// })
// /**
//  * Testing getUser
//  */
// test('GET /:username', async t => {
//   let user = fixture.getUser()
//   let url = t.context.url

//   let options = {
//     url: url,
//     json: true
//   }
//   let body = await request(options)

//   t.deepEqual(body, user)
// })
// /**
//  * Testing authenticate
//  */
// test('POST /authenticate', async t => {
//   let user = fixture.getUser()
//   let url = t.context.url

//   let options = {
//     url: url,
//     json: true,
//     body: {
//       username: user.username,
//       pasword: user.password
//     }
//   }
//   let body = await request(options)

//   t.true(body)
// })
// /**
//  * Testing getImageByUser
//  */
// test.todo('GET /getImageByUser')
