'use strict';

import { Service } from 'egg';
import { CreationOptional } from 'sequelize';

class Project extends Service {
  async List(offset = 0, limit = 10) {
    return this.ctx.model.Project.findAndCountAll({
      offset,
      limit,
      order: [[ 'created_at', 'desc' ]],
    });
  }

  async GetProjectByIds(ids: []) {
    const { Op } = require('sequelize');
    return this.ctx.model.Project.findAll({
      attributes: [ 'id', 'slug', 'contract_address', 'total_supply', 'floor_price' ],
      where: {
        id: {
          [Op.in]: ids,
        },
      },
      order: [[ 'created_at', 'desc' ]],
    });
  }

  async GetProjectBySlug(slug: string) {
    const project = await this.ctx.model.Project.findOne({ where: { slug } });
    if (!project) {
      return {};
    }
    return project!;
  }

  async GetProjectByID(id: number) {
    const project = await this.ctx.model.Project.findByPk(id);
    if (!project) {
      return {};
    }
    return project!;
  }

  async CheckSlugExists(slug: string) {
    return await this.ctx.model.Project.count({ where: { slug } });
  }

  async Add(project: CreationOptional<any>) {
    return this.ctx.model.Project.create(project);
  }

  async Update({ id, updates }: { id: number; updates: object }) {
    const user = await this.ctx.model.Project.findByPk(id);
    if (!user) {
      this.ctx.throw(404, 'user not found');
    }
    return user!.update(updates);
  }

  async Delete(id: number) {
    const user = await this.ctx.model.Project.findByPk(id);
    if (!user) {
      this.ctx.throw(404, 'user not found');
    }
    return user!.destroy();
  }
}

module.exports = Project;
