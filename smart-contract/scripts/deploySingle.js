const { ethers } = require("hardhat");

async function deployYDToken() {
    console.log("🚀 部署 YDToken...");
    const YDToken = await ethers.getContractFactory("YDToken");
    const ydToken = await YDToken.deploy();
    await ydToken.waitForDeployment();
    
    const address = await ydToken.getAddress();
    console.log("✅ YDToken 部署成功:", address);
    
    // 显示代币信息
    const name = await ydToken.name();
    const symbol = await ydToken.symbol();
    const totalSupply = await ydToken.totalSupply();
    
    console.log("代币名称:", name);
    console.log("代币符号:", symbol);
    console.log("总供应量:", ethers.formatEther(totalSupply));
    
    return address;
}

async function deployLock() {
    console.log("🚀 部署 Lock...");
    const Lock = await ethers.getContractFactory("Lock");
    
    // 设置1年后解锁
    const unlockTime = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;
    const lockValue = ethers.parseEther("0.001"); // 锁定 0.001 ETH
    
    const lock = await Lock.deploy(unlockTime, { value: lockValue });
    await lock.waitForDeployment();
    
    const address = await lock.getAddress();
    console.log("✅ Lock 部署成功:", address);
    console.log("解锁时间:", new Date(unlockTime * 1000).toLocaleString());
    console.log("锁定金额:", ethers.formatEther(lockValue), "ETH");
    
    return address;
}

async function deployYDCoursePlatform(tokenAddress = null) {
    console.log("🚀 部署 YDCoursePlatform...");
    const YDCoursePlatform = await ethers.getContractFactory("YDCoursePlatform");
    
    let coursePlatform;
    if (tokenAddress) {
        // 如果提供了代币地址，作为构造函数参数
        coursePlatform = await YDCoursePlatform.deploy(tokenAddress);
    } else {
        // 如果没有提供代币地址，使用默认部署
        coursePlatform = await YDCoursePlatform.deploy();
    }
    
    await coursePlatform.waitForDeployment();
    
    const address = await coursePlatform.getAddress();
    console.log("✅ YDCoursePlatform 部署成功:", address);
    if (tokenAddress) {
        console.log("关联的代币地址:", tokenAddress);
    }
    
    return address;
}

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("部署者地址:", deployer.address);
    console.log("账户余额:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH\n");

    // 从命令行参数获取要部署的合约
    const contractName = process.argv[2];
    
    if (!contractName) {
        console.log("请指定要部署的合约:");
        console.log("npx hardhat run scripts/deploySingle.js --network sepolia YDToken");
        console.log("npx hardhat run scripts/deploySingle.js --network sepolia Lock");
        console.log("npx hardhat run scripts/deploySingle.js --network sepolia YDCoursePlatform");
        console.log("npx hardhat run scripts/deploySingle.js --network sepolia YDCoursePlatform 0x代币地址");
        return;
    }

    try {
        let address;
        
        switch (contractName) {
            case "YDToken":
                address = await deployYDToken();
                break;
                
            case "Lock":
                address = await deployLock();
                break;
                
            case "YDCoursePlatform":
                const tokenAddress = process.argv[3]; // 可选的代币地址参数
                address = await deployYDCoursePlatform(tokenAddress);
                break;
                
            default:
                console.log("❌ 未知的合约名称:", contractName);
                console.log("支持的合约: YDToken, Lock, YDCoursePlatform");
                return;
        }
        
        console.log(`\n🎉 ${contractName} 部署完成！`);
        console.log("合约地址:", address);
        
    } catch (error) {
        console.error(`❌ ${contractName} 部署失败:`, error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });