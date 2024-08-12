import express from 'express'
import http from 'http'
import { Server, Socket } from 'socket.io'
import * as mediasoup from 'mediasoup';
import cors from 'cors';

//به این صورت سبب میشود پورت سوکت و اکسپرس یکی باشد
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;


var corsOptions = {
    // origin: ["http://sitemane.ir", "https://sitemane.ir", "https://www.sitemane.ir", "http://www.sitemane.ir"],
    origin: '*',
    credentials: true,
};

app.use(express.static("public"));

app.use(cors(corsOptions));


app.get('/', (req, res) => {
    console.log("get / ");

    res.send("Hello, world!");
})


//! example of mediasoup 
//این مثال کامل و به درستی کار میکند
let UserList_MediasoupExample: string[] = [];
let roomNameOf_MediasoupExample: string = "testMesh";
type UserMediasoupData = {
    producerTransport?: mediasoup.types.WebRtcTransport;
    producer?: mediasoup.types.Producer;
    consumerTransport?: mediasoup.types.WebRtcTransport;
    consumer?: mediasoup.types.Consumer;
  };
  
  const userMediasoupMap = new Map<string, UserMediasoupData>();
let worker_Example: mediasoup.types.Worker;
let router_Example: mediasoup.types.Router;
let webRtcServer_Example: mediasoup.types.WebRtcServer;

import mediasoupConfiges_example from './config/mediasoup.config';



async function StartMediaSoup_Example() : Promise<void> {

    mediasoup.createWorker({...mediasoupConfiges_example.workerSettings}).then(worderCreated => {
        worker_Example = worderCreated;
        console.log("created worker");

        
        worderCreated.createWebRtcServer({ ...mediasoupConfiges_example.webRtcServerOptions }).then(webServerCreated => {
            webRtcServer_Example = webServerCreated;
            worderCreated.appData.webRtcServer = webRtcServer_Example;
            console.log("created webRtcServer");

        }).catch(err => {
            console.log("error in create webServer");
            console.log(err);
        });

        worderCreated.createRouter(mediasoupConfiges_example.routerOptions).then(routerCreated => {
            router_Example = routerCreated;
            console.log("created router");

        }).catch(err => {
            console.log("error in create router");
            console.log(err);

        });

    }).catch(err => {
        console.log("error in create worker");
        console.log(err);

    })
   

    worker_Example.on("died", () => {
        console.error('mediasoup worker died, exiting in 2 seconds... [pid:%d]', worker_Example.pid);
    })

}




