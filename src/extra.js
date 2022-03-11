import platform from "platform";

export function addExtraPlatformInfo(rawInfo) {
  console.log("platform_name",platform)
  let platformInfo = {
    extra_platform_name: platform.name, // 'Safari'
    extra_platform_version: platform.version, // '5.1'
    extra_platform_product: platform.product, // 'iPad'
    extra_platform_manufacturer: platform.manufacturer, // 'Apple'
    extra_platform_layout: platform.layout, // 'WebKit'
    extra_platform_os: platform.os, // 'iOS 5.0'
    extra_platform_description: platform.description, // 'Safari 5.1 on Apple iPad (iOS 5.0)'
  };
  return Object.assign(rawInfo,platformInfo)
}
