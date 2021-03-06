//@flow

import Rx from 'rx'
import request from 'axios'
import { decode } from 'base-64'

import { parse } from 'query-string'

let repo = "tldr-pages/tldr"
let branch = "master"
let query = parse(location.search)

if (query.repo)
  repo = query.repo
const BASE_URL = `https://api.github.com/repos/${repo}/contents/pages`

if (query.branch)
  branch = query.branch
const BASE_BRANCH = `ref=${branch}`

let get = (cmd) => {
  return Rx.Observable
    .spawn(requestPage(cmd))
    .timeout(1000, new Error('Timeout :( - Could not retrieve page') )
}

let requestPage = (cmd) => {
  let url = buildUrl(cmd)
  let opts = requestOptions({url})
  return fetchPage(opts)
}

let buildUrl = (cmd) => [toPath(cmd), BASE_BRANCH].join('?')
let toPath   = (cmd) => [BASE_URL, cmd.platform[0], cmd.name+'.md'].join('/')

let requestOptions = (opts) => {
  return Object.assign({
    method: 'GET',
    withCredentials: false
  }, opts)
}

let fetchPage = function *(opts) {
  let { data } = yield request(opts)
  return {
    path: data.html_url,
    body: decode(data.content)
  }
}

let Page = {
  get
}

export { Page }
