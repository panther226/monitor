'use strict';

import { Service } from 'egg';

class Element extends Service {
  async GetElementsByProjectId(project_id: number) {
    return await this.ctx.model.Element.findAll({
      where: {
        project_id,
      },
      order: [[ 'created_at', 'desc' ]],
    });
  }

  async GetInfoByID(id: number) {
    const monitor = await this.ctx.model.Element.findByPk(id);
    if (!monitor) {
      this.ctx.throw(404, 'user not found');
    }
    return monitor;
  }

  async AddElements(elements: any = []) {
    return this.ctx.model.Element.bulkCreate(elements);
  }

  async CreateOrUpdate({ values, condition }: { values: any; condition: object }) {
    return await this.ctx.model.Element.upsert(values, condition);
  }

  async Update({ id, updates }: { id: number; updates: object }) {
    const user = await this.ctx.model.Element.findByPk(id);
    if (!user) {
      this.ctx.throw(404, 'user not found');
    }
    return user!.update(updates);
  }

  async Delete(id: number) {
    const user = await this.ctx.model.Element.findByPk(id);
    if (!user) {
      this.ctx.throw(404, 'user not found');
    }
    return user!.destroy();
  }
}

module.exports = Element;
