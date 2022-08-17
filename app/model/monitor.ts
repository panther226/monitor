'use strict';

import { Application } from 'egg';

export default function(app: Application) {
  const { INTEGER, JSON, TINYINT, DATE } = app.Sequelize;

  return app.model.define('monitor', {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '主键, 自增ID',
    },
    uid: {
      type: INTEGER,
      allowNull: false,
      comment: '用户ID',
    },
    project_id: {
      type: INTEGER,
      allowNull: false,
      comment: '项目ID',
    },
    settings: {
      type: JSON,
      allowNull: false,
      comment: '监控设置内容',
    },
    status: {
      type: TINYINT,
      allowNull: false,
      defaultValue: 1,
      comment: '账户状态 - 0关闭, 1正常',
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
  }, {
    indexes: [{
      unique: true,
      fields: [ 'uid', 'project_id' ],
    }],
  });
}
