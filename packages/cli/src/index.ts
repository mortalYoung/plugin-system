const { fork } = require('child_process');

module.exports = function () {
    console.log('启动服务中...');
    const child = fork(require.resolve('./server.js'), [...(process.argv.slice(2) || [])], {
        stdio: 'inherit',
    });

    // handle exit signals
    child.on('exit', (code, signal) => {
        if (signal === 'SIGABRT') {
            process.exit(1);
        }

        process.exit(code);
    });

    // for e2e test
    child.on('message', args => {
        if (process.send) {
            process.send(args);
        }
    });

    process.on('SIGINT', () => {
        child.kill('SIGINT');
    });

    process.on('SIGTERM', () => {
        child.kill('SIGTERM');
    });
}