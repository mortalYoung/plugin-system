"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _react() {
  const data = _interopRequireDefault(require("react"));

  _react = function _react() {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const pkg = require('../../../package.json');

const path = require('path');

const fs = require('fs');

const ProgressBar = require('progress');

const noisy = true;

const logger = (str, noi = noisy) => {
  if (noi) {
    console.log(`[Service]: ${str}`);
  }
};

var IStage;

(function (IStage) {
  IStage[IStage["Init"] = 0] = "Init";
  IStage[IStage["Ready"] = 1] = "Ready";
  IStage[IStage["Mount"] = 2] = "Mount";
  IStage[IStage["Update"] = 3] = "Update";
  IStage[IStage["Unmount"] = 4] = "Unmount";
})(IStage || (IStage = {}));

class Service {
  // 根目录
  // 在 init 阶段无法执行插件
  // 用于标记是否在 Ready 阶段之前执行了 run 函数 如果是则缓存一下等到 Ready 阶段执行 run 函数
  constructor(props) {
    this.cwd = '';
    this.plugins = {};
    this.stage = IStage.Init;
    this.bufferRun = false;
    logger('启动核心模块', true);
    const bar = new ProgressBar('  bootstraping [:bar] :percent', {
      complete: '=',
      incomplete: ' ',
      width: 20,
      total: 5,
      clear: true
    });
    const timeout = setInterval(() => {
      bar.tick();

      if (bar.complete) {
        clearInterval(timeout);
        this.initCwd();
        this.findPlugins(); // 启动完成核心模块后进入 ready 阶段

        this.ready();
      }
    }, 500);
  }

  setStage(stage, callback) {
    const prevStage = this.stage;
    this.stage = stage;

    if (callback) {
      callback(prevStage, stage);
    }
  }

  initCwd() {
    logger('初始化根目录');
    this.cwd = process.cwd();
    logger(`根目录为 ${this.cwd}`);
  }

  findPlugins() {
    logger('查找插件');
    this.findByPackage();
  }

  findByPackage() {
    const devDependencies = pkg.devDependencies,
          dependencies = pkg.dependencies;

    const dependencieLoop = key => {
      // 如果是以 plugin- 开头的依赖则认定为是插件
      if (key.startsWith('plugin-')) {
        if (!this.plugins.hasOwnProperty(key)) {
          logger(`查找到插件 ${key}`);
          this.plugins[key] = {
            key,
            name: key,
            path: path.resolve(this.cwd, `node_modules/${key}`)
          };
        } else {// 如果有多版本的存在 简单地取前者
        }
      }
    };

    Object.keys(devDependencies).forEach(dependencieLoop);
    Object.keys(dependencies).forEach(dependencieLoop);
  }

  run() {
    if (this.stage < IStage.Ready) {
      // 如果还没到 ready 阶段无法执行 run
      this.bufferRun = true;
    } else {
      logger('加载核心模块', true);
      Object.keys(this.plugins).forEach(key => {
        const pluginPath = this.plugins[key].path;

        const pluginPkg = require(path.resolve(pluginPath, 'package.json'));

        const mainEntry = path.resolve(this.plugins[key].path, pluginPkg.main);

        const plugin = require(mainEntry);

        Object.assign(this.plugins[key], plugin(IStage));
      }); // 去触发在 Ready 阶段执行的 plugins

      this.switchStage(null, IStage.Ready);
    }
  }

  switchStage(prevStage, nextStage) {
    const currentPlugins = Object.values(this.plugins).filter(plugin => plugin.timing === nextStage);
    currentPlugins.forEach(plugin => {
      // 执行当前 stage 的插件
      plugin.handler();
    });
  }

  ready() {
    logger('ready 阶段', true);
    this.setStage(IStage.Ready, this.switchStage.bind(this));

    if (this.bufferRun) {
      this.bufferRun = false;
      this.run();
    }
  }

  mount() {
    logger('mount 阶段', true);
    this.setStage(IStage.Mount, this.switchStage.bind(this));
  }

  update() {
    logger('update 阶段', true);
    this.setStage(IStage.Update, this.switchStage.bind(this));
  }

  unmount() {
    logger('unmount 阶段', true);
    this.setStage(IStage.Unmount, this.switchStage.bind(this));
  }

}

var _default = Service;
exports.default = _default;