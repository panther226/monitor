'use strict';

import { Application } from 'egg';

export default function(app: Application) {
  const { INTEGER, STRING, DATE } = app.Sequelize;

  return app.model.define('trait', {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '主键, 自增ID',
    },
    project_id: {
      type: INTEGER,
      allowNull: false,
      comment: '项目ID',
    },
    pid: {
      type: INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '父ID 默认:0',
    },
    name: {
      type: STRING(64),
      allowNull: false,
      comment: '特征名称',
    },
    count: {
      type: INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '拥有此特征的 NFT个数 (用于计算稀有度, 数量越低, 越稀有)',
    },
    created_at: {
      type: DATE(6),
      comment: '数据创建时间',
      allowNull: false,
    },
    updated_at: {
      type: DATE(6),
      comment: '数据更新时间',
    },
  });
}
