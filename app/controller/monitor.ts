import { Controller } from 'egg';

export default class MonitorController extends Controller {
  public async list() {
    const { ctx } = this;
    let page = 1;
    if (ctx.query.page) {
      page = parseInt(ctx.query.page);
    }
    if (isNaN(page) || page <= 0) {
      page = 1;
    }
    const page_size = 10;
    const offset = (page - 1) * page_size;
    const monitors = await ctx.service.monitor.List(offset, page_size);
    const total = monitors.count;
    const list: any = [];
    const projectArr = {};
    for (const item of monitors.rows) {
      if (!projectArr[item.project_id]) {
        projectArr[item.project_id] = await ctx.service.project.GetProjectByID(item.project_id);
      } else {
        projectArr[item.project_id].name;
      }
      let rootTraits: any = [];
      if (item.settings.traits) {
        rootTraits = Object.keys(item.settings.traits);
      }
      list.push({
        monitor: item,
        project: projectArr[item.project_id],
        rootTraits,
      });
    }
    await ctx.render('monitor/list', { title: '监控列表', page, page_size, total, list });
  }

  public async add() {
    const { ctx } = this;
    await ctx.render('monitor/add', { title: '添加监控' });
  }

  public async save() {
    const { ctx } = this;
    const data = ctx.request.body;
    if (!data.slug) {
      ctx.body = {
        code: -1000,
        status: 'error',
        msg: 'slug不能为空',
      };
      return;
    }

    const settings: any = {
      amount_or_percent: data.amount_or_percent,
      condition: data.condition,
    };
    if (data.amount_or_percent == 1) {
      settings.amount = data.amount;
    } else {
      settings.percent = data.percent;
    }

    if (data.traits) {
      const traitObj = {};
      for (let i = 0; i < data.traits.length; i++) {
        const traitArr = data.traits[i].split('|');
        if (!traitObj[traitArr[0]]) {
          traitObj[traitArr[0]] = [
            traitArr[1],
          ];
        } else {
          traitObj[traitArr[0]].push(traitArr[1]);
        }
      }
      settings.traits = traitObj;
    }

    const projectInfo = await ctx.service.project.GetProjectBySlug(data.slug);
    if (!projectInfo.id) {
      ctx.body = {
        code: -1000,
        status: 'error',
        msg: 'Slug信息不存在',
      };
      return;
    }

    let rs: boolean;
    try {
      await ctx.service.monitor.Add({
        uid: ctx.session.userinfo.id,
        project_id: projectInfo.id,
        settings,
        status: 1,
      });
      rs = true;
    } catch (err) {
      rs = false;
    }
    if (rs) {
      ctx.body = {
        code: 0,
        status: 'ok',
        msg: '添加成功',
      };
      return;
    }

    ctx.body = {
      code: -1000,
      status: 'error',
      msg: '添加失败',
    };
  }

  public async view() {
    const { ctx } = this;

    const id = ctx.params.id;
    if (!id) {
      ctx.redirect('/monitor/list');
    }

    const monitorInfo = await ctx.service.monitor.GetInfoByID(id);
    if (!monitorInfo || !monitorInfo.id) {
      ctx.redirect('/monitor/list');
    }

    if (ctx.session.userinfo.type != 2 && ctx.session.userinfo.id != monitorInfo.uid) {
      ctx.redirect('/monitor/list');
    }

    const projectInfo = await ctx.service.project.GetProjectByID(monitorInfo.project_id);
    if (!projectInfo || !projectInfo.id) {
      ctx.redirect('/monitor/list');
    }

    const trait = await ctx.service.trait.Traits(monitorInfo.project_id, false);
    const traits: any = {};
    const traitRoots: any = {};
    const traitSubs: any = {};
    for (const item of trait) {
      if (item.pid == 0) {
        traitRoots[item.id] = item.name;
        traitSubs[item.name] = [];
        traits[item.name] = {};
      } else {
        traits[traitRoots[item.pid]][item.name] = item.count;
        traitSubs[traitRoots[item.pid]].push(item.name);
      }
    }
    await ctx.render('monitor/edit', { title: '修改监控', monitorInfo, slug: projectInfo.slug, traits, roots: Object.keys(traits), traitSubs });
  }

