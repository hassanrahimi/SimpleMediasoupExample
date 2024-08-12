import { io,Socket } from "socket.io-client";
import { SOCKET_URL } from "../server/baseUrls";



//withCredentials for acitve setting cookies from server for request
export const socket : Socket = io(SOCKET_URL,{autoConnect:false,withCredentials:true})

const medisSoupTest = SOCKET_URL+"/mediasoupexample"

export const socket_mediasouptest : Socket = io(medisSoupTest,{autoConnect:false,withCredentials:true,transports:['websocket','polling']})