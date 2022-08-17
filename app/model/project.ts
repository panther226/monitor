'use strict';

import { Application } from 'egg';

export default function(app: Application) {
  const { INTEGER, STRING, TINYINT, DATE } = app.Sequelize;

  return app.model.define('project', {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '主键, 自增ID',
    },
    name: {
      type: STRING(256),
      unique: true,
      allowNull: false,
      comment: '项目名',
    },
    contract_address: {
      type: STRING(256),
      comment: '合约地址',
    },
    schema_name: {
      type: STRING(32),
      comment: '合约协议类型, ERC-721, ERC-1155',
    },
    symbol: {
      type: STRING(128),
      comment: 'NFT标识(符号)',
    },
    image_url: {
      type: STRING(512),
      comment: '项目图片地址',
    },
    slug: {
      type: STRING(256),
      unique: true,
      comment: '项目唯一标识',
    },
    banner_image_url: {
      type: STRING(512),
      comment: '项目Banner地址',
    },
    description: {
      type: STRING(512),
      comment: '项目描述',
    },
    created_date: {
      type: DATE(6),
      comment: '项目创建时间',
    },
    one_day_volume: {
      type: STRING(128),
      comment: '单日Volume',
    },
    one_day_change: {
      type: STRING(128),
      comment: '单日Change',
    },
    one_day_sales: {
      type: STRING(128),
      comment: '单日销量(交易量)',
    },
    one_day_average_price: {
      type: STRING(128),
      comment: '单日交易平均价',
    },
    seven_day_volume: {
      type: STRING(128),
      comment: '七日Volume',
    },
    seven_day_change: {
      type: STRING(128),
      comment: '七日Change',
    },
    seven_day_sales: {
      type: STRING(128),
      comment: '单日销量(交易量)',
    },
    seven_day_average_price: {
      type: STRING(128),
      comment: '7日交易平均价',
    },
    thirty_day_volume: {
      type: STRING(128),
      comment: '月Volume',
    },
    thirty_day_change: {
      type: STRING(128),
      comment: '月Change',
    },
    thirty_day_sales: {
      type: STRING(128),
      comment: '月销量(交易量)',
    },
    thirty_day_average_price: {
      type: STRING(128),
      comment: '月平均单价',
    },
    total_volume: {
      type: STRING(128),
      comment: '总Volume',
    },
    total_sales: {
      type: STRING(128),
      comment: '总销量',
    },
    total_supply: {
      type: STRING(128),
      comment: '总发行量',
    },
    num_owners: {
      type: STRING(128),
      comment: 'Owner数',
    },
    average_price: {
      type: STRING(128),
      comment: '平均价',
    },
    market_cap: {
      type: STRING(128),
      comment: '市场交易限额',
    },
    floor_price: {
      type: STRING(128),
      comment: '地板价',
    },
    status: {
      type: TINYINT,
      allowNull: false,
      defaultValue: 0,
      comment: '账户状态 - 0停止监控, 1正常监控',
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
