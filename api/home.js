import {request} from "../utils/request"

export function getHomeInformation(){
  return request({
    uri: "/home"
  })
}