io.of("/mediasoupexample").on("connection", async (socket: Socket) => {
    console.log("socket connected : " + socket.id);

    UserList_MediasoupExample.push(socket.id);
    socket.join(roomNameOf_MediasoupExample);

    io.of("/mediasoupexample").to(roomNameOf_MediasoupExample).emit("userlist-mesh-example", UserList_MediasoupExample);
    socket.on("disconnect", () => {
        console.log("disconnect" + socket.id);

        UserList_MediasoupExample = UserList_MediasoupExample.filter(userId => userId !== socket.id)
    })


    io.of("/mediasoupexample").to(socket.id).emit("getRtpCapabilities-example", router_Example.rtpCapabilities)

    socket.on("createProducerTransport-example", async (data: { presenterId: string, clientId: string }) => {
        console.log("createProducerTransport example");

        // webRtcServer: webRtcServer_Example
        if(data.presenterId===socket.id){
            router_Example.createWebRtcTransport({ webRtcServer: webRtcServer_Example, enableTcp: true, enableSctp: true, enableUdp: true }).then(producerTranportCreated => {
                console.log("createProducerTransport webRtcTransport");
                userMediasoupMap.set(data.presenterId,{...userMediasoupMap.get(data.presenterId),producerTransport:producerTranportCreated})

    
                //, sctpParameters: producerTranportCreated.sctpParameters
                let meydata = {presenterId:data.presenterId,transportData:{ id: producerTranportCreated.id, iceParameters: producerTranportCreated.iceParameters, iceCandidates: producerTranportCreated.iceCandidates, dtlsParameters: producerTranportCreated.dtlsParameters, sctpParameters: producerTranportCreated.sctpParameters }};
                io.of("/mediasoupexample").to(data.presenterId).emit("createProducerTransport-example", meydata)
            }).catch(error => {
                console.log("error in createProducerTransport");
                console.log(error);
    
            })
        }
      

    })

    socket.on("connectProducerTransport-example", (data: { presenterId: string, clientId: string, transportId: string, dtlsParameters: mediasoup.types.DtlsParameters }) => {
        console.log("connectProducerTransport-example");

        if(data.presenterId===socket.id){
           let producerTranport_Example= userMediasoupMap.get(data.presenterId)?.producerTransport
            producerTranport_Example!.connect({ dtlsParameters: data.dtlsParameters }).then(reslut => {
                console.log(" connect success producerTranport_Example");

            }).catch(error => {
                console.log("error connectingProducer");
                console.log(error);
    
            });
            producerTranport_Example!.on("trace", (data: mediasoup.types.TransportTraceEventData) => {
                console.log("trace");
    
    
            })
            producerTranport_Example!.on("@close", () => {
                console.log("@close");
    
            })
            //این بخش در بکند کار می کند
            producerTranport_Example!.on("icestatechange", (data: mediasoup.types.IceState) => {
                console.log("icestatechange");
                switch (data) {
                    case "closed":
                        console.log("icestate closed");
    
                        break;
                    case "completed":
                        console.log("icestate completed");
                        break;
                    case "connected":
                        console.log("icestate connected");
                        break;
                    case "disconnected":
                        console.log("icestate disconnected");
                        break;
                    default:
                        break;
                }
    
            })
    
            producerTranport_Example!.on("sctpstatechange", (state: mediasoup.types.SctpState) => {
                switch (state) {
                    case "closed":
                        console.log("sctpstatechange closed");
    
                        break;
                    case "connecting":
                        console.log("sctpstatechange connecting");
                        break;
                    case "connected":
                        console.log("sctpstatechange connected");
                        break;
                    case "failed":
                        console.log("sctpstatechange failed");
                        break;
                    default:
                        break;
                }
            })
        }
        
    })

    socket.on("produce-example", (data: { presenterId: string, kind: mediasoup.types.MediaKind, rtpParameters: mediasoup.types.RtpParameters }) => {
        console.log("produce-example");

        if(data.presenterId===socket.id){
            let producerTranport_Example= userMediasoupMap.get(data.presenterId)?.producerTransport
            producerTranport_Example!.produce({ kind: data.kind, rtpParameters: data.rtpParameters, paused: false }).then(producerCreated => {
                console.log("produce-example on producer");
                userMediasoupMap.set(data.presenterId,{...userMediasoupMap.get(data.presenterId),producer:producerCreated})

                io.of("/mediasoupexample").to(data.presenterId).emit("produce-example", { id: producerCreated.id })
                let myData = { presenterId: data.presenterId, rtpCapabilities: router_Example.rtpCapabilities }
                io.of("/mediasoupexample").to(roomNameOf_MediasoupExample).emit("createConsumersDevice-example", myData)
            }).catch(error => {
                console.log("error in produce");
                console.log(error);
    
            })
        }
       
    })

    socket.on("createConsumerTransport-example", (data: { clientId: string,presenterId:string }) => {
        console.log("createConsumerTransport-example");

        

        // ,webRtcServer: webRtcServer_Example
        if(data.clientId===socket.id){
            router_Example.createWebRtcTransport({ webRtcServer: webRtcServer_Example, enableSctp: true, enableTcp: true, enableUdp: true }).then(consumerTranportCreated => {
                console.log("createConsumerTransport-example expected consumer");
                userMediasoupMap.set(data.clientId,{...userMediasoupMap.get(data.clientId),consumerTransport:consumerTranportCreated})

                //, sctpParameters: consumerTranportCreated.sctpParameters
                let mydata = { clientId: data.clientId,presenterId:data.presenterId, transportData: { id: consumerTranportCreated.id, iceParameters: consumerTranportCreated.iceParameters, iceCandidates: consumerTranportCreated.iceCandidates, dtlsParameters: consumerTranportCreated.dtlsParameters, sctpParameters: consumerTranportCreated.sctpParameters } };
                io.of("/mediasoupexample").to(data.clientId).emit("createConsumerTransport-example", mydata);
            }).catch((error) => {
                console.log("error in createConsumerTransport");
                console.log(error);
    
            })
        }
        
    })

    socket.on("connectConsumerTransport-example", (data: { clientId: string,presenterId:string, dtlsParameters: mediasoup.types.DtlsParameters }) => {
        console.log("connectConsumerTransport-example");
        

        if(data.clientId===socket.id){
           let consumerTranport_Example= userMediasoupMap.get(data.clientId)?.consumerTransport
           console.log(consumerTranport_Example);
           
            consumerTranport_Example!.connect({ dtlsParameters: data.dtlsParameters }).then((result) => {
                console.log("result in connectConsumerTransport-example");
    
            }).catch(error => {
                console.log("error in connectConsumerTransport-example");
                console.log(error);
            })
        }
        
    })

    socket.on("consume-example", async (data: { clientId: string,presenterId:string, rtpCapabilities: mediasoup.types.RtpCapabilities }) => {
        let producer_Example = userMediasoupMap.get(data.presenterId)?.producer;
        let consumerTranport_Example=userMediasoupMap.get(data.clientId)?.consumerTransport;
        if (producer_Example) {
            console.log("consume execute");
            const { consumerCreated, params } = await createConsumer(producer_Example, data.rtpCapabilities,consumerTranport_Example!);
            userMediasoupMap.set(data.clientId,{...userMediasoupMap.get(data.clientId),consumer:consumerCreated});

            console.log("added consumer");

            io.of("/mediasoupexample").to(data.clientId).emit("consume-example", { clientId: data.clientId,presenterId:data.presenterId, params: params });
        }
    })

    const createConsumer = async (producer: mediasoup.types.Producer, rtpCapabilities: mediasoup.types.RtpCapabilities,consumerTranport_Example:mediasoup.types.WebRtcTransport): Promise<any> => {
        if (producer) {
            console.log("createConsumer");
            if (!router_Example.canConsume({ producerId: producer.id, rtpCapabilities: rtpCapabilities })) {
                console.log("cannot consume");
                return

            }
            try {
                // paused:producer.kind === "video" => false
                const consumerCreated = await consumerTranport_Example.consume({ producerId: producer.id, rtpCapabilities })
                return {
                    consumerCreated,
                    params: {
                        producerId: producer.id,
                        id: consumerCreated.id,
                        kind: consumerCreated.kind,
                        rtpParameters: consumerCreated.rtpParameters,
                        producerPaused: consumerCreated.producerPaused,
                        type: consumerCreated.type,
                    }
                }
            } catch (error) {
                console.log("consum faild");
                console.log(error);
            }
        }
    }

    socket.on("resume-example", (data:{clientId:string,presenterId:string}) => {
        console.log("resume-example");
        userMediasoupMap.get(data.clientId)?.consumer?.resume()
        // consumer_Example.resume();
    })
})


StartMediaSoup_Example().then(() => {
    console.log("media-soup-example config executed successfully");

}).catch((error) => {
    console.log("error on creating mediasoup configs");
    console.log(error);
})

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);

})