// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: award;
// author:Nicolas-kings
// ver:1.0.0   2020/11/20
//*********使用前准备工作*********//
//请前往代码的272/291行输入抓包获取的cookie
//请前往代码的277/297行输入抓包获取的x-token
//以及第20行处输入user_id
const filename = `${Script.name()}.jpg`
const files = FileManager.local()
const path = files.joinPath(files.documentsDirectory(), filename)
const changePicBg = false  //选择true时，使用透明背景 
const ImageMode = true  //选择true时，使用必应壁纸
const previewSize = "Medium"  //预览大小
const colorMode = false // 是否是纯色背景
const bgColor = new Color("000000") // 小组件背景色


const userId = '' //输入捷径社区id  https://sharecuts.cn/user/94lVdg6zgq

const api = 'https://api.sharecuts.cn/'
let res = await getData()
let down = await getDown()
const padding = {
  top: 10,
  left: 10,
  bottom: 10,
  right: 10
}
let widget = await createWidget()
/*
****************************************************************************
* 这里是图片逻辑，不用修改
****************************************************************************
*/
if (!colorMode && !ImageMode && !config.runsInWidget && changePicBg) {
  const okTips = "您的小部件背景已准备就绪"
  let message = "图片模式支持相册照片&背景透明"
  let options = ["图片选择", "透明背景"]
  let isTransparentMode = await generateAlert(message, options)
  if (!isTransparentMode) {
      let img = await Photos.fromLibrary()
      message = okTips
      const resultOptions = ["好的"]
      await generateAlert(message, resultOptions)
      files.writeImage(path, img)
  } else {
      message = "以下是【透明背景】生成步骤，如果你没有屏幕截图请退出，并返回主屏幕长按进入编辑模式。滑动到最右边的空白页截图。然后重新运行！"
      let exitOptions = ["继续(已有截图)", "退出(没有截图)"]

      let shouldExit = await generateAlert(message, exitOptions)
      if (shouldExit) return

      // Get screenshot and determine phone size.
      let img = await Photos.fromLibrary()
      let height = img.size.height
      let phone = phoneSizes()[height]
      if (!phone) {
          message = "您似乎选择了非iPhone屏幕截图的图像，或者不支持您的iPhone。请使用其他图像再试一次!"
          await generateAlert(message, ["好的！我现在去截图"])
          return
      }

      // Prompt for widget size and position.
      message = "您想要创建什么尺寸的小部件？"
      let sizes = ["小号", "中号", "大号"]
      let size = await generateAlert(message, sizes)
      let widgetSize = sizes[size]

      message = "您想它在什么位置？"
      message += (height == 1136 ? " (请注意，您的设备仅支持两行小部件，因此中间和底部选项相同。)" : "")

      // Determine image crop based on phone size.
      let crop = { w: "", h: "", x: "", y: "" }
      if (widgetSize == "小号") {
          crop.w = phone.小号
          crop.h = phone.小号
          let positions = ["顶部 左边", "顶部 右边", "中间 左边", "中间 右边", "底部 左边", "底部 右边"]
          let position = await generateAlert(message, positions)

          // Convert the two words into two keys for the phone size dictionary.
          let keys = positions[position].split(' ')
          crop.y = phone[keys[0]]
          crop.x = phone[keys[1]]

      } else if (widgetSize == "中号") {
          crop.w = phone.中号
          crop.h = phone.小号

          // 中号 and 大号 widgets have a fixed x-value.
          crop.x = phone.左边
          let positions = ["顶部", "中间", "底部"]
          let position = await generateAlert(message, positions)
          let key = positions[position].toLowerCase()
          crop.y = phone[key]

      } else if (widgetSize == "大号") {
          crop.w = phone.中号
          crop.h = phone.大号
          crop.x = phone.左边
          let positions = ["顶部", "底部"]
          let position = await generateAlert(message, positions)

          // 大号 widgets at the 底部 have the "中间" y-value.
          crop.y = position ? phone.中间 : phone.顶部
      }

      // Crop image and finalize the widget.
      let imgCrop = cropImage(img, new Rect(crop.x, crop.y, crop.w, crop.h))

      message = "您的小部件背景已准备就绪，退出到桌面预览。"
      const resultOptions = ["好的"]
      await generateAlert(message, resultOptions)
      files.writeImage(path, imgCrop)
  }

}


