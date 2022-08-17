import * as jdenticon from 'jdenticon';
// const https = require('https');

export default {
  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },
  GeneralAvatar(value: string, size: number, type: string) {
    jdenticon.configure({
      lightness: {
        color: [ 0.20, 0.80 ],
        grayscale: [ 0.20, 0.80 ],
      },
      saturation: {
        color: 0.50,
        grayscale: 0.50,
      },
      backColor: '#0000',
    });

    if (type === 'svg') {
      return jdenticon.toSvg(value, size);
    }

    return jdenticon.toPng(value, size);
  },
  async httpsGet(url: string) {
    const superagent = require('superagent');
    try {
      const response = await superagent.get(url);
      return response.body;
    } catch (error: any) {
      console.log('request failed: ', error);
    }
  },
  async SendEmail(receivers: any = [], title: string, content:string) {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: 'smtp.163.com',
      secure: true,
      auth: {
        user: 'btx_tech@163.com',
        pass: 'HCYYPGVXNZKGWXXK',
      },
    });
    return await transporter.sendMail({
      from: '"NFT Monitor" <btx_tech@163.com>',
      to: receivers.join(','),
      subject: title,
      // text: content,
      html: content,
    });
  },
  async GeneralMailContent(token_id, contract_address, current_price, img_url, name, condition, traits) {
    const { ctx }: any = this;
    // console.log(this.ctx.renderString(''));
    return await ctx.renderView('home/email', {
      token_id, contract_address, current_price, img_url, name, condition, traits,
    });
  },
};
