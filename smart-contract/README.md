# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.js
```

*
*
* 启动本地区块链 npx hardhat node （类似手动打开Ganache软件）
* 编译合约  npx hardhat compile
* 清理之前编译的文件 npx hardhat clean
* 运行测试  npx hardhat test
* 部署到本地网络  npx hardhat ignition deploy  ./ignition/modules/YDToken.js

### 部署说明

#### 本地部署

1. 先启动本地终端  npx hardhat node
2. 执行合约的编译、测试、脚本
3. npx hardhat ignition deploy  ./ignition/modules/YDToken.js --network localhost
4. 注意：课程合约要将讲代币地址填上去再去跑测试脚本

#### 部署Sepolia测试网

1. npx hardhat run scripts/deployYDToken.js --network sepolia
2. 注意：课程合约要将讲代币地址填上去再去跑测试脚本
