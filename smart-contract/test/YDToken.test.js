const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("YDToken", function () {
  let YDToken;
  let ydToken;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  const INITIAL_SUPPLY = 1000000; // 100万个代币

  beforeEach(async function () {
    // 获取测试账户
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // 部署合约
    YDToken = await ethers.getContractFactory("YDToken");
    ydToken = await YDToken.deploy(INITIAL_SUPPLY);
    await ydToken.waitForDeployment();
  });

  describe("部署测试", function () {
    it("应该设置正确的名称和符号", async function () {
      expect(await ydToken.name()).to.equal("YD Token");
      expect(await ydToken.symbol()).to.equal("YD");
      expect(await ydToken.decimals()).to.equal(18);
    });

    it("应该将总供应量分配给合约所有者", async function () {
      const ownerBalance = await ydToken.balanceOf(owner.address);
      const totalSupply = await ydToken.totalSupply();
      expect(totalSupply).to.equal(ethers.parseEther(INITIAL_SUPPLY.toString()));
      expect(ownerBalance).to.equal(totalSupply);
    });

    it("应该设置正确的合约所有者", async function () {
      expect(await ydToken.owner()).to.equal(owner.address);
    });
  });

  describe("转账测试", function () {
    it("应该能够在账户之间转移代币", async function () {
      const transferAmount = ethers.parseEther("50");
      
      await ydToken.transfer(addr1.address, transferAmount);
      
      const addr1Balance = await ydToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(transferAmount);
    });

    it("应该在余额不足时转账失败", async function () {
      const initialOwnerBalance = await ydToken.balanceOf(owner.address);
      const transferAmount = initialOwnerBalance + ethers.parseEther("1");
      
      await expect(
        ydToken.transfer(addr1.address, transferAmount)
      ).to.be.revertedWith("Insufficient balance");
    });

    it("应该不允许转账到零地址", async function () {
      await expect(
        ydToken.transfer(ethers.ZeroAddress, ethers.parseEther("1"))
      ).to.be.revertedWith("Transfer to zero address");
    });
  });

  describe("授权测试", function () {
    it("应该能够批准代币支出", async function () {
      const approveAmount = ethers.parseEther("100");
      
      await ydToken.approve(addr1.address, approveAmount);
      
      expect(await ydToken.allowance(owner.address, addr1.address))
        .to.equal(approveAmount);
    });

    it("应该能够使用授权进行转账", async function () {
      const approveAmount = ethers.parseEther("100");
      const transferAmount = ethers.parseEther("50");
      
      await ydToken.approve(addr1.address, approveAmount);
      await ydToken.connect(addr1).transferFrom(owner.address, addr2.address, transferAmount);
      
      expect(await ydToken.balanceOf(addr2.address)).to.equal(transferAmount);
      expect(await ydToken.allowance(owner.address, addr1.address))
        .to.equal(approveAmount - transferAmount);
    });
  });

  describe("增发和销毁测试", function () {
    it("所有者应该能够增发代币", async function () {
      const mintAmount = ethers.parseEther("1000");
      
      await ydToken.mint(addr1.address, mintAmount);
      
      expect(await ydToken.balanceOf(addr1.address)).to.equal(mintAmount);
      expect(await ydToken.totalSupply()).to.equal(
        ethers.parseEther(INITIAL_SUPPLY.toString()) + mintAmount
      );
    });

    it("非所有者不应该能够增发代币", async function () {
      const mintAmount = ethers.parseEther("1000");
      
      await expect(
        ydToken.connect(addr1).mint(addr1.address, mintAmount)
      ).to.be.revertedWith("Only owner can call this function");
    });

    it("应该能够销毁自己的代币", async function () {
      const burnAmount = ethers.parseEther("1000");
      const initialBalance = await ydToken.balanceOf(owner.address);
      const initialSupply = await ydToken.totalSupply();
      
      await ydToken.burn(burnAmount);
      
      expect(await ydToken.balanceOf(owner.address)).to.equal(initialBalance - burnAmount);
      expect(await ydToken.totalSupply()).to.equal(initialSupply - burnAmount);
    });
  });

  describe("权限管理测试", function () {
    it("应该能够转移合约所有权", async function () {
      await ydToken.transferOwnership(addr1.address);
      expect(await ydToken.owner()).to.equal(addr1.address);
    });

    it("非所有者不应该能够转移所有权", async function () {
      await expect(
        ydToken.connect(addr1).transferOwnership(addr2.address)
      ).to.be.revertedWith("Only owner can call this function");
    });
  });
});