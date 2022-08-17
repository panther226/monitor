'use strict';

import Utils from 'web3-utils';

/**
 * 获取 OpenSea 项目元素的定时任务脚本
 */
const ElementSubscription = require('egg').Subscription;
let projectFlag = false;
let elementFlag = false;
const monitorProjects = {};
const monitorSettings = {};
class ElementInterval extends ElementSubscription {
  async subscribe() {
    const { ctx } = this;
    if (!projectFlag) {
      projectFlag = true;
      const monitors = await ctx.service.monitor.GetMonitors();
      const projectIds: any = [];
      for (const item of monitors) {
        projectIds.push(item.project_id);
        monitorSettings[item.project_id] = item.settings;
      }
      if (projectIds.length > 0) {
        const projectList = await ctx.service.project.GetProjectByIds(projectIds);
        try {
          for (const item of projectList) {
            monitorProjects[item.slug] = {
              id: item.id,
              contract_address: item.contract_address,
              total_supply: item.total_supply,
              floor_price: item.floor_price,
            };
            const url = 'https://api.opensea.io/api/v1/collection/' + item.slug + '?format=json';
            const collection = await ctx.helper.httpsGet(url);
            if (collection && collection.collection) {
              monitorProjects[collection.collection.slug].floor_price = collection.collection.stats.floor_price;
              item.update({
                name: collection.collection.name,
                contract_address: collection.collection.primary_asset_contracts[0].address,
                schema_name: collection.collection.primary_asset_contracts[0].schema_name,
                symbol: collection.collection.primary_asset_contracts[0].symbol,
                image_url: collection.collection.image_url,
                slug: collection.collection.slug,
                banner_image_url: collection.collection.banner_image_url,
                description: collection.collection.description,
                created_date: collection.collection.created_date,
                one_day_volume: collection.collection.stats.one_day_volume,
                one_day_change: collection.collection.stats.one_day_change,
                one_day_average_price: collection.collection.stats.one_day_average_price,
                one_day_sales: collection.collection.stats.one_day_sales,
                seven_day_volume: collection.collection.stats.seven_day_volume,
                seven_day_change: collection.collection.stats.seven_day_change,
                seven_day_average_price: collection.collection.stats.seven_day_average_price,
                seven_day_sales: collection.collection.stats.seven_day_sales,
                thirty_day_volume: collection.collection.stats.thirty_day_volume,
                thirty_day_change: collection.collection.stats.thirty_day_change,
                thirty_day_average_price: collection.collection.stats.thirty_day_average_price,
                thirty_day_sales: collection.collection.stats.thirty_day_sales,
                total_volume: collection.collection.stats.total_volume,
                total_sales: collection.collection.stats.total_sales,
                total_supply: collection.collection.stats.total_supply,
                num_owners: collection.collection.stats.num_owners,
                average_price: collection.collection.stats.average_price,
                market_cap: collection.collection.stats.market_cap,
                floor_price: collection.collection.stats.floor_price,
                status: 1,
              });
            }
          }
        } catch (err) {
          console.log('err', err);
        }
      }
      projectFlag = false;
    }

    if (!elementFlag) {
      elementFlag = true;
      // console.log(monitorProjectKeys);
      // for (const slug of monitorProjectKeys) {
      //   const assets_url = 'https://api.opensea.io/api/v1/assets?collection_slug=' + slug + '&include_orders=true&limit=10';
      //   console.log(assets_url);
      //   const assetCollection = await ctx.helper.httpsGet(assets_url);
      //   console.log('assetCollection', assetCollection);
      //   await this.ctx.helper.sleep(1000);
      //   break;
      // }
      // console.log(monitorProjectKeys, monitorProjectKeys.length);
      if (Object.keys(monitorProjects).length > 0) {
        const path = require('path');
        const basePath = path.resolve(this.app.baseDir, 'json');
        const fs = require('fs');

        for (let i = 1; i <= 53; i++) {
          const current_file_path = basePath + '/' + i + '.json';
          if (fs.existsSync(current_file_path)) {
            const content = fs.readFileSync(current_file_path);
            await this.elementWriteToDB(content);
          }
        }
      }

      // elementFlag = false;
    }
  }

  static get schedule() {
    return {
      interval: '1h',
      type: 'worker',
    };
  }

  async elementWriteToDB(content) {
    const data = JSON.parse(content);

    for (const item of data.assets) {
      let is_sale = 0;
      let sale_amount: any = 0;
      if (item.seaport_sell_orders && item.seaport_sell_orders[0]) {
        is_sale = 1;
        if (!isNaN(item.seaport_sell_orders[0].current_price)) {
          sale_amount = Utils.fromWei(item.seaport_sell_orders[0].current_price, 'ether');
        }
      }
      const image_url = item.image_url ? item.image_url : '';
      const name = item.name ? item.name : '#' + item.token_id;
      const projectInfo = monitorProjects[item.collection.slug];

      const project_id = projectInfo.id;
      const setting_conditions = monitorSettings[project_id];
      if (setting_conditions && sale_amount > 0) {
        if (await this.checkAmount(projectInfo.floor_price, sale_amount, setting_conditions)) {
          const settingConditions = await this.getConditionString(projectInfo.floor_price, sale_amount, setting_conditions);
          let settingTraits = '';
          const keys = Object.keys(setting_conditions.traits);
          if (keys.length > 0) {
            for (const key of keys) {
              settingTraits += key + ' - ' + setting_conditions.traits[key] + '<br />';
            }
          }
          const mailContent = await this.ctx.helper.GeneralMailContent(name, item.asset_contract.address, sale_amount, image_url, name, settingConditions, settingTraits);
          await this.ctx.helper.SendEmail([ '505154677@qq.com' ], 'NFT Monitor: 监控到符合条件的NFT', mailContent);
        }
      }

      await this.ctx.service.element.CreateOrUpdate({
        values: {
          open_sea_id: item.id,
          project_id,
          image_url,
          token_id: item.token_id,
          name,
          description: item.description,
          traits: item.traits,
          is_sale,
          sale_amount,
        },
        condition: { open_sea_id: item.id },
      });
    }
  }

  async checkAmount(floor_price:number, amount: number, settings: any) {
    const calcAmount = settings.amount_or_percent == 1 ? parseFloat(settings.amount) : (floor_price * settings.percent / 100);
    if (settings.condition == 1) {
      return amount < calcAmount;
    } else if (settings.condition == 2) {
      return amount == calcAmount;
    } else if (settings.condition == 3) {
      return amount <= calcAmount;
    }

    return false;
  }

  async getConditionString(floor_price:number, amount: number, settings: any) {
    const calcAmount = settings.amount_or_percent == 1 ? parseFloat(settings.amount).toFixed(4) : (floor_price * settings.percent / 100).toFixed(4);
    let conditionStr = amount + '';
    if (settings.condition == 1) {
      conditionStr += ' < ' + calcAmount;
    } else if (settings.condition == 2) {
      conditionStr += ' = ' + calcAmount;
    } else if (settings.condition == 3) {
      conditionStr += ' <= ' + calcAmount;
    }
    return conditionStr;
  }
}

module.exports = ElementInterval;
