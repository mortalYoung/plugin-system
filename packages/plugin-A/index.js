module.exports = function (stage) {
    return {
        // 表示啥时候执行
        timing: stage.Ready,
        handler: function () {
            console.log('插件 plugin-A')
        }
    }
}