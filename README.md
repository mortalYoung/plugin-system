# plugin-system

This is a repository refer to umi. 

Everything in this repository are mocked.

## Get Started

```bash
yarn install
yarn start
```

and you will see 

```bash
启动服务中...
[Service]: 启动核心模块
[Service]: 初始化根目录
[Service]: 根目录为 /Users/***/projects/plugins-system
[Service]: 查找插件
[Service]: 查找到插件 plugin-a
[Service]: 加载核心模块
[Service]: 运行服务, 服务简单地分 4 个阶段
[Service]: ready 阶段
插件 plugin-A
[Service]: mount 阶段
[Service]: update 阶段
[Service]: unmount 阶段
```

## Description

I'll description for lerna package in packages.

- `cli` is a command repository which mainly for exec command

- `Core` is the most significant repository in this project

- `plugin-A` is just a mock plugin just for testing

## How works

When you tap `yarn start` in terminal, it actually exec `./packages/cli/bin/index.js` file.

And in this file, load `lib/index.js` which transformed from `src/index.ts`

Then, in `src/index.ts`, everything I do is just load `Core` and new a object named Core;