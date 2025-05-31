const { ethers } = require("hardhat");

async function main() {
  // 获取签名者（部署账户）
  const [deployer] = await ethers.getSigners();
  
  console.log("正在使用账户部署合约:", deployer.address);
  console.log("账户余额:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)));

  // 获取合约工厂
  const YDToken = await ethers.getContractFactory("YDToken");
  
  // 设置初始供应量 (例如：1000万个代币)
  const initialSupply = 10000000; // 10,000,000 YD tokens
  
  console.log(`正在部署YD代币，初始供应量: ${initialSupply} YD...`);
  
  // 部署合约
  const ydToken = await YDToken.deploy(initialSupply);
  
  await ydToken.waitForDeployment();
  
  const contractAddress = await ydToken.getAddress();
  
  console.log("✅ YD代币合约部署成功!");
  console.log("合约地址:", contractAddress);
  console.log("代币名称:", await ydToken.name());
  console.log("代币符号:", await ydToken.symbol());
  console.log("小数位数:", await ydToken.decimals());
  console.log("总供应量:", ethers.formatEther(await ydToken.totalSupply()), "YD");
  console.log("部署者余额:", ethers.formatEther(await ydToken.balanceOf(deployer.address)), "YD");
  
  // 保存合约地址和ABI信息（用于前端交互）
  saveFrontendFiles(ydToken, contractAddress);
}

function saveFrontendFiles(token, contractAddress) {
  const fs = require("fs");
  const contractsDir = "./frontend-info";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  // 保存合约地址
  fs.writeFileSync(
    contractsDir + "/contract-address.json",
    JSON.stringify({ YDToken: contractAddress }, undefined, 2)
  );

  // 保存ABI
  const YDTokenArtifact = artifacts.readArtifactSync("YDToken");
  fs.writeFileSync(
    contractsDir + "/YDToken.json",
    JSON.stringify(YDTokenArtifact, null, 2)
  );
  
  console.log("📁 合约信息已保存到 frontend-info/ 目录");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 部署失败:", error);
    process.exit(1);
  });