//////////////////////////////////////
// 组件End
// 设置小组件的背景
if (colorMode) {
  widget.backgroundColor = bgColor
} else if (ImageMode) {
  const url = "https://area.sinaapp.com/bingImg/"   //使用必应壁纸作为背景时，请注释下面
  // const url = "http://p1.music.126.net/uarVFKgUlrI9Z1nr-50cAw==/109951162843608471.jpg"     //固定一张图片,这里我选用城南花已开的封面,图片不能太大，容易崩溃
  const i = await new Request(url);
  const img = await i.loadImage();
  widget.backgroundImage = await shadowImage(img)
}
else {
  widget.backgroundImage = files.readImage(path)
}
// 设置边距(上，左，下，右)
widget.setPadding(padding.top, padding.left, padding.bottom, padding.right)
// 设置组件
Script.setWidget(widget)
// 完成脚本
Script.complete()
// 预览
if (previewSize == "Large") {
  widget.presentLarge()
} else if (previewSize == "Medium") {
  widget.presentMedium()
} else {
  widget.presentSmall()
}
async function createWidget() {

  // Create widget
  let widget = new ListWidget();

  // Widget color
  // let gradient = new LinearGradient()

  // gradient.locations = [0, 1]
  // gradient.colors = [
  //   new Color("090f03"),
  //   new Color("0b393e")
  // ]

  // widget.backgroundGradient = gradient;

  // Title stack
  let titleStack = widget.addStack()
  const logo= await loadImage(`https://sharecuts.cn/_nuxt/img/17f24c8.png`)   //   https://sharecuts.cn/icon.png
  const logoimgw =titleStack.addImage(logo)
  logoimgw.cornerRadius=10
  logoimgw.imageSize=new Size(60, 20)
  titleStack.addSpacer(10)
  // let titleIcon = SFSymbol.named('checkmark.seal.fill')   //  checkmark.seal.fill
  // titleIcon.applyMediumWeight()
  // let titleIconElement = titleStack.addImage(titleIcon.image)
  // titleIconElement.imageSize = new Size(20, 20)
  // titleIconElement.tintColor = Color.blue()
  // titleStack.addSpacer(8)
  let titleElement = titleStack.addText(`${res.nickname}`)
  titleElement.textColor = Color.white()
  titleElement.font = Font.boldSystemFont(16)
  titleElement.textOpacity = 0.7
  titleElement.lineLimit = 1
  titleElement.url = 'https://sharecuts.cn/users/'+userId
  titleStack.addSpacer()
  widget.addSpacer()

// // // // // // // // // // // // // // 

  let bodyStack = widget.addStack()
  let  bodyIcon = SFSymbol.named('signature')   //command.circle.fill
  // bodyIcon.applyMediumWeight()
  let  bodyIconElement =  bodyStack.addImage(bodyIcon.image)
  bodyIconElement.imageSize = new Size(15, 15)
  bodyIconElement.tintColor = Color.white()
  bodyStack.addSpacer(8)
  let  bodyElement =  bodyStack.addText(`${res.bio}`)
  bodyElement.textColor = Color.white()
  bodyElement.font = Font.systemFont(14)
  bodyElement.url = "sharecuts://users/" + userId
  bodyElement.lineLimit = 1;
  widget.addSpacer()
// // // // // // // // // // // // // // 

  let boltIconStack = widget.addStack()
  let boltIcon = SFSymbol.named('icloud.and.arrow.down.fill');  //icould.and.arrow.down.fill  bolt.car.fill
  // boltIcon.applyMediumWeight()
  let boltIconElement = boltIconStack.addImage(boltIcon.image)
  boltIconElement.imageSize = new Size(15, 15)
  boltIconElement.tintColor = Color.white()
  boltIconStack.addSpacer(8)

  let boltElement = boltIconStack.addText(numberWithCommas(`${down.downloads_count}`))
  boltElement.textColor = Color.white()
  boltElement.font = Font.systemFont(14)
  widget.addSpacer(8)

  // // // // // // // // // // // // // // 
  let rangeStack = widget.addStack()
  let rangeIcon = SFSymbol.named('person.fill.checkmark');
  let rangeIconElement = rangeStack.addImage(rangeIcon.image)
  rangeIconElement.imageSize = new Size(15, 15)
  rangeIconElement.tintColor = Color.white()
  rangeStack.addSpacer(8)

  let rangeElement = rangeStack.addText(numberWithCommas(`${down.user_followers_count}`))
  rangeElement.textColor = Color.white()
  rangeElement.font = Font.systemFont(14)
  widget.addSpacer(8)
  
// // // // // // // // // // // // // // 
  let timeToChargeStack = widget.addStack()

  let timeToChargeIcon = SFSymbol.named('lightbulb.fill');
  let timeToChargeIconElement = timeToChargeStack.addImage(timeToChargeIcon.image)
  timeToChargeIconElement.imageSize = new Size(15, 15)
  timeToChargeIconElement.tintColor = Color.white()
  timeToChargeStack.addSpacer(8)

  let timeToChargeElement = timeToChargeStack.addText(numberWithCommas(`${down.shortcuts_count}`))
  timeToChargeElement.textColor = Color.white()
  timeToChargeElement.font = Font.systemFont(14)
  widget.addSpacer(8)


// // // // // // // // // // // // // // 
  // let lastUpdatedStack = widget.addStack()
  let currentDate = new Date()
   let lastUpdated = currentDate.toLocaleString("chinese", { hour12: false })
  // let lastUpdated = currentDate.toLocaleString("chinese", {
  //   year: 'numeric',
  //   month: 'short',
  //   day: 'numeric',
  //   hour: 'numeric',
  //   minute: 'numeric'
  // })
  let lastUpdatedElement = widget.addText('↻'+`${lastUpdated}`)
  lastUpdatedElement.textColor = Color.white()
  lastUpdatedElement.font = Font.systemFont(8)
  lastUpdatedElement.rightAlignText()
  lastUpdatedElement.lineLimit = 1;

  return widget
}


