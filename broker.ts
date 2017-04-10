/*
 * @Author: jiwei
 * @Date: 2017-04-10 10:06:26
 * @Last Modified by: jiwei
 * @Last Modified time: 2017-04-10 19:03:34
 */

//
// ─── INTERFACE ──────────────────────────────────────────────────────────────────
//
interface configObj {
    MQTTURL:string
}
// ────────────────────────────────────────────────────────────────────────────────
const config:configObj = {MQTTURL :"mqtt://test.mosquitto.org"};
const mqtt = require('mqtt');
const events = require('events');
class Broker {
    private brokerUrl:string;
    private client:any={};
    constructor(url:string=config.MQTTURL){
        this.brokerUrl=url;
    }
    public connect(token:string=""):any{
        let url = this.brokerUrl+token;
        this.client = mqtt.connect(url);
    }
    public connected():boolean{
        return this.client.connected();
    }
    public getLastMessageId():string{
        return this.client.getLastMessageId();
    }
    public reconnecting():boolean{
        return this.client.reconnecting();
    }
    public subscribe(topic:any,opts=0):any{
        let _this = this;
        let promise =  new Promise((resolve:Function,reject:Function)=>{
            if(_this.client){
                _this.client.subscribe(topic,opts,(err:string,granted:any)=>{
                    if(err) reject(err);
                    resolve(granted);
                });
            }else{
                reject("请先建立服务器链接");
            }
        })
        return promise;
    }
    public unsubscribe(topic:any):any{
        let _this = this;
        let promise =  new Promise((resolve:Function,reject:Function)=>{
            if(_this.client){
                _this.client.unsubscribe(topic,(err:string)=>{
                    if(err) reject(err);
                    resolve("success");
                });
            }else{
                reject("请先建立服务器链接");
            }
        })
        return promise;
    }
    public end():any{
        let _this =this;
        return new Promise((resolve:Function,reject:Function)=>{
            if(_this.client){
               _this.client.end();
            }
        })
    }
    public on(event:string,fn:Function):any{
        let _this =this;
        if(_this.client){
            _this.client.on(event,fn);
        }else{
            console.log("请先建立服务器链接");
        }
    }
    public publish(topic:string,message:any,opts={qos:0,retain:false}):any{
        let _this =this;
        return new Promise((resolve:Function,reject:Function)=>{
            if(_this.client){
                _this.client.publish(topic,message,(err:any)=>{
                    if(err) reject(err)
                    else resolve("success");
                });
            }else{
                console.log("请先建立服务器链接");
            }
        })
    }
    public publishToAsp(message:string,opts={qos:0,retain:false}):any{
        return this.publish("messageSendToAsp",message,opts);
    }
    public publishToClient(topic:string,message:any,opts={qos:0,retain:false}):any{
        return this.publish(topic,message,opts);
    }
}

let bbroker = new Broker();
bbroker.connect();
bbroker.on('connect', function () {
  bbroker.subscribe('presence').then(()=>{
    return bbroker.publish('presence', 'Hello mqtt')
  }).then(()=>{
    bbroker.on('message', function (topic:any, message:any) {
        console.log(message.toString())
    })
  })
})
