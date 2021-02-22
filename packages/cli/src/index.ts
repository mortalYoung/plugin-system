import Core from '../../Core/lib';
module.exports = function () {
    console.log('启动服务中...');
    const core = new Core();
    core.run();
}