'use strict';

import { Service } from 'egg';
import { CreationOptional } from 'sequelize';

class Monitor extends Service {
  async List(offset = 0, limit = 10) {
    return this.ctx.model.Monitor.findAndCountAll({
      where: {
        uid: this.ctx.session.userinfo.id,
      },
      offset,
      limit,
      order: [[ 'created_at', 'desc' ]],
    });
  }

  async GetMonitors() {
    return await this.ctx.model.Monitor.findAll({
      where: {
        status: 1,
      },
      order: [[ 'created_at', 'desc' ]],
    });
  }

  async GetMonitorProjectIds() {
    const monitors: any = await this.ctx.model.Monitor.findAll({
      attributes: [ 'project_id' ],
      where: {
        status: 1,
      },
      order: [[ 'created_at', 'desc' ]],
    });

    const ids: any = [];
    for (const item of monitors) {
      ids.push(item.project_id);
    }
    return ids;
  }

  async GetInfoByID(id: number) {
    const monitor = await this.ctx.model.Monitor.findByPk(id);
    if (!monitor) {
      this.ctx.throw(404, 'user not found');
    }
    return monitor;
  }

  async Add(user: CreationOptional<any>) {
    return this.ctx.model.Monitor.create(user);
  }

  async Update({ id, updates }: { id: number; updates: object }) {
    const user = await this.ctx.model.Monitor.findByPk(id);
    if (!user) {
      this.ctx.throw(404, 'user not found');
    }
    return user!.update(updates);
  }

  async Delete(id: number) {
    const user = await this.ctx.model.Monitor.findByPk(id);
    if (!user) {
      this.ctx.throw(404, 'user not found');
    }
    return user!.destroy();
  }
}

module.exports = Monitor;
