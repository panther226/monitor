import { Context } from 'egg';

export default function checkMiddleware(): any {
  return async (ctx: Context, next: () => Promise<any>) => {
    ctx.state.csrf = ctx.csrf;
    if (ctx.session.userinfo && ctx.session.userinfo.email) {
      if (ctx.session.userinfo.status === 2) {
        ctx.redirect('/lock');
      } else {
        const urlArr = ctx.originalUrl.split('/');
        ctx.prefixUrl = urlArr.length > 1 ? urlArr[1] : urlArr[0];
        await next();
      }
    } else {
      ctx.redirect('/login');
    }
  };
}
