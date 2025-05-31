const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 开始部署 YDToken...\n");
    
    const [deployer] = await ethers.getSigners();
    console.log("部署者地址:", deployer.address);
    console.log("账户余额:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH\n");

    try {
        // 部署 YDToken 合约
        console.log("📄 部署 YDToken...");
        const YDToken = await ethers.getContractFactory("YDToken");
        
        // 设置初始供应量 (注意：合约内部会自动乘以 10**decimals)
        const initialSupply = 1000000; // 100万个代币 (合约内部会处理小数位)
        
        console.log("初始供应量:", initialSupply.toLocaleString());
        const ydToken = await YDToken.deploy(initialSupply);
        
        console.log("⏳ 等待部署确认...");
        await ydToken.waitForDeployment();
        
        const address = await ydToken.getAddress();
        console.log("✅ YDToken 部署成功:", address);
        
        // 获取代币信息
        const name = await ydToken.name();
        const symbol = await ydToken.symbol();
        const totalSupply = await ydToken.totalSupply();
        const decimals = await ydToken.decimals();
        
        console.log("\n📊 代币信息:");
        console.log("名称:", name);
        console.log("符号:", symbol);
        console.log("小数位数:", decimals);
        console.log("总供应量:", ethers.formatEther(totalSupply), symbol);
        
        // 等待区块确认
        console.log("\n⏳ 等待区块确认...");
        await ydToken.deploymentTransaction().wait(6);
        
        console.log("\n🎉 YDToken 部署完成！");
        console.log("合约地址:", address);
        console.log("请保存此地址用于后续操作");
        
    } catch (error) {
        console.error("❌ YDToken 部署失败:", error);
        throw error;
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });