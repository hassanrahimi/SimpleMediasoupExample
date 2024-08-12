import React, { useRef, useEffect } from 'react'
import * as mediasoupClient from 'mediasoup-client';
import { socket_mediasouptest as socket } from './config/Socket.config.typescript';


function MediasoupTest() {
  const videoTagRremote = useRef<HTMLVideoElement | null>(null)
  const videoTagLocal = useRef<HTMLVideoElement | null>(null)

  const senderDevice = useRef<mediasoupClient.types.Device | null>(null);
  const procuderTransport = useRef<mediasoupClient.types.Transport<mediasoupClient.types.AppData> | undefined>();
  const producer = useRef<mediasoupClient.types.Producer<mediasoupClient.types.AppData> | undefined>();
  const reciverDevice = useRef<mediasoupClient.types.Device | null>(null);
  const consumerTransport = useRef<mediasoupClient.types.Transport<mediasoupClient.types.AppData> | undefined>();


  useEffect(() => {
    console.log(socket);

    //{query:userDtails}
    socket.connect()
    // socket.on("connect",()=>{
    //   console.log("connect to server");

    // })

    return () => {
      // ////console.log("return done");

      socket.disconnect();
      // socket.on("disconnect",(error)=>{
      //   console.error("connection error : ", error)

      // })

    }
  }, [])

  useEffect(() => {


    socket.on("getRtpCapabilities-example", onGetRtpCapabilitiesEvent)
    socket.on("createProducerTransport-example", onCreateProducerTransport);
    socket.on("createConsumersDevice-example", onCreateConsumersDevice);
    socket.on("createConsumerTransport-example", onCreateConsumerTransport);
    socket.on("consume-example", onConsume)
    socket.on("produce-example", onProduce);
    return () => {
      socket.off("getRtpCapabilities-example", onGetRtpCapabilitiesEvent)
      socket.off("createProducerTransport-example", onCreateProducerTransport);
      socket.off("createConsumersDevice-example", onCreateConsumersDevice)
      socket.off("createConsumerTransport-example", onCreateConsumerTransport);
      socket.off("consume-example", onConsume)
      socket.off("produce-example", onProduce);
    }
  }, [])


  const onGetRtpCapabilitiesEvent = async (rtpCapabilities: mediasoupClient.types.RtpCapabilities) => {
    console.log("onGetRtpCapabilitiesEvent");
    console.log(rtpCapabilities);

    let device = new mediasoupClient.Device();
    await device.load({ routerRtpCapabilities: rtpCapabilities });

    senderDevice.current = device;

    socket.emit("createProducerTransport-example", { presenterId: socket.id })
  }


  const onCreateProducerTransport = async (data:{presenterId:string,transportData:mediasoupClient.types.TransportOptions} ) => {
    console.log("onCreateProducerTransport");
    console.log(data);


    // const transport = senderDevice.current?.createSendTransport({ ...data, iceServers: confingPeerConnection.iceServers });
    // {...data,iceServers:confingPeerConnection.iceServers,additionalSettings:{port:4000}}
    //data
    if(data.presenterId===socket.id){
      const transport = await senderDevice.current?.createSendTransport(data.transportData);
    console.log("createSendTransport");

    console.log(transport);

    transport?.on("connect", async ({ dtlsParameters }, callbacktest, errorback) => {
      try {
        console.log("transport connect");
        console.log(dtlsParameters);

        socket.emit("connectProducerTransport-example", { presenterId: socket.id, transportId: transport.id, dtlsParameters: dtlsParameters })
        console.log("transport connect after emit");

        //https://mediasoup.discourse.group/t/transport-produce-triggers-successful-connect-but-not-produce-event/4708 
        //produce
        //important :  must be to exucute continuoues
        callbacktest();
      } catch (error: any) {
        console.log("errrror in connectprocuer transport");
        console.log(error);
        errorback({ message: error.messages, name: "error" });
      }
    })

    transport?.on("produce", ({ kind, rtpParameters }, callbacktest2, errorback2) => {
      try {
        console.log("produce");
        console.log(rtpParameters);

        let newdamta = { presenterId: socket.id, kind: kind, rtpParameters: rtpParameters }
        console.log("produce befor emit");
        console.log(newdamta);

        socket.emit("produce-example", newdamta);

        callbacktest2({ id: transport.id });
        console.log("produce after emit");

      } catch (error: any) {
        console.log("error in produce");
        console.log(error);


        errorback2({ message: error.messages, name: "error" });
      }
    })

    transport?.on("connectionstatechange", async (state) => {
      switch (state) {
        case "connecting":
          console.log("connecting");

          break;
        case "connected":
          console.log("connected");
          break;

        case "failed":
          console.log("failed");
          break;
        case "disconnected":
          console.log("disconnected");
          break;
        case "closed":
          console.log("closed");
          break;
        case "new":
          console.log("new");
          break;
        default:
          break;
      }
    })
    console.log("createSendTransport procuderTransport.current = transport");

    procuderTransport.current = transport;

    }
    
  }

  const onCreateConsumersDevice = (data: { presenterId: string, rtpCapabilities: mediasoupClient.types.RtpCapabilities }) => {
    console.log("onCreateConsumersDevice");

    if (data.presenterId !== socket.id) {
      let remoteDevice = new mediasoupClient.Device();
      remoteDevice.load({ routerRtpCapabilities: data.rtpCapabilities }).then(() => {
        console.log("onCreateConsumersDevice excuted locad");



        socket.emit("createConsumerTransport-example", { clientId: socket.id ,presenterId:data.presenterId});
      }).catch((err) => {
        console.log("error in create consumers device");
        console.log(err);


      });
      reciverDevice.current = remoteDevice;



    }
  }

  const onCreateConsumerTransport = (data: { clientId: string, presenterId:string,transportData: mediasoupClient.types.TransportOptions }) => {
    console.log("onCreateConsumerTransport");
    console.log(data.transportData);

    if (data.clientId === socket.id) {
      //{ ...data, iceServers: confingPeerConnection.iceServers }
      //{...data.transportData, iceServers: confingPeerConnection.iceServers,additionalSettings:{port:4000}}
      //data.transportData
      let transportRemote = reciverDevice.current?.createRecvTransport(data.transportData);
      console.log("createRecvTransport");

      console.log(transportRemote);
      transportRemote?.on("connect", ({ dtlsParameters }, callbacktest, errorback) => {
        try {
          console.log("remote connect");


          let mydata = { clientId: socket.id,presenterId:data.presenterId, dtlsParameters: dtlsParameters };
          socket.emit("connectConsumerTransport-example", mydata);
          callbacktest();

        } catch (error: any) {
          errorback({ message: error.messages, name: "error in connect remote" });
        }
      })
      transportRemote?.on("connectionstatechange", async (state) => {
        switch (state) {
          case "connecting":
            console.log("remote connecting");

            break;
          case "connected":
            socket.emit("resume-example", { clientId: socket.id,presenterId:data.presenterId })
            console.log("remote connected");
            break;

          case "failed":
            console.log("remote failed");
            break;
          case "disconnected":
            console.log("remote disconnected");
            break;
          case "closed":
            console.log("remote closed");
            break;
          case "new":
            console.log("remote new");
            break;
          default:
            break;
        }
      })

      consumerTransport.current = transportRemote;
      let rtpCapabilities = reciverDevice.current?.rtpCapabilities;
      let newData = { clientId: socket.id,presenterId:data.presenterId, rtpCapabilities: rtpCapabilities }
      socket.emit("consume-example", newData)
      console.log("emite consume");
    }
  }

  const onConsume = async (data: { clientId: string,presenterId:string, params: mediasoupClient.types.ConsumerOptions }) => {
    console.log("onConsume");
    console.log(data);

    if (data.params && data.clientId === socket.id) {
      const { id, rtpParameters, kind, producerId } = data.params;
      consumerTransport.current?.consume({ id, rtpParameters, kind, producerId }).then(consumer => {
        console.log("onConsume executed");
        console.log(consumer.track);

        let mediaStream = new MediaStream();



        mediaStream.addTrack(consumer!.track)
        videoTagRremote.current!.srcObject = mediaStream;
        console.log(consumer.id);

        videoTagRremote.current!.muted = true;
        videoTagRremote.current!.play();
        consumer?.resume();

      })
    }
  }



  const onProduce = (data: any) => {
    console.log("onProduce");

    console.log(data);

  }
  const btnCallStream = () => {
    // if (typeof window === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
    //   console.error("getDisplayMedia is not supported or running in a non-browser environment");
    //   return;
    // }

    console.log("btnCallStream");

    if (!senderDevice.current?.canProduce("video") || !senderDevice.current?.loaded) {
      console.log("cannot produce video");
      return;

    }

    // navigator.mediaDevices.getDisplayMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 15 } } })
    navigator.mediaDevices.getDisplayMedia({ video: { width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 24 } } })
      .then(stream => {
        videoTagLocal.current!.srcObject = stream;
        console.log("append video");
        const track = stream.getVideoTracks()[0];
        // debugger;
        const params = { track };
        try {

          console.log("transport in try");
          console.log(procuderTransport.current);
          console.log(params);


         

          procuderTransport.current?.produce(params)
            .then(producerrr => {
              console.log("append video producerrr");
              console.log(producerrr);
              producer.current = producerrr;
            }).catch(error => {
              console.log("error");
              console.log(error);

            });


        } catch (error: any) {
          console.log("error :");
          console.log(error);

        }

      })
  }


  return (
    <div>

      <button onClick={btnCallStream} style={{ cursor: "pointer", backgroundColor: "#04AA6D", padding: "10px" }}>click to stream</button>
      <br />
      <br />
      <div style={{ display: 'flex', flexDirection: 'row' }}>

        <div>
          <video ref={videoTagLocal} style={{ width: 800, height: 600, borderWidth: "3px", borderColor: "gray" }} autoPlay></video>
          <h2>not Streamed: you send this to other client</h2>
        </div>

        <div>
          <video ref={videoTagRremote} style={{ width: 800, height: 600, borderWidth: "3px", borderColor: "gray" }} autoPlay></video>
          <h2>presenter send this streaming</h2>
        </div>
      </div>



    </div>
  )
}

export default MediasoupTest    