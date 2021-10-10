/*


boxjs地址 :  


圈X配置如下，其他软件自行测试

[task_local]
#加油鸭
0 * * * * jyy.js, tag=加油鸭, 


[rewrite_local]
#加油鸭
^http://.+/api/wx/readSure url script-request-header jyy.js



[MITM]
hostname = 


*/


const $ = new Env('加油鸭自动阅读');
let status;
status = (status = ($.getval("jyystatus") || "1") ) > 1 ? `${status}` : ""; // 账号扩展字符
const jyyurlArr = [], jyyhdArr = []
let jyyurl = $.getdata('jyyurl')
let jyyhd = $.getdata('jyyhd')
let jyy = $.getjson('jyy', [])
let tz = ($.getval('tz') || '1');//0关闭通知，1默认开启
let jyykey = ''
$.desc =''

!(async () => {
  if (typeof $request !== "undefined") {
    await jyyck()
  }  else {
    jyy.forEach(o=>{
      jyyurlArr.push(o.url)
      jyyhdArr.push(o.hd)
    });
    console.log(`------------- 共${jyyhdArr.length}个账号-------------\n`)

      for (let i = 0; i < jyyhdArr.length; i++) {
        if (jyyhdArr[i]) {
         
          jyyurl = jyyurlArr[i];
          jyyhd = jyyhdArr[i];
          $.index = i + 1;
          console.log(`\n开始【加油鸭${$.index}】`)
    await jyyxx();
  }
    await jyytx();
}

$.log('\n======== [脚本运行完毕,打印日志结果] ========\n' )
await showmsg();
}

})()
  .catch((e) => $.logErr(e))
  .finally(() => $.done())