async function getData() {

  let wakeUrl = api+'users/'+ userId
  let wakeRequest = new Request(wakeUrl)
  wakeRequest.method = 'get'
  wakeRequest.headers = {
    "Accept": "*/*",
    "Content-Type": 'application/json',
    "Cookie":' ',  //抓包获取的cookie
    "User-Agent":'Sharecuts/1.4.13 (tech.miidii.Sharecuts; build:120; iOS 14.2.0) Alamofire/5.0.0',
    "X-Token":' ', //抓包获取的token
    "X-User": userId
  }
  return await wakeRequest.loadJSON()
}


async function getDown() {

  let wakeUrl = api+'users/'+userId+'/stats'
  let wakeRequest = new Request(wakeUrl)
  wakeRequest.method = 'get'
  wakeRequest.headers = {
    "Accept": "*/*",
    "Content-Type": 'application/json',
    "Cookie":' ',  //抓包获取的cookie
    "User-Agent":'Sharecuts/1.4.13 (tech.miidii.Sharecuts; build:120; iOS 14.2.0) Alamofire/5.0.0',
    "X-Token":'',   //抓包获取的token
    "X-User": userId

  }
  return await wakeRequest.loadJSON()
}

function numberWithCommas(x) {
  return x.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// You can your own code here to add additional items to the "invisible" background of the widget.
/* --------------- */
/* Assemble Widget */
/* --------------- */
async function shadowImage(img) {
  let ctx = new DrawContext()
  // 把画布的尺寸设置成图片的尺寸
  ctx.size = img.size
  // 把图片绘制到画布中
  ctx.drawImageInRect(img, new Rect(0, 0, img.size['width'], img.size['height']))
  // 设置绘制的图层颜色，为半透明的黑色
  ctx.setFillColor(new Color('#000000', 0.5))
  // 绘制图层
  ctx.fillRect(new Rect(0, 0, img.size['width'], img.size['height']))

  // 导出最终图片
  return await ctx.getImage()
}

async function  loadImage(imgUrl) {
  let req = new Request(imgUrl)
  let image = await req.loadImage()
  return image
}

async function generateAlert(message, options) {
  let alert = new Alert()
  alert.message = message

  for (const option of options) {
      alert.addAction(option)
  }

  let response = await alert.presentAlert()
  return response
}

// Crop an image into the specified rect.
function cropImage(img, rect) {
  let draw = new DrawContext()
  draw.size = new Size(rect.width, rect.height)
  draw.drawImageAtPoint(img, new Point(-rect.x, -rect.y))
  return draw.getImage()
}

// Pixel sizes and positions for widgets on all supported phones.
function phoneSizes() {
  let phones = {
    "2340": { // 12mini
      "小号": 436,
      "中号": 936,
      "大号": 980,
      "左边": 72,
      "右边": 570,
      "顶部": 212,
      "中间": 756,
      "底部": 1300,
  },

  "2532": { // 12/12 Pro
      "小号": 472,
      "中号": 1012,
      "大号": 1058,
      "左边": 78,
      "右边": 618,
      "顶部": 230,
      "中间": 818,
      "底部": 1408,
  },

  "2778": { // 12 Pro Max
      "小号": 518,
      "中号": 1114,
      "大号": 1162,
      "左边": 86,
      "右边": 678,
      "顶部": 252,
      "中间": 898,
      "底部": 1544,
  },

  "2688": {
      "小号": 507,
      "中号": 1080,
      "大号": 1137,
      "左边": 81,
      "右边": 654,
      "顶部": 228,
      "中间": 858,
      "底部": 1488
  },

  "1792": {
      "小号": 338,
      "中号": 720,
      "大号": 758,
      "左边": 54,
      "右边": 436,
      "顶部": 160,
      "中间": 580,
      "底部": 1000
  },

  "2436": {
      "小号": 465,
      "中号": 987,
      "大号": 1035,
      "左边": 69,
      "右边": 591,
      "顶部": 213,
      "中间": 783,
      "底部": 1353
  },

  "2208": {
      "小号": 471,
      "中号": 1044,
      "大号": 1071,
      "左边": 99,
      "右边": 672,
      "顶部": 114,
      "中间": 696,
      "底部": 1278
  },

  "1334": {
      "小号": 296,
      "中号": 642,
      "大号": 648,
      "左边": 54,
      "右边": 400,
      "顶部": 60,
      "中间": 412,
      "底部": 764
  },

  "1136": {
      "小号": 282,
      "中号": 584,
      "大号": 622,
      "左边": 30,
      "右边": 332,
      "顶部": 59,
      "中间": 399,
      "底部": 399
  }
}
return phones
}

