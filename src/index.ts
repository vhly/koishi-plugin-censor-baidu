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
