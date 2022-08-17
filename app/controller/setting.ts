import { Controller } from 'egg';
const md5 = require('blueimp-md5');

export default class SettingController extends Controller {
  public async users() {
    const { ctx } = this;

    let page = 1;
    if (ctx.query.page) {
      page = parseInt(ctx.query.page);
    }
    if (isNaN(page) || page <= 0) {
      page = 1;
    }
    const page_size = 10;
    const offset = (page - 1) * page_size;

    const users = await ctx.service.user.List(offset, page_size);

    await ctx.render('setting/users', {
      title: '用户列表',
      users,
    });
  }

  public async addUser() {
    const { ctx } = this;
    await ctx.render('setting/add-user');
  }

  public async createUser() {
    const { ctx } = this;
    const data = ctx.request.body;
    if (ctx.session.userinfo.type != 2) {
      ctx.body = {
        code: -1000,
        status: 'error',
        msg: '您的权限不够, 无法添加',
      };
      return;
    }

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
        msg: '密码不能为空',
      };
      return;
    }

    const exists = await ctx.service.user.CheckEmailExists(data.email);
    if (exists > 0) {
      ctx.body = {
        code: -1002,
        status: 'error',
        msg: '邮箱地址已存在',
      };
      return;
    }
    const random = require('string-random');
    const rand = random();

    const user = {
      email: data.email,
      password: md5(data.password + md5(rand)),
      rand,
      status: data.user_status,
      type: data.user_type,
    };

    const rs = ctx.service.user.Add(user);
    if (rs) {
      ctx.body = {
        code: 0,
        status: 'ok',
        msg: '添加成功.',
      };
    } else {
      ctx.body = {
        code: -1003,
        status: 'error',
        msg: '添加失败, 请稍后重试.',
      };
    }
  }

  public async editUser() {
    const { ctx } = this;
    const id = ctx.params.id;
    const userInfo = await ctx.service.user.GetUserByID(id);
    if (!userInfo && !userInfo.id) {
      ctx.redirect('/setting/users');
    }
    await ctx.render('setting/edit-user', { userInfo });
  }

  public async saveUser() {
    const { ctx } = this;
    const data = ctx.request.body;
    if (ctx.session.userinfo.type != 2) {
      ctx.body = {
        code: -1000,
        status: 'error',
        msg: '您的权限不够, 无法添加',
      };
      return;
    }

    if (!data.email) {
      ctx.body = {
        code: -1000,
        status: 'error',
        msg: '邮箱地址不能为空',
      };
      return;
    }

    const userInfo = await ctx.service.user.GetUserByID(data.id);
    if (!userInfo || !userInfo.id) {
      ctx.body = {
        code: -1000,
        status: 'error',
        msg: '参数错误',
      };
      return;
    }

    const exists = await ctx.service.user.CheckEmailExists(data.email, userInfo.id);
    if (exists > 0) {
      ctx.body = {
        code: -1002,
        status: 'error',
        msg: '邮箱地址已存在',
      };
      return;
    }

    const user: any = {
      email: data.email,
      status: data.user_status,
      type: data.user_type,
    };

    if (data.password) {
      const random = require('string-random');
      const rand = random();
      user.rand = rand;
      user.password = md5(data.password + md5(rand));
    }

    const rs = userInfo.update(user);
    if (rs) {
      ctx.body = {
        code: 0,
        status: 'ok',
        msg: '修改成功.',
      };
    } else {
      ctx.body = {
        code: -1003,
        status: 'error',
        msg: '修改失败, 请稍后重试.',
      };
    }
  }

  public async operation() {
    const { ctx } = this;
    const id = ctx.params.id;
    if (!id) {
      ctx.body = {
        code: -1000,
        status: 'error',
        msg: '缺少参数',
      };
      return;
    }

    const userInfo = await ctx.service.user.GetUserByID(id);
    if (!userInfo || !userInfo.id) {
      ctx.body = {
        code: -1000,
        status: 'error',
        msg: '参数错误',
      };
      return;
    }

    if (ctx.session.userinfo.id == userInfo.id) {
      ctx.body = {
        code: -1000,
        status: 'error',
        msg: '不能禁用自己',
      };
      return;
    }
    let status = 0;
    if (ctx.request.body.status) {
      status = ctx.request.body.status;
    }
    const rs = await userInfo.update({ status });
    if (rs) {
      ctx.body = {
        code: 0,
        status: 'ok',
        msg: '操作成功.',
      };
    } else {
      ctx.body = {
        code: -1003,
        status: 'error',
        msg: '操作失败, 请稍后重试.',
      };
    }
  }

  public async logs() {
    const { ctx } = this;
    ctx.body = await ctx.service.test.sayHi('egg');
  }
}
