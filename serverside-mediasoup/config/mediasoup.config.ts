import * as mediasoup from 'mediasoup';
import os from 'os';
import * as dotenv from 'dotenv';
import axios from 'axios';





dotenv.config();

const { MEDIASOUP_LISTEN_IP,
    MEDIASOUP_ANNOUNCED_IP,
    MEDIASOUP_MIN_PORT,
    MEDIASOUP_MAX_PORT, } = process.env;

interface MediasoupConfig {
    numWorkers: number;
    workerSettings: {
        dtlsCertificateFile?: string;
        dtlsPrivateKeyFile?: string;
        logLevel: mediasoup.types.WorkerLogLevel;
        logTags: mediasoup.types.WorkerLogTag[];
    };
    routerOptions: mediasoup.types.RouterOptions;
    webRtcServerOptions: mediasoup.types.WebRtcServerOptions;
    webRtcTransportOptions: mediasoup.types.WebRtcTransportOptions;
    plainTransportOptions: mediasoup.types.PlainTransportOptions;
}

const address: mediasoup.types.TransportListenInfo[] = [];
let publicIp: string = "";





(async () => {
    const myinterfaces: any = os.networkInterfaces();

    for (let interfacei in myinterfaces) {
        for (let interfeceinfo of myinterfaces[interfacei]) {
            if (!interfeceinfo.internal) {
                if (interfeceinfo.family === "IPv4") {
                    //!
                    //work in server cloud (no docker)
                    // address.push({
                    //     protocol: "udp",
                    //     ip: "0.0.0.0",
                    //     announcedAddress: interfeceinfo.address,
                    //     // port: 4000,
                    // })
                    // address.push({
                    //     protocol: "tcp",
                    //     ip: "0.0.0.0",
                    //     announcedAddress: interfeceinfo.address,
                    //     // port: 4000,
                    // })
                    //!
                    
                    //work localhost and server change tcp or udp
                    address.push({
                        protocol: "udp",
                        ip: "0.0.0.0",
                        announcedAddress: interfeceinfo.address,
                        // portRange: {
                        //     min: 2000,
                        //     max: 5600
                        // }
                    })

                    //just work on localhost with tcp (no udp)
                    // address.push({
                    //     protocol: "tcp",
                    //     ip: "0.0.0.0",
                    //     announcedAddress: "localhost"
                    // })



                }
                // else  if (interfeceinfo.family === "IPv6") {
                //     address.push({
                //         protocol: "udp",
                //         ip: interfeceinfo.address,
                //         announcedAddress: "142.132.152.236"
                //     })
                // }

            }
            console.log("alllllll inteface addresss");

            console.log(interfeceinfo);
        }

    }



})()
console.log("addredss");
console.log(address);





const mediasoupConfiges: MediasoupConfig = {
    // Number of mediasoup workers to launch.
    numWorkers: Object.keys(os.cpus()).length,
    // mediasoup WorkerSettings.
    // See https://mediasoup.org/documentation/v3/mediasoup/api/#WorkerSettings
    workerSettings: {
        logLevel: "debug",
        logTags: ['info', 'ice', 'dtls', 'rtp', 'srtp', 'rtcp', 'rtx', 'bwe', 'score', 'simulcast', 'svc', 'sctp'],
        // dtlsCertificateFile: "",
        // dtlsPrivateKeyFile: "",
    },
    // mediasoup Router options.
    // See https://mediasoup.org/documentation/v3/mediasoup/api/#RouterOptions
    routerOptions: {
        mediaCodecs: [
            { kind: 'audio', mimeType: 'audio/opus', clockRate: 48000, channels: 2 },
            { kind: 'video', mimeType: 'video/VP8', clockRate: 90000, parameters: { 'x-google-start-bitrate': 1000 } },
            { kind: 'video', mimeType: 'video/VP9', clockRate: 90000, parameters: { 'profile-id': 2, 'x-google-start-bitrate': 1000 } },
            { kind: 'video', mimeType: 'video/h264', clockRate: 90000, parameters: { 'packetization-mode': 1, 'profile-level-id': '4d0032', 'level-asymmetry-allowed': 1, 'x-google-start-bitrate': 1000 } },
            { kind: 'video', mimeType: 'video/h264', clockRate: 90000, parameters: { 'packetization-mode': 1, 'profile-level-id': '42e01f', 'level-asymmetry-allowed': 1, 'x-google-start-bitrate': 1000 } }
        ]
    },

   
    webRtcServerOptions: {
        listenInfos: [...address,

        {
            protocol: 'udp',
            ip: MEDIASOUP_LISTEN_IP || '0.0.0.0',
            announcedAddress: MEDIASOUP_ANNOUNCED_IP || "yourdomain.com",
        },
        {
            protocol: 'tcp',
            ip: MEDIASOUP_LISTEN_IP || '0.0.0.0',
            announcedAddress: MEDIASOUP_ANNOUNCED_IP || "yourdomain.com"
        },

          

        ],
     
    },
    // mediasoup WebRtcTransport options for WebRTC endpoints (mediasoup-client,
    // libmediasoupclient).
    // See https://mediasoup.org/documentation/v3/mediasoup/api/#WebRtcTransportOptions
    webRtcTransportOptions: {
        // listenInfos is not needed since webRtcServer is used.
        // However passing MEDIASOUP_USE_WEBRTC_SERVER=false will change it.
        listenInfos: [
            {
                protocol: 'udp',
                ip: MEDIASOUP_LISTEN_IP || '0.0.0.0',
                announcedAddress: MEDIASOUP_ANNOUNCED_IP,
                portRange: {
                    min: Number(MEDIASOUP_MIN_PORT) || 40000,
                    max: Number(MEDIASOUP_MAX_PORT) || 49999
                }
            },
            {
                protocol: 'tcp',
                ip: MEDIASOUP_LISTEN_IP || '0.0.0.0',
                announcedAddress: MEDIASOUP_ANNOUNCED_IP,
                portRange: {
                    min: Number(MEDIASOUP_MIN_PORT) || 40000,
                    max: Number(MEDIASOUP_MAX_PORT) || 49999
                }
            }
        ],
        initialAvailableOutgoingBitrate: 1000000,
        maxSctpMessageSize: 262144,
        enableUdp: true,
        enableTcp: true,
        preferUdp: true,

        // Additional options that are not part of WebRtcTransportOptions.
        //نیست
        //	maxIncomingBitrate              : 1500000
    },
    // mediasoup PlainTransport options for legacy RTP endpoints (FFmpeg,
    // GStreamer).
    // See https://mediasoup.org/documentation/v3/mediasoup/api/#PlainTransportOptions
    plainTransportOptions: {
        listenInfo: {
            protocol: 'udp',
            ip: MEDIASOUP_LISTEN_IP || '0.0.0.0',
            announcedAddress: MEDIASOUP_ANNOUNCED_IP,
            portRange: {
                min: Number(MEDIASOUP_MIN_PORT) || 40000,
                max: Number(MEDIASOUP_MAX_PORT) || 49999
            }
        },
        maxSctpMessageSize: 262144
    }
}


export default mediasoupConfiges;


