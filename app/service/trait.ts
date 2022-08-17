'use strict';

import { Service } from 'egg';
import { CreationOptional } from 'sequelize';

class Trait extends Service {
  async Traits(project_id: number, only_root: boolean) {
    if (only_root) {
      return this.ctx.model.Trait.findAll({
        where: {
          project_id,
          pid: 0,
        },
        order: [[ 'pid', 'asc' ]],
      });
    }

    return this.ctx.model.Trait.findAll({
      where: {
        project_id,
      },
      order: [[ 'pid', 'asc' ]],
    });
  }

  async GetTraitsByPid(pid: number) {
    return this.ctx.model.Trait.findAll({
      where: {
        pid,
      },
      order: [[ 'created_at', 'asc' ]],
    });
  }

  async Add(trait: CreationOptional<any>) {
    return this.ctx.model.Trait.create(trait);
  }

  async MultiAdd(traits: any) {
    return this.ctx.model.Trait.bulkCreate(traits);
  }
}

module.exports = Trait;
