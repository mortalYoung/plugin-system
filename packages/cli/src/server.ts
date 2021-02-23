import Core from '../../Core/lib';

process.on('message', (msg) => {
    console.log(`get message from parent server: ${msg}`)
});
console.log('启动服务器完毕');
const core = new Core();
core.run();
