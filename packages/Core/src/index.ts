const pkg = require('../../../package.json');
const path = require('path');

const logger = (str: string) => {
    console.log(`[Service]: ${str}`);
}

interface IPlugin {
    key: string;
    name: string;
    path: string;
}

interface IPluginProps {
    // 自定义插件执行时机
    timing: IStage;
    // 插件执行
    handler: Function;
}

enum IStage {
    Init = 0,
    Ready = 1,
    Mount = 2,
    Update = 3,
    Unmount = 4
}

class Service {
    // 根目录
    private cwd: string = '';

    private plugins: { [id: string]: IPlugin; } = {};

    // 在 init 阶段无法执行插件
    private stage: IStage = IStage.Init;

    // 插件执行
    private cachePlugins: IPluginProps[] = [];

    constructor(props) {
        logger('启动核心模块');
        this.initCwd();
        this.findPlugins();
    }

    setStage(stage: IStage, callback?) {
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
        const { devDependencies, dependencies } = pkg;
        const dependencieLoop = (key: string) => {
            // 如果是以 plugin- 开头的依赖则认定为是插件
            if (key.startsWith('plugin-')) {
                if (!this.plugins.hasOwnProperty(key)) {
                    logger(`查找到插件 ${key}`);
                    this.plugins[key] = {
                        key,
                        name: key,
                        path: path.resolve(this.cwd, `node_modules/${key}`)
                    }
                } else {
                    // 如果有多版本的存在 简单地取前者
                }
            }
        }
        Object.keys(devDependencies).forEach(dependencieLoop);
        Object.keys(dependencies).forEach(dependencieLoop);
    }

    run() {
        logger('加载核心模块');
        Object.keys(this.plugins).forEach(key => {
            const pluginPath = this.plugins[key].path;
            const pluginPkg = require(path.resolve(pluginPath, 'package.json'));
            const mainEntry = path.resolve(this.plugins[key].path, pluginPkg.main);
            const plugin = require(mainEntry);
            this.cachePlugins.push(plugin(IStage));
        });
        this.pipe();
    }

    pipe() {
        logger('运行服务, 服务简单地分 4 个阶段');
        this.ready();
        this.mount();
        this.update();
        this.unmount();
    }

    switchStage(prevStage: IStage, nextStage: IStage) {
        const currentPlugins = this.cachePlugins.filter(plugin => plugin.timing === nextStage);
        currentPlugins.forEach(plugin => {
            // 执行当前 stage 的插件
            plugin.handler();
        })
    }

    ready() {
        logger('ready 阶段');
        this.setStage(IStage.Ready, this.switchStage.bind(this));
    }
    mount() {
        logger('mount 阶段');
        this.setStage(IStage.Mount, this.switchStage.bind(this));
    }
    update() {
        logger('update 阶段');
        this.setStage(IStage.Update, this.switchStage.bind(this));
    }
    unmount() {
        logger('unmount 阶段');
        this.setStage(IStage.Unmount, this.switchStage.bind(this));
    }
}

export default Service;