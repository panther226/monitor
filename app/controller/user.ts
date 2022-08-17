import { Controller } from 'egg';
const md5 = require('blueimp-md5');

export default class UserController extends Controller {
  public async login() {
    const { ctx } = this;
    ctx.session.userinfo = {};
    await ctx.render('user/login');
  }

  public async doLogin() {
    const { ctx } = this;
    const data = ctx.request.body;

    if (!data.email) {
      ctx.body = {
        code: -1000,
        status: 'error',
        msg: '邮箱地址不能为空',
      };
      return;
    }

    if (!data.password) {
      ctx.body = {
        code: -1000,
        status: 'error',
        msg: '账户密码不能为空',
      };
      return;
    }

    const user = await ctx.service.user.GetUserByEmail(data.email);
    if (user.email !== data.email) {
      ctx.body = {
        code: -2000,
        status: 'error',
        msg: '邮箱不存在',
      };
      return;
    }

    if (user.password !== md5(data.password + md5(user.rand))) {
      ctx.body = {
        code: -2001,
        status: 'error',
        msg: '密码错误',
      };
      return;
    }

    if (user.status <= 0) {
      let status_msg = '账号尚未激活,请联系管理员';
      if (user.status == -1) {
        status_msg = '账号被冻结,暂时无法登录';
      }

      ctx.body = {
        code: -2002,
        status: 'error',
        msg: status_msg,
      };
      return;
    }

    ctx.session.userinfo = {
      id: user.id,
      email: user.email,
      img: ctx.helper.GeneralAvatar(user.email, 74, 'svg'),
      type: user.type,
      status: user.status,
    };

    ctx.body = {
      code: 0,
      status: 'ok',
      msg: '登录成功',
    };
  }

  public async register() {
    const { ctx } = this;
    await ctx.render('user/register');
  }

  public async doRegister() {
    const { ctx } = this;
    const data = ctx.request.body;

    if (!data.email) {
      ctx.body = {
        code: -1000,
        status: 'error',
        msg: '邮箱地址不能为空',
      };
      return;
    }

    if (!data.password) {
      ctx.body = {
        code: -1000,
        status: 'error',
        msg: '账户密码不能为空',
      };
      return;
    }

    if (!data.confirm_password) {
      ctx.body = {
        code: -1000,
        status: 'error',
        msg: '确认密码不能为空',
      };
      return;
    }

    if (data.password !== data.confirm_password) {
      ctx.body = {
        code: -1001,
        status: 'error',
        msg: '两次密码输入不一致',
      };
      return;
    }

    const exists = await ctx.service.user.CheckEmailExists(data.email);
    if (exists > 0) {
      ctx.body = {
        code: -1002,
        status: 'error',
        msg: '邮箱已经注册过了',
      };
      return;
    }
    const random = require('string-random');
    const rand = random();

    const user = {
      email: data.email,
      password: md5(data.password + md5(rand)),
      rand,
      status: 0,
      type: 1,
    };

    const rs = ctx.service.user.Add(user);
    if (rs) {
      ctx.body = {
        code: 0,
        status: 'ok',
        msg: '注册成功, 请等待管理员审核.',
      };
    } else {
      ctx.body = {
        code: -1003,
        status: 'error',
        msg: '注册失败, 请稍后重试.',
      };
    }
  }

  public async forget() {
    const { ctx } = this;
    await ctx.render('user/forget-password');
  }

  public async sendEmail() {
    const { ctx } = this;
    ctx.body = 'ok';
  }

  public async reset() {
    const { ctx } = this;
    await ctx.render('user/reset-password');
  }

  public async doReset() {
    const { ctx } = this;
    ctx.body = 'ok';
  }

  public async lock() {
    const { ctx } = this;
    if (ctx.session.userinfo && ctx.session.userinfo.email) {
      if (ctx.session.userinfo.status > 0) {
        ctx.session.userinfo.status = 2;
        return await ctx.render('user/lock');
      }
    }
    return ctx.redirect('/login');
  }

  public async unlock() {
    const { ctx } = this;

    const data = ctx.request.body;

    const sessionUser = ctx.session.userinfo;

    if (!data.password) {
      ctx.body = {
        code: -1000,
        status: 'error',
        msg: '账户密码不能为空',
      };
      return;
    }
    console.log('sessionUser', sessionUser);
    const user = await ctx.service.user.GetUserByID(sessionUser.id);
    if (user.password !== md5(data.password + md5(user.rand))) {
      ctx.body = {
        code: -2001,
        status: 'error',
        msg: '密码错误',
      };
      return;
    }

    if (user.status <= 0) {
      let status_msg = '账号尚未激活,请联系管理员';
      if (user.status == -1) {
        status_msg = '账号被冻结,暂时无法登录';
      }

      ctx.body = {
        code: -2002,
        status: 'error',
        msg: status_msg,
      };
      return;
    }

    ctx.session.userinfo.type = user.type;
    ctx.session.userinfo.status = user.status;

    ctx.body = {
      code: 0,
      status: 'ok',
      msg: '登录成功',
    };
  }

  public async logout() {
    const { ctx } = this;
    ctx.session.userinfo = {};
    ctx.redirect('/login');
  }
}
