'use strict';

import { Application } from 'egg';

export default function(app: Application) {
  const { INTEGER, TINYINT, DOUBLE, STRING, JSON, DATE } = app.Sequelize;

  return app.model.define('element', {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '主键, 自增ID',
    },
    open_sea_id: {
      type: INTEGER,
      unique: true,
      allowNull: false,
      comment: 'OpenSea ID',
    },
    project_id: {
      type: INTEGER,
      allowNull: false,
      comment: '项目ID',
    },
    image_url: {
      type: STRING(2048),
      comment: '图片地址',
    },
    token_id: {
      type: STRING(512),
      allowNull: false,
      comment: 'Token ID',
    },
    name: {
      type: STRING(128),
      comment: '名称',
    },
    description: {
      type: STRING(2048),
      comment: '描述',
    },
    traits: {
      type: JSON,
      comment: '特征列表 JSON格式',
    },
    is_sale: {
      type: TINYINT,
      comment: '是否在售',
    },
    sale_amount: {
      type: DOUBLE(128, 4),
      comment: '在售价格',
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
