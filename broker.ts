/*
 * @Author: jiwei
 * @Date: 2017-04-10 10:06:26
 * @Last Modified by: jiwei
 * @Last Modified time: 2017-04-14 19:50:04
 */

//
// ─── INTERFACE ──────────────────────────────────────────────────────────────────
//
interface configObj {
    readonly MQTTURL: string,
    readonly RESTAPI?: string
}
interface connectopts {
    username: string,
    password: string,
    token?: string
}
// ────────────────────────────────────────────────────────────────────────────────
const config: configObj = { MQTTURL: "ws://10.0.32.106:8198" };
const mqtt = require('mqtt');
const q = require("q");
class Broker {
    private brokerUrl: string;
    constructor(url: string = config.MQTTURL) {
        this.brokerUrl = url;
    }
    public connect({ token = "", username, password }: connectopts): any {
        let url = this.brokerUrl + token;
        let mqttclient = mqtt.connect(url, {
            username: username,
            password: password,
            protocolId: 'MQIsdp',
            protocolVersion: 3
        });
        return new Client(mqttclient);
    }
}
class Client {
    private AsyncClient: any;
    constructor(client: any) {
        this.AsyncClient = client;
    }
    public publish(topic: string, message: any, opts = { qos: 0, retain: false }): any {
        let deferred = q.defer();
        this.AsyncClient.publish(topic, message,opts, (err: any) => {
            if (err) deferred.reject(err)
            else deferred.resolve("success");
        });
        return deferred.promise;
    }
    public publishToAsp(message: string, opts = { qos: 0, retain: false }): any {
        return this.publish("messageSendToAsp", message, opts);
    }
    public publishToClient(topic: string, message: any, opts = { qos: 0, retain: false }): any {
        return this.publish(topic, message, opts);
    }
    public on() {
        return this.AsyncClient.on.apply(this.AsyncClient, arguments);
    }
    public end() {
        return this.AsyncClient.end.apply(this.AsyncClient, arguments);
    }
    public subscribe(topic: any, opts = 0): any {
        let deferred = q.defer();
        this.AsyncClient.subscribe(topic, opts, (err: string, granted: any) => {
            if (err) deferred.reject(err);
            deferred.resolve(granted);
        })
        return deferred.promise;
    }
    public unsubscribe(topic: any): any {
        let deferred = q.defer();
        this.AsyncClient.unsubscribe(topic, (err: string) => {
            if (err) deferred.reject(err);
            deferred.resolve("success");
        });
        return deferred.promise;
    }
    public connected() {
        return this.AsyncClient.connected.apply(this.AsyncClient, arguments);
    }
    public reconnecting() {
        return this.AsyncClient.reconnecting.apply(this.AsyncClient, arguments);
    }
    public getLastMessageId() {
        return this.AsyncClient.getLastMessageId.apply(this.AsyncClient, arguments);
    }
}
let bbroker = new Broker();
var a = bbroker.connect({
    username: "admin",
    password: "bjsasc"
});
console.log(a.on)
a.on("connect",function(){
    a.subscribe('presence').then((res)=>{
        console.log(res)
        a.publish('presence', 'Hello mqtt').then((res)=>{
            console.log(res)
        });
    });
})
a.on('message', function (topic:any, message:any) {
  // message is Buffer
  console.log(message.toString())
  a.end()
})
