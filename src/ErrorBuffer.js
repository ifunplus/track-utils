import {xmlHttpRequest} from './utils'

export class ErrorBuffer {
    constructor(options) {
        this._options = options
        this._buffer = [];
        this._buffer_keys = []
        this._buffer_limit = options.trackUtils_errorBufferLimit || 5;
        this._buffer_time = options.trackUtils_errorBufferTime || 60*1000;
        this.prevErrorTime = new Date().getTime()
        this.sendBufferCount = 0;
    }

    isReady(){
        return this.length() <= this._buffer_limit
    }

    onError(data){
        //缓冲发送，错误去重，上线限制
        if (!this.isReady()) {
            console.log('Not adding Promise due to buffer limit reached.')
        }

        if (this._buffer_keys.indexOf(data.key) === -1) {
            this._buffer.push(data)
            this._buffer_keys.push(data.key)
        }

        const sendError = ()=>{
            if(this.length()>0){
                xmlHttpRequest(this._options.trackUtils_requestUrl, this._buffer);
                this.resetBuffer()
                this.sendBufferCount++
                if(this.sendBufferCount === 10){
                    this.resetBufferKeys()
                }
            }
        }

        if (window.requestIdleCallback) {
            window.requestIdleCallback(() => {
               sendError()
            })
        } else {
            setTimeout(() => {
                sendError()
            }, this._buffer_time)
        }

    }


    resetBuffer(){
        this._buffer = []
    }

    resetBufferKeys(){
        this._buffer_keys = []
    }
    
    length() {
        return this._buffer.length;
    }
}

export default ErrorBuffer