  public async edit() {
    const { ctx } = this;
    const data = ctx.request.body;

    if (!data.id) {
      ctx.body = {
        code: -1000,
        status: 'error',
        msg: '缺少参数',
      };
      return;
    }

    const monitorInfo = await ctx.service.monitor.GetInfoByID(data.id);
    if (!monitorInfo || !monitorInfo.id) {
      ctx.body = {
        code: -1000,
        status: 'error',
        msg: '缺少参数',
      };
      return;
    }

    const settings: any = {
      amount_or_percent: data.amount_or_percent,
      condition: data.condition,
    };
    if (data.amount_or_percent == 1) {
      settings.amount = data.amount;
    } else {
      settings.percent = data.percent;
    }

    if (data.traits) {
      const traitObj = {};
      for (let i = 0; i < data.traits.length; i++) {
        const traitArr = data.traits[i].split('|');
        if (!traitObj[traitArr[0]]) {
          traitObj[traitArr[0]] = [
            traitArr[1],
          ];
        } else {
          traitObj[traitArr[0]].push(traitArr[1]);
        }
      }
      settings.traits = traitObj;
    }

    const projectInfo = await ctx.service.project.GetProjectBySlug(data.slug);
    if (!projectInfo.id) {
      ctx.body = {
        code: -1000,
        status: 'error',
        msg: 'Slug信息不存在',
      };
      return;
    }

    let rs: boolean;
    try {
      await monitorInfo.update({
        uid: ctx.session.userinfo.id,
        project_id: projectInfo.id,
        settings,
      });
      rs = true;
    } catch (err) {
      rs = false;
    }

    if (rs) {
      ctx.body = {
        code: 0,
        status: 'ok',
        msg: '修改成功',
      };
      return;
    }

    ctx.body = {
      code: -1000,
      status: 'error',
      msg: '修改失败',
    };
  }

  public async operation() {
    const { ctx } = this;
    const id = ctx.params.id;
    if (!id) {
      ctx.body = {
        code: -1000,
        status: 'error',
        msg: '缺少参数',
      };
      return;
    }

    const monitorInfo = await ctx.service.monitor.GetInfoByID(id);
    if (!monitorInfo || !monitorInfo.id) {
      ctx.body = {
        code: -1000,
        status: 'error',
        msg: '参数错误',
      };
      return;
    }

    let status = 0;
    if (ctx.request.body.status) {
      status = ctx.request.body.status;
    }
    const rs = await monitorInfo.update({ status });
    if (rs) {
      ctx.body = {
        code: 0,
        status: 'ok',
        msg: '操作成功.',
      };
    } else {
      ctx.body = {
        code: -1003,
        status: 'error',
        msg: '操作失败, 请稍后重试.',
      };
    }
  }

  public async check() {
    const { ctx } = this;
    const data = ctx.request.body;

    if (!data.slug && !data.contract_address) {
      ctx.body = {
        code: -3000,
        status: 'error',
        msg: '缺少参数 [slug], [contract_address]',
      };
      return;
    }

    let url = '';
    if (data.slug) {
      url = 'https://api.opensea.io/api/v1/collection/' + data.slug + '?format=json';
    } else if (data.contract_address) {
      url = 'https://api.opensea.io/api/v1/asset_contract/' + data.contract_address + '?format=json';
    }

    let collection: any = {};
    try {
      collection = await ctx.helper.httpsGet(url);
    } catch (err) {
      ctx.body = {
        code: -3002,
        status: 'error',
        msg: '信息获取失败 - 网络超时',
      };
      return;
    }

    if (collection && collection.collection) {
      const traitRootNames: any = [];
      const projectInfo = await ctx.service.project.GetProjectBySlug(collection.collection.slug);
      if (!projectInfo.id) {
        const projectModelData = {
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
        };
        const transaction = await ctx.model.transaction();
        try {
          const projectInfo = await ctx.service.project.Add(projectModelData);
          const traits = collection.collection.traits;
          const traitKeys = Object.keys(traits);
          for (let i = 0; i < traitKeys.length; i++) {
            const parentTraitName = traitKeys[i];
            const traitModelData = {
              project_id: projectInfo.id,
              pid: 0,
              name: parentTraitName,
              count: 0,
            };
            const traitInfo = await ctx.service.trait.Add(traitModelData);

            const subTraitKeys = Object.keys(traits[traitKeys[i]]);
            const subTraitArr: any = [];
            for (let j = 0; j < subTraitKeys.length; j++) {
              subTraitArr.push({
                project_id: projectInfo.id,
                pid: traitInfo.id,
                name: subTraitKeys[j],
                count: traits[traitKeys[i]][subTraitKeys[j]],
              });
            }
            traitRootNames.push(parentTraitName);
            await ctx.service.trait.MultiAdd(subTraitArr);
          }
          transaction.commit();
        } catch (err) {
          console.log(err);
          transaction.rollback();
        }
      } else {
        const traits = await ctx.service.trait.Traits(projectInfo.id, true);
        for (let i = 0; i < traits.length; i++) {
          traitRootNames.push(traits[i].name);
        }
      }

      ctx.body = {
        code: 0,
        status: 'ok',
        msg: '信息获取成功',
        data: collection.collection,
        traitRootNames,
      };
      return;
    }

    ctx.body = {
      code: -3001,
      status: 'error',
      msg: 'Slug信息不正确, 请确认后重试',
    };
  }
}
