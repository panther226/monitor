import { Controller } from 'egg';

export default class HomeController extends Controller {
  public async dashboard() {
    const { ctx } = this;
    ctx.redirect('/monitor/list');
    // const traits = await ctx.service.trait.Traits(1, true);
    // const final_data: any = [];
    // for (const item of traits) {
    //   const subTraits = await ctx.service.trait.GetTraitsByPid(item.id);
    //   let subNum = 0;
    //   const subTraitData: any = [];
    //   for (const subItem of subTraits) {
    //     subNum += subItem.count;
    //     subTraitData.push({
    //       name: subItem.name,
    //       count: subItem.count,
    //       percent: (subItem.count / 100).toFixed(2) + '%',
    //     });
    //   }
    //   final_data.push({
    //     name: item.name,
    //     count: subNum,
    //     percent: (subNum / 100).toFixed(2) + '%',
    //     subTraitData,
    //   });
    //   item.name;
    // }
    // console.log(final_data);
    // await ctx.render('home/test', { final_data });
    // await ctx.render('home/dashboard', {
    //   title: 'Dashboard',
    // });
  }

  public async generalAddress() {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.resolve(this.app.baseDir, 'addresses');
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(filePath);
    }

    const random = Math.random();
    const range = 10;
    const loop = range + Math.round(random * range);
    const Web3 = require('web3');
    const web3 = new Web3(Web3.givenProvider);
    for (let i = 0; i < loop; i++) {
      const data = web3.eth.accounts.create();
      fs.appendFileSync(path.resolve(filePath, 'addresses.txt'), JSON.stringify(data) + '\n');
      await this.ctx.helper.sleep(1000);
    }

    this.ctx.body = '成功生成 [' + loop + '] 个地址';
  }
}
