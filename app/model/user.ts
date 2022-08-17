'use strict';

import { Application } from 'egg';

export default function(app: Application) {
  const { INTEGER, STRING, TINYINT, DATE } = app.Sequelize;

  return app.model.define('users', {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '主键, 自增ID',
    },
    email: {
      type: STRING(128),
      unique: true,
      allowNull: false,
      comment: '邮箱地址',
    },
    password: {
      type: STRING(64),
      allowNull: false,
      comment: '账户密码',
    },
    rand: {
      type: STRING(12),
      allowNull: false,
      comment: '随机字符 - 用于密码二次加密',
    },
    type: {
      type: TINYINT,
      allowNull: false,
      defaultValue: 1,
      comment: '账户类型 - 1普通账户, 2高级账户',
    },
    status: {
      type: TINYINT,
      allowNull: false,
      defaultValue: 0,
      comment: '账户状态 - -1冻结, 0未激活, 1正常',
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
