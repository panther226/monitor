import { Application } from 'egg';

export default (app: Application) => {
  const { controller, router } = app;

  router.get('/login', controller.user.login);
  router.post('/login', controller.user.doLogin);
  router.get('/register', controller.user.register);
  router.post('/register', controller.user.doRegister);
  router.get('/lock', controller.user.lock);
  router.post('/lock', controller.user.unlock);
  router.get('/forget-password', controller.user.forget);
  router.post('/forget-password', controller.user.sendEmail);
  router.get('/reset-password', controller.user.reset);
  router.post('/reset-password', controller.user.doReset);
  router.get('/logout', controller.user.logout);

  router.get('/', controller.home.dashboard);
  router.get('/generalAddresses', controller.home.generalAddress);

  router.get('/monitor/list', controller.monitor.list);
  router.get('/monitor/add', controller.monitor.add);
  router.post('/monitor/add', controller.monitor.save);
  router.get('/monitor/edit/:id', controller.monitor.view);
  router.post('/monitor/edit', controller.monitor.edit);
  router.post('/monitor/check', controller.monitor.check);
  router.post('/monitor/operation/:id', controller.monitor.operation);

  router.get('/setting/users', controller.setting.users);
  router.get('/setting/user/add', controller.setting.addUser);
  router.post('/setting/user/add', controller.setting.createUser);
  router.get('/setting/user/edit/:id', controller.setting.editUser);
  router.post('/setting/user/operation/:id', controller.setting.operation);
  router.post('/setting/user/edit', controller.setting.saveUser);
  router.get('/setting/logs', controller.setting.logs);
};
