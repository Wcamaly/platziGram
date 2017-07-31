'use strict'
const crypto = require('crypto')

const utils = {
  extractTags,
  encrypt,
  normalize
}

function extractTags (text) {
  if (text) {
    let matches = text.match(/#(\w+)/g)
    if (matches != null) {
      return matches.map(normalize)
    }
  }
  return []
}

function encrypt (pass) {
  let shasum = crypto.createHash('sha256')
  shasum.update(pass)
  return shasum.digest('hex')
}

function normalize (text) {
  text = text.toLowerCase().replace(/#/g, '')
  return text
}

module.exports = utils
