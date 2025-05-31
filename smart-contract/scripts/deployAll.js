const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 开始部署多个合约...\n");
    
    const [deployer] = await ethers.getSigners();
    console.log("部署者地址:", deployer.address);
    console.log("账户余额:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH\n");

    const deployedContracts = {};

    try {
        // 部署 YDToken 合约
        console.log("📄 部署 YDToken...");
        const YDToken = await ethers.getContractFactory("YDToken");
        const initialSupply = 1000000; // 100万个代币
        const ydToken = await YDToken.deploy(initialSupply);
        await ydToken.waitForDeployment();
        deployedContracts.YDToken = await ydToken.getAddress();
        console.log("✅ YDToken 部署成功:", deployedContracts.YDToken);

        // 部署 Lock 合约
        console.log("\n📄 部署 Lock...");
        const Lock = await ethers.getContractFactory("Lock");
        // Lock 合约通常需要一个解锁时间参数
        const unlockTime = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60; // 1年后解锁
        const lock = await Lock.deploy(unlockTime, { value: ethers.parseEther("0.001") });
        await lock.waitForDeployment();
        deployedContracts.Lock = await lock.getAddress();
        console.log("✅ Lock 部署成功:", deployedContracts.Lock);

        // 部署 YDCoursePlatform 合约
        console.log("\n📄 部署 YDCoursePlatform...");
        const YDCoursePlatform = await ethers.getContractFactory("YDCoursePlatform");
        // 如果 YDCoursePlatform 需要 YDToken 地址作为参数
        const coursePlatform = await YDCoursePlatform.deploy(deployedContracts.YDToken);
        await coursePlatform.waitForDeployment();
        deployedContracts.YDCoursePlatform = await coursePlatform.getAddress();
        console.log("✅ YDCoursePlatform 部署成功:", deployedContracts.YDCoursePlatform);

        // 显示所有部署结果
        console.log("\n🎉 所有合约部署完成！");
        console.log("=".repeat(50));
        Object.entries(deployedContracts).forEach(([name, address]) => {
            console.log(`${name}: ${address}`);
        });
        
        // 保存部署信息到文件
        const fs = require('fs');
        const deploymentInfo = {
            network: "sepolia",
            timestamp: new Date().toISOString(),
            deployer: deployer.address,
            contracts: deployedContracts
        };
        
        fs.writeFileSync(
            'deployment-info.json', 
            JSON.stringify(deploymentInfo, null, 2)
        );
        console.log("📝 部署信息已保存到 deployment-info.json");
        console.log("=".repeat(50));

    } catch (error) {
        console.error("❌ 部署失败:", error);
        throw error;
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });