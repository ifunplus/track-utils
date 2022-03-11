//utils.js
const stringify = (obj) => {
  let params = [];
  for (let key in obj) {
    params.push(`${key}=${obj[key]}`);
  }
  return params.join("&");
};


//https://opensource.sensorsdata.cn/opensource/%E6%95%B0%E6%8D%AE%E4%B8%8A%E6%8A%A5%E6%96%B9%E5%BC%8F%E6%98%AF%E5%90%A6%E5%AD%98%E5%9C%A8%E6%9C%80%E4%BC%98%E8%A7%A3%EF%BC%9F/
const reportTracker = function (url, data) {
  console.log("url, data........", url, data);
  let urlLength = (url + (url.indexOf("?") < 0 ? "?" : "&") + reportData).length;
  if (urlLength < 2083) {
    sendImg(url, data); //仅仅get
    return;
  }
  sendBeacon(url, data); //post
};

//调用第三方脚本JS的方法出错，包装相应调用方法，抛出错误
const wrapErrors = function (fn) {
  if (!fn.__wrapped__) {
    fn.__wrapped__ = function () {
      try {
        return fn.apply(this, arguments);
      } catch (e) {
        console.err(e);
        throw e;
      }
    };
  }

  return fn.__wrapped__;
};

//https://juejin.cn/post/6844904168474279949  部分浏览器不支持，get请求
const sendImg = function (url, data) {
  console.log("sendImg.......");
  let image = new Image(1, 1);
  image.onload = function () {
    image = null;
  };
  try {
    image.src = `${url}?${stringify(data)}`;
  } catch (err) {
    xmlHttpRequest(url, data);
  }
};

const sendBeacon = function (url, data) {
  console.log("sendBeacon.......");
  let headers = {
    // application/x-www-form-urlencoded
    // multipart/form-data
    // text/plain; charset=UTF-8
    type: "text/plain; charset=utf-8", //https://stackoverflow.com/questions/45274021/sendbeacon-api-not-working-temporarily-due-to-security-issue-any-workaround
  };
  let blob = new Blob([JSON.stringify(data)], headers);
  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    try {
      navigator.sendBeacon(url, blob);
    } catch (err) {
      xmlHttpRequest(url, data);
    }
  } else {
    xmlHttpRequest(url, data);
  }
};


const xmlHttpRequest = function (url, data) {
  console.log("xmlHttpRequest.......");
  const client = new XMLHttpRequest();
  client.open("POST", url, false);
  client.setRequestHeader("Content-Type", "application/json; charset=utf-8");
  client.send(JSON.stringify(data));
};

export { reportTracker, wrapErrors, sendBeacon, sendImg, xmlHttpRequest };

// https://segmentfault.com/a/1190000040086300
// https://juejin.cn/post/6987681953424080926#heading-6
// https://www.yuque.com/zaotalk/posts/c5-5#QUH0x