//数据获取
async function jyyck() {
  if ($request.url.indexOf("readSure") > -1) {
    const jyyurl = $request.url;
    const jyyhd = JSON.stringify($request.headers);
    let host = jyyurl.match(/^https?:\/\/(.+?)\//)[1];
    let userId = await userInfo(host, jyyhd);
    if (userId) {
      // 获取到用户ID，记录
      let status = 1;
      let no = jyy.length;
      for (let i = 0, len = no; i < len; i++) {
        let ac = jyy[i] || {};
        if (ac.uid) {
          if (ac.uid == userId) {
            no = i;
            status = 0;
            break;
          }
        } else if (no == len) {
          no = i;
        }
      }
      jyy[no] = {uid: userId, url: jyyurl, hd: jyyhd};
      $.setdata(JSON.stringify(jyy, null, 2), 'jyy');
      $.log(jyyhd)
      $.log(jyyurl)
      $.msg($.name, "", `加油鸭[账号${no+1}] ${status?'新增':'更新'}数据成功！`);
    } else {
      // 未获取到用户ID，提示
      $.msg($.name, "", '加油鸭用户ID获取失败⚠️');
    }
  }
}


function userInfo(host, jyyhd, timeout = 0) {
  return new Promise((resolve) => {
    let url = {
      url: `http://${host}/api/wx/readerInfo`,
      headers : JSON.parse(jyyhd),
    }
    $.get(url, async (err, resp, data) => {
      let userId = 0;
      try {
        if (err) {
          $.logErr(`❌ API请求失败，清检查网络设置 \n ${JSON.stringify(err)}`)
        } else {
         let result = JSON.parse(data)

           if(result.code==200){
              userId=result.data.id;
          }
        }
      } catch (e) {
        //$.logErr(e, resp);
      } finally {
        resolve(userId)
      }
    }, timeout)
  })
}



//账户信息
function jyyxx(timeout = 0) {
  return new Promise((resolve) => {
let host = jyyurl.match(/http?:\/\/(.+?)\//)[1];
let url = {
        url : `http://${host}/api/wx/readerInfo`,
        headers : JSON.parse(jyyhd),
        body : ``
}
      $.get(url, async (error, response, data) => {
        try {
         const result = JSON.parse(data)
         if(result.code== 200){
           console.log(`\n🌝【账号${$.index}-${result.data.nickname}】\n【今日已阅读】: ` + result.data.readCount +`\n【今日金币】:` + result.data.gold +`\n【阅读单价】:` + result.data.goldReward +`金币`)

          $.desc +=`\n🌝【账号${$.index}-${result.data.nickname}】\n【今日已阅读】: ` + result.data.readCount +`\n【今日金币】:` + result.data.gold +`\n【阅读单价】:` + result.data.goldReward +`金币`


     if(result.data.readCount <= 1){
           console.log(`🚫【阅读状态】: 今日手动阅读小于二次,跳过该账号`)
           $.desc +=`\n🚫【阅读状态】: 今日手动阅读小于二次,跳过该账号`;
}

 else {
       statuse=result.data.limitFlag
          if(statuse==1){
             console.log(`🚫【阅读状态】: 阅读异常,自行查看首页`)
             $.desc +=`\n🚫【阅读状态】: 阅读异常,自行查看首页`
           }
          if(statuse==0){
              await jyyid()
           }
}
        
} else {
       console.log(`\n🌝【账号${index}】: 接口请求失败，尝试更换链接`)
       $.desc +=`\n🌝【账号${index}】: 接口请求失败，尝试更换链接`;

}
        } catch (e) {
           //$.logErr(e, response)
        } finally {
          resolve()
        }
    },timeout)
  })
}



//key
function jyyid(timeout = 0) {
  return new Promise((resolve) => {
    setTimeout( ()=>{
      if (typeof $.getdata('jyyhd') == 0) {
        $.msg($.name,"",'请先获取加油鸭数据!😓',)
        $.done()
      }
let host = jyyurl.match(/http?:\/\/(.+?)\//)[1]
let url = {
        url : `http://${host}/api/wx/read`,
        headers : JSON.parse(jyyhd),
        body : '',}
      $.get(url, async (err, resp, data) => {
        try {
      const result = JSON.parse(data)
       if(result.code == 200){
         if(result.data.limitFlag == 1){
         await jyyxx()
 } else{
        jyykey = result.data.recordId
        jyyru = result.data.readUrl
        console.log(`📖【获取key】: 回执成功，开始跳转阅读📖\n` + jyykey + `\n【当前任务】:`+ jyyru + `\n🌝等待7秒提交任务`)
        await $.wait(7000);
        await jyytj(result.data.recordId)
    }
} else{
       console.log(`\n🚫【账号${$.index}】: 接口请求失败`)
       $.desc +=`\n🚫【账号${$.index}】: 接口请求失败`
            }
        } catch (e) {
          //$.logErr(e, resp);
        } finally {
          resolve()
        
      }
})
    },timeout)
  })
}



//提交     
function jyytj(timeout = 0) {
  return new Promise((resolve) => {
let host = jyyurl.match(/http?:\/\/(.+?)\//)[1];
let url = {
        url : `http://${host}/api/wx/readSure`,
        headers: JSON.parse(jyyhd),
        body : `{"recordId":${jyykey}}`,
}      
      $.post(url, async (err, resp, data) => {
        try {
    const result = JSON.parse(data)
        if(result.code == 200){
        console.log(`\n🌝【提交状态】: 提交成功` + `\n`)
          await jyyid()
} else{
       console.log(`\n🚫【领取状态】: ` + result.msg)
       $.desc +=`\n🚫【领取状态】: ` + result.msg
            }

        } catch (e) {
          //$.logErr(e, resp);
        } finally {
          resolve()
        }
    },timeout)
  })
}



//提现
function jyytx(timeout = 0) {
  return new Promise((resolve) => {
let host = jyyurl.match(/http?:\/\/(.+?)\//)[1];
let url = {
        url : `http://${host}/api/wx/takeMoney`,
        headers: JSON.parse(jyyhd),
        body : `{"amount":30}`,
}      
      $.post(url, async (err, resp, data) => {
        try {         
    const result = JSON.parse(data)
        if(result.code == 200){
        console.log(`🌝【账户提现状态】: 提现成功` + `\n`)
       $.desc +=`🌝【账户提现状态】: 提现成功` + `\n`

} else{
       //console.log(`\n🌝【账号${$.index}】:🚫` +  result.msg)
       //$.desc +=`\n🌝【账户${$.index}】\n🚫【阅读状态】: ` + result.msg + `/n`
       console.log(`🚫【提现状态】: 提现失败 ${result.msg}\n`) 
       $.desc +=`\n🚫【提现状态】: 提现失败 ${result.msg}\n`
            }

        } catch (e) {
          //$.logErr(e, resp);
        } finally {
          resolve()
        }
    },timeout)
  })
}


function showmsg(){
  if(tz == 1){
       $.msg($.name,'',$.desc)
  }
}

function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),a={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(a,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t){let e={"M+":(new Date).getMonth()+1,"d+":(new Date).getDate(),"H+":(new Date).getHours(),"m+":(new Date).getMinutes(),"s+":(new Date).getSeconds(),"q+":Math.floor(((new Date).getMonth()+3)/3),S:(new Date).getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,((new Date).getFullYear()+"").substr(4-RegExp.$1.length)));for(let s in e)new RegExp("("+s+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?e[s]:("00"+e[s]).substr((""+e[s]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r)));let h=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];h.push(e),s&&h.push(s),i&&h.push(i),console.log(h.join("\n")),this.logs=this.logs.concat(h)}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
