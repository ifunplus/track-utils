# track-utils

手动埋点，自动错误监控和性能信息收集

## Publish



```bash
npm publish
```

## Usage

```javascript
    import {TrackerHub} from 'track-utils'

    let trackerHub = new trackUtils.TrackerHub({
            appID: 'acupressure-h5-2022-01-01', // 应用唯一标识
            trackUtils_extraGlobalInfo:{
                userId:"123456",
                channel_type:"jgj_miniprogram"
            },
            trackUtils_requestUrl: 'http://127.0.0.1:3000/saveLog',
            trackUtils_enableErrorTracker: true, //是否开启错误监控
            trackUtils_enablePerformance: true, //是否开启性能监控
            trackUtils_errorBufferTime:3*1000 //3秒钟
    }) 

    //手动埋点
    trackerHub.triggerEvent({
        eventID:"clickSubmitBtn",
        eventTimeStamp:new Date().getTime()
    })

```

## Contributing


## License
[MIT](https://choosealicense.com/licenses/mit/)