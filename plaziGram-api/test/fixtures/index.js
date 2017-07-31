'use strict'

const fixtures = {
  getImage () {
    return {
      id: '6a238b19-3ee3-4d5c-acb5-944a3c1fb407',
      publicId: '3ehqEZvwZByc6hjzgEZU5p',
      userId: 'platzigram',
      src: 'http://platzigram.test/3ehqEZvwZByc6hjzgEZU5p.jpg',
      description: '#awesome',
      tags: [ 'awesome' ],
      createdAt: 'Mon Jul 31 2017 00:57:02 GMT-0300 (Argentina Standard Time)',
      liked: false,
      likes: 0
    }
  },
  getImages (n) {
    let images = []
    while (n-- > 0) {
      images.push(this.getImage())
    }
    return images
  },
   getUser () {
    return {
      name: 'wally c',
      id: 'f62db90-d6bf-46f00-9fb1-eb6912cb',
      username: 'wally'
      password: '1234',
      email: 'wal@platzi.com',
      createdAt: 'Mon Jul 31 2017 00:57:02 GMT-0300 (Argentina Standard Time)'
    }
  }
}

export default fixtures
