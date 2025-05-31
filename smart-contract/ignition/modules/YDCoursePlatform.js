// scripts/deployCourse.js
const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 开始部署课程平台合约...");
  
  // 获取网络信息
  const network = await ethers.provider.getNetwork();
  console.log("📡 部署网络:", network.name, "Chain ID:", network.chainId);
  
  // 获取部署账户
  const [deployer] = await ethers.getSigners();
  console.log("👤 部署账户:", deployer.address);
  console.log("💰 账户余额:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");

  // YD代币合约地址 - 根据不同网络设置
  let ydTokenAddress;
  
  if (network.chainId === 1337n || network.chainId === 31337n) {
    // 本地网络 - 需要先部署YD代币或使用已部署的地址
    console.log("🏠 检测到本地网络，需要YD代币合约地址");
    
    // 选项1: 使用已部署的YD代币地址
    ydTokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // 替换为你的YD代币地址
    
    // 选项2: 先部署YD代币（如果还没有）
    // console.log("📝 先部署YD代币合约...");
    // const YDToken = await ethers.getContractFactory("YDToken");
    // const ydToken = await YDToken.deploy(10000000); // 1000万初始供应量
    // await ydToken.waitForDeployment();
    // ydTokenAddress = await ydToken.getAddress();
    // console.log("✅ YD代币合约地址:", ydTokenAddress);
    
  } else if (network.chainId === 11155111n) {
    // Sepolia测试网
    ydTokenAddress = "0x..."; // 替换为Sepolia上的YD代币地址
  } else if (network.chainId === 1n) {
    // 以太坊主网
    ydTokenAddress = "0x..."; // 替换为主网上的YD代币地址
  } else {
    throw new Error(`不支持的网络: ${network.name} (Chain ID: ${network.chainId})`);
  }

  console.log("🎯 使用YD代币地址:", ydTokenAddress);

  // 验证YD代币合约是否存在
  try {
    const code = await ethers.provider.getCode(ydTokenAddress);
    if (code === "0x") {
      throw new Error("YD代币合约地址无效或合约不存在");
    }
    console.log("✅ YD代币合约验证成功");
  } catch (error) {
    console.error("❌ YD代币合约验证失败:", error.message);
    return;
  }

  // 部署课程平台合约
  console.log("📚 部署课程平台合约...");
  const CoursePlatform = await ethers.getContractFactory("YDCoursePlatform");
  
  // 估算Gas费用
  const deploymentData = CoursePlatform.interface.encodeDeploy([ydTokenAddress]);
  const estimatedGas = await ethers.provider.estimateGas({
    data: deploymentData
  });
  console.log("⛽ 预估Gas费用:", estimatedGas.toString());

  // 部署合约
  const coursePlatform = await CoursePlatform.deploy(ydTokenAddress);
  console.log("⏳ 等待合约部署确认...");
  
  await coursePlatform.waitForDeployment();
  const contractAddress = await coursePlatform.getAddress();
  
  console.log("🎉 课程平台合约部署成功!");
  console.log("📍 合约地址:", contractAddress);
  console.log("🔗 YD代币地址:", ydTokenAddress);

  // 验证部署
  console.log("🔍 验证合约部署...");
  const owner = await coursePlatform.owner();
  const ydTokenAddr = await coursePlatform.ydToken();
  const platformFee = await coursePlatform.platformFeePercentage();
  
  console.log("✅ 合约验证结果:");
  console.log("   - 合约所有者:", owner);
  console.log("   - YD代币地址:", ydTokenAddr);
  console.log("   - 平台费用:", platformFee.toString() + "%");

  // 保存部署信息
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    contractAddress: contractAddress,
    ydTokenAddress: ydTokenAddress,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber()
  };

  // 可以选择保存到文件
  const fs = require("fs");
  const deploymentDir = "./deployments";
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir);
  }
  
  fs.writeFileSync(
    `${deploymentDir}/course-platform-${network.name}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("📄 部署信息已保存到:", `./deployments/course-platform-${network.name}.json`);

  // 提供下一步操作建议
  console.log("\n🎯 下一步操作:");
  console.log("1. 创建第一个课程:");
  console.log(`   await coursePlatform.createCourse("课程名", "描述", "内容哈希", price, instructorAddress)`);
  console.log("2. 测试购买功能:");
  console.log(`   await ydToken.approve("${contractAddress}", price)`);
  console.log(`   await coursePlatform.purchaseCourse(1)`);
  
  if (network.chainId === 11155111n) {
    console.log("3. 在Sepolia浏览器查看:");
    console.log(`   https://sepolia.etherscan.io/address/${contractAddress}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 部署失败:", error);
    process.exit(1);
  });