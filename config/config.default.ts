import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg';

import * as path from 'path';

export default (appInfo: EggAppInfo) => {
  const config = {} as PowerPartial<EggAppConfig>;

  // override config from framework / plugin
  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1657209871785_7976';

  config.view = {
    root: [
      path.join(appInfo.baseDir, 'app/view'),
      path.join(appInfo.baseDir, 'path/to/another'),
    ].join(','),
    defaultViewEngine: 'nunjucks',
    defaultExtension: '.html',
    mapping: {
      '.html': 'nunjucks',
    },
  };

  config.middleware = [
    'auth',
  ];

  config.auth = {
    ignore: [ '/login', '/register', '/lock', '/forget-password', '/reset-password' ],
  };

  config.sequelize = {
    dialect: 'mysql',
    host: '127.0.0.1',
    port: 3306,
    username: 'root',
    password: '123456',
    database: 'monitor',
    define: {
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  };

  // the return config will combines to EggAppConfig
  return {
    ...config,
  };
};
