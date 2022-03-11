import {addExtraPlatformInfo} from './extra'
import {ErrorBuffer} from './ErrorBuffer'
import { xmlHttpRequest} from './utils';
import md5 from "md5"
export class ClientBrowser {
    constructor(options) {
        this._options = options;
        this._registers = {}
        this.init(options)
    }

    init() {
       if(this._options.trackUtils_enablePerformance){
         this.initPerformanceTracker()
       }
       if(this._options.trackUtils_enableErrorTracker){
           this._registers["errorBuffer"] = new ErrorBuffer(this._options)
           this.initErrorTracker()
       }
    }

    initPerformanceTracker(){
        // 获取性能信息
        const getPerformance = () => {
            if (!window.performance) return
            const timing = window.performance.timing
            const performance = {
                // 重定向耗时
                redirect: timing.redirectEnd - timing.redirectStart,
                // DOM 渲染耗时
                dom: timing.domComplete - timing.domLoading,
                // 页面加载耗时
                load: timing.loadEventEnd - timing.navigationStart,
                // 页面卸载耗时
                unload: timing.unloadEventEnd - timing.unloadEventStart,
                // 请求耗时
                request: timing.responseEnd - timing.requestStart,
                // 获取性能信息时当前时间
                time: new Date().getTime(),
            }
            
            try{
                if(whiteScreen){
                    performance.whiteScreen = whiteScreen
                }
            }catch(err){
                console.warn("页面缺少配置白屏时间获取相关脚本")
            }
 
            //白屏时间
            //将以下脚本放在 </head> 前面就能获取白屏时间。
            // <script>
            //     whiteScreen = new Date() - performance.timing.navigationStart
            // </script>
            return performance
        }

        // 获取资源信息
        const getResources = () => {
            if (!window.performance) return
            const data = window.performance.getEntriesByType('resource')
            const resource = {
                xmlhttprequest: [],
                css: [],
                other: [],
                script: [],
                img: [],
                link: [],
                fetch: [],
                // 获取资源信息时当前时间
                time: new Date().getTime(),
            }

            data.forEach(item => {
                const arry = resource[item.initiatorType]
                arry && arry.push({
                    // 资源的名称
                    name: item.name,
                    // 资源加载耗时
                    duration: item.duration.toFixed(2),
                    // 资源大小
                    size: item.transferSize,
                    // 资源所用协议
                    protocol: item.nextHopProtocol,
                })
            })

            return resource
        }

        const sendPerformanceAndPlatform = ()=>{
            let performance = getPerformance()
            let resources = getResources()
            xmlHttpRequest(this._options.trackUtils_requestUrl, {
                ...this._options,
                trackUtils_type:"trackUtils_loadInfo",
                trackUtils_platform:addExtraPlatformInfo({}),
                trackUtils_performance:performance,
                trackUtils_resources:resources
            });
        }
        window.onload = () => {
            // 在浏览器空闲时间获取性能及资源信息 https://developer.mozilla.org/zh-CN/docs/Web/API/Window/requestIdleCallback
            if (window.requestIdleCallback) {
                window.requestIdleCallback(() => {
                    sendPerformanceAndPlatform()
                })
            } else {
                setTimeout(() => {
                    sendPerformanceAndPlatform()
                }, 0)
            }
        }
    }

    initErrorTracker(){
        //调用第三方脚本JS的方法出错，包装相应调用方法，抛出错误
        const originAddEventListener = EventTarget.prototype.addEventListener;
        EventTarget.prototype.addEventListener = function (type, listener, options) {
          const wrappedListener = function (...args) {
            try {
              return listener.apply(this, args);
            }catch (err) {
              throw err;
            }
          }
          return originAddEventListener.call(this, type, wrappedListener, options);
        }
    

        window.onerror = (message, source, lineno, colno, error)=>{
            //捕获运行时错误，不能捕获资源加载错误
            let errorObj = {
                ...this._options.trackUtils_extraGlobalInfo,
                message,
                source,
                lineno,
                colno,
                type:"trackUtils_error_onerror",
                key:md5(message+source+lineno+colno)
            }
            this._registers["errorBuffer"].onError(errorObj)
        } 
         

        window.addEventListener('error', e => {
            //可以捕获资源加载错误，不能捕获promise错误
            let errorObj;
            let key;
            if(e.message){
                const {message, filename, lineno, colno} = e
                errorObj = {
                    ...this._options.trackUtils_extraGlobalInfo,
                    message,
                    source:filename,
                    lineno,
                    colno,
                    type:"trackUtils_error_addEventListener",
                    key:md5(message+filename+lineno+colno)
                }
            }else if(e){
                //IMG图像加载错误
                const target = e.target || {}
                const {nodeName,className,currentSrc,id} = target
                errorObj = {
                    ...this._options.trackUtils_extraGlobalInfo,
                    nodeName,
                    currentSrc,
                    id,
                    className,
                    type:"trackUtils_error_addEventListener",
                    key: md5(nodeName+currentSrc+id+className)
                }
            }
            this._registers["errorBuffer"].onError(errorObj)
         }, true) 
      

        window.addEventListener("unhandledrejection", (e, source, lineno, colno, error)=>{
            //捕获promise错误
            const {message,stack} = e.reason
            let errorObj = {
                   ...this._options.trackUtils_extraGlobalInfo,
                   message:message,//"Failed to fetch"
                   stack:stack,//TypeError: Failed to fetch\n    at http://127.0.0.1:5500/examples/index.html:138:5
                   type:"trackUtils_error_unhandledrejection",
                   key:md5(message+stack+type)
            }
            this._registers["errorBuffer"].onError(errorObj)
        });
    }
}

export default ClientBrowser;