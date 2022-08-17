'use strict';

import { Service } from 'egg';
import { CreationOptional } from 'sequelize';

class User extends Service {
  async List(offset = 0, limit = 10) {
    return this.ctx.model.User.findAndCountAll({
      offset,
      limit,
      order: [[ 'created_at', 'desc' ]],
    });
  }

  async GetUserByID(id: number) {
    const user = await this.ctx.model.User.findByPk(id);
    if (!user) {
      return {};
    }
    return user!;
  }

  async GetUserByEmail(email: string) {
    const user = await this.ctx.model.User.findOne({ where: { email } });
    if (!user) {
      return {};
    }
    return user!;
  }

  async CheckEmailExists(email: string, id = 0) {
    const where:any = {
      email,
    };
    if (id !== 0) {
      const { Op } = this.app.Sequelize;
      where.id = { [Op.ne]: id };
    }
    return await this.ctx.model.User.count({ where });
  }

  async Add(user: CreationOptional<any>) {
    return this.ctx.model.User.create(user);
  }

  async Update({ id, updates }: { id: number; updates: object }) {
    const user = await this.ctx.model.User.findByPk(id);
    if (!user) {
      this.ctx.throw(404, 'user not found');
    }
    return user!.update(updates);
  }

  async Delete(id: number) {
    const user = await this.ctx.model.User.findByPk(id);
    if (!user) {
      this.ctx.throw(404, 'user not found');
    }
    return user!.destroy();
  }
}

module.exports = User;
