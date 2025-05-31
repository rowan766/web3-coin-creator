const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 开始部署 YDCoursePlatform...\n");
    
    const [deployer] = await ethers.getSigners();
    console.log("部署者地址:", deployer.address);
    console.log("账户余额:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH\n");

    // YD代币地址 - 请填入你已部署的YDToken合约地址
    // 如果还没有部署YDToken，请先运行: npx hardhat run scripts/deployYDToken.js --network sepolia
    const YD_TOKEN_ADDRESS = "0x23941b01e2F0fDF214d4d440FB4654C00deBb52D"; // 请填入你的YDToken合约地址
    
    // 检查是否提供了代币地址
    if (!YD_TOKEN_ADDRESS || YD_TOKEN_ADDRESS === "") {
        console.log("❌ 错误: 请先设置YD代币地址!");
        console.log("步骤:");
        console.log("1. 先部署YDToken: npx hardhat run scripts/deployYDToken.js --network sepolia");
        console.log("2. 复制YDToken合约地址");
        console.log("3. 在此脚本中修改 YD_TOKEN_ADDRESS 变量");
        console.log("4. 重新运行此脚本");
        return;
    }

    try {
        // 验证代币地址格式
        if (!ethers.isAddress(YD_TOKEN_ADDRESS)) {
            throw new Error("无效的代币地址格式");
        }

        console.log("📄 部署 YDCoursePlatform...");
        console.log("使用的YD代币地址:", YD_TOKEN_ADDRESS);
        
        const YDCoursePlatform = await ethers.getContractFactory("YDCoursePlatform");
        const coursePlatform = await YDCoursePlatform.deploy(YD_TOKEN_ADDRESS);
        
        console.log("⏳ 等待部署确认...");
        await coursePlatform.waitForDeployment();
        
        const platformAddress = await coursePlatform.getAddress();
        console.log("✅ YDCoursePlatform 部署成功:", platformAddress);
        
        // 获取合约信息
        const owner = await coursePlatform.owner();
        const ydToken = await coursePlatform.ydToken();
        const platformFeePercentage = await coursePlatform.platformFeePercentage();
        const platformFeeRecipient = await coursePlatform.platformFeeRecipient();
        
        console.log("\n📊 合约信息:");
        console.log("合约所有者:", owner);
        console.log("YD代币地址:", ydToken);
        console.log("平台手续费:", platformFeePercentage.toString() + "%");
        console.log("手续费接收地址:", platformFeeRecipient);
        
        // 等待区块确认
        console.log("\n⏳ 等待区块确认...");
        await coursePlatform.deploymentTransaction().wait(6);
        
        console.log("\n🎉 YDCoursePlatform 部署完成！");
        console.log("合约地址:", platformAddress);
        console.log("\n📝 保存以下信息:");
        console.log("YDCoursePlatform地址:", platformAddress);
        console.log("YDToken地址:", YD_TOKEN_ADDRESS);
        
        console.log("\n🔧 后续可用功能:");
        console.log("- 创建课程: createCourse()");
        console.log("- 购买课程: purchaseCourse()");
        console.log("- 查看课程: getCourse()");
        console.log("- 管理平台: setPlatformFeePercentage()");
        
    } catch (error) {
        console.error("❌ YDCoursePlatform 部署失败:", error);
        throw error;
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });