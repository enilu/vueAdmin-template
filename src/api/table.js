import fetch from '@/utils/fetch'

export function getList(params) {
  return fetch({
    url: '/table/list',
    method: 'get',
    params
  })
}

export function getDeptTree(params) {
  return fetch({
    url: '/dept/tree',
    method: 'get',
    params
  })
}