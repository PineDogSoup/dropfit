import {request} from "../utils/request"

export function listVenues(){
  return request({
    uri: "/venues"
  })
}

export function queryVenuesByPage(data){
  return request({
    uri: "/venues",
    data
  })
}

export function getVenueDetail(venueId){
  return request({
    uri: "/venue/"+venueId
  })
}

export function getCategoryList(){
  return request({
    uri: "/categories"
  })
}