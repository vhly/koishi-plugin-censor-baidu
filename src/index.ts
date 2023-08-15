import { Context, Schema, Session } from 'koishi'

var AipContentCensorClient = require("baidu-aip-sdk").contentCensor;

export const name = 'censor-baidu'

export interface Config {
  app_id: string,
  api_key: string,
  api_secret: string,
  alert_message?: string,
}

export const Config: Schema<Config> = Schema.object({
  app_id: Schema.string().required(true).description('内容审核 APP ID'),
  api_key: Schema.string().required(true).description('API Key'),
  api_secret: Schema.string().required(true).description('API Secret'),
  alert_message: Schema.string().default('没有看懂你要的内容 ^_^ :(').description('内容不合规提示信息'),
})

export function apply(ctx: Context, config:Config) {


  var contentCensorClient = new AipContentCensorClient(config.app_id, config.api_key, config.api_secret);

  // // 如果收到“天王盖地虎”，就回应“宝塔镇河妖”
  // ctx.on('message', (session) => {
  //     if (session.content === '天王盖地虎') {
  //         session.send('宝塔镇河妖');
  //     }
  // });

  // // 当有好友请求时，接受请求并发送欢迎消息
  // ctx.on('friend-request', async (session) => {
  //     // session.bot 是当前会话绑定的机器人实例
  //     await session.bot.handleFriendRequest(session.messageId, true)
  //     await session.bot.sendPrivateMessage(session.userId, '很高兴认识你！')
  // })

  // 中间件：中间件可以对于事件有更复杂的控制

  // // 如果收到“天王盖地虎”，就回应“宝塔镇河妖”
  // ctx.middleware((session, next) => {
  //   if (session.content === '天王盖地虎') {
  //     return '宝塔镇河妖'
  //   } else {
  //     // 如果去掉这一行，那么不满足上述条件的消息就不会进入下一个中间件了
  //     return next()
  //   }
  // })

  ctx.middleware(
    async (session, next) => {
      // 调用接口
      await contentCensorClient.textCensorUserDefined(session.content).then(
        function(data) {
          console.log('<textCensorUserDefined>: ' + JSON.stringify(data));
          if (1 == data.conclusionType){
            return next();
          }else{
            session.send(config.alert_message);
            return config.alert_message
          }
        },
        function(e) {
          return "内容错误: " + e;
        }
      );

      console.log('censor-baidu: end invoke');
    },
    true
  );
}
