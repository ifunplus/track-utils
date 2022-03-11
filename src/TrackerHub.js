import ClientBrowser from "./ClientBrowser"
import {reportTracker,xmlHttpRequest,sendBeacon,sendImg} from './utils'

let defaultOptions = {
  appID: 'default', // 埋点数据来源，['h5','小程序'，'web端']
  trackUtils_extraGlobalInfo: {}, // 用户自定义上传字段对象, 可以包括userId等
  trackUtils_requestUrl: '', //接口地址
  trackUtils_requestType:'', //发送方式["sendImg","sendBeacon","xmlHttpRequest","all"]
  trackUtils_enableErrorTracker: false, //是否开启页面错误监控
  trackUtils_enablePerformance: false, //是否开启性能监控
  trackUtils_errorBufferLimit: 5, //错误上报缓冲长度
  trackUtils_errorBufferTime: 60*1000 //错误上报缓冲时间 1分钟
}

export class TrackerHub {
    constructor(options){
      if(options&&options.appID){
        this._options = Object.assign(defaultOptions,options);
        this._registers = {}
        this._registersInit()
      }else{
        throw new Error("options.appid is not defined")
      }
    }

    _registersInit(){
      console.log("....._registersInit")
      this._registers["clientBrowser"] = new ClientBrowser(this._options)
    }

    _addRegister(type,client){
      this._registers[type] = client
    }

    _removeRegister(type){
      if(this._registers[type]){
        delete this._registers[type]
      }
    }

    triggerEvent(data){
      let processData = {...this._options.trackUtils_extraGlobalInfo,...data}
      let requestUrl = this._options.trackUtils_requestUrl
      if(this._options.requestType==="sendImg"){
        sendImg(requestUrl, processData); //仅仅get img不支持，回退xmlHttpRequest
      }else if(this._options.requestType==="sendBeacon"){
        sendBeacon(requestUrl, processData);//post sendBeacon不支持，回退xmlHttpRequest
      }else if(this._options.requestType==="all"){
        reportTracker(requestUrl,processData) //后端支持get，post，自动处理
      }else{
        xmlHttpRequest(requestUrl, processData); //post
      }
    }
}

export default TrackerHub


//TODO: window.onLoad性能统计
//TODO: http请求异常捕获
//source-map解析
//性能监控
//https://github.com/burakson/sherlogjs
//异常上报：indexDb https://segmentfault.com/a/1190000038555708  https://juejin.cn/post/6963977794715926536#heading-8


