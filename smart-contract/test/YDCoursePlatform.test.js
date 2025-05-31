// test/CoursePlatform.test.js - 完整的课程平台测试
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("课程平台完整测试", function () {
  let ydToken;
  let coursePlatform;
  let owner;
  let instructor;
  let student;
  let addrs;

  const INITIAL_SUPPLY = 1000000;
  const COURSE_PRICE = ethers.parseEther("100"); // 100 YD tokens

  beforeEach(async function () {
    [owner, instructor, student, ...addrs] = await ethers.getSigners();

    // 部署YD代币
    const YDToken = await ethers.getContractFactory("YDToken");
    ydToken = await YDToken.deploy(INITIAL_SUPPLY);
    await ydToken.waitForDeployment();

    // 部署课程平台
    const CoursePlatform = await ethers.getContractFactory("YDCoursePlatform");
    coursePlatform = await CoursePlatform.deploy(await ydToken.getAddress());
    await coursePlatform.waitForDeployment();

    // 给学生一些YD代币用于测试
    await ydToken.transfer(student.address, ethers.parseEther("1000"));
  });

  describe("合约部署测试", function () {
    it("应该正确部署YD代币合约", async function () {
      expect(await ydToken.name()).to.equal("YD Token");
      expect(await ydToken.symbol()).to.equal("YD");
      expect(await ydToken.totalSupply()).to.equal(ethers.parseEther(INITIAL_SUPPLY.toString()));
    });

    it("应该正确部署课程平台合约", async function () {
      expect(await coursePlatform.owner()).to.equal(owner.address);
      expect(await coursePlatform.ydToken()).to.equal(await ydToken.getAddress());
      expect(await coursePlatform.platformFeePercentage()).to.equal(10);
    });
  });

  describe("课程创建测试", function () {
    it("所有者应该能够创建课程", async function () {
      const tx = await coursePlatform.createCourse(
        "区块链开发入门",
        "从零开始学习智能合约",
        "QmExampleIPFSHash123",
        COURSE_PRICE,
        instructor.address
      );

      await expect(tx)
        .to.emit(coursePlatform, "CourseCreated")
        .withArgs(1, "区块链开发入门", instructor.address, COURSE_PRICE);

      const course = await coursePlatform.getCourse(1);
      expect(course.title).to.equal("区块链开发入门");
      expect(course.price).to.equal(COURSE_PRICE);
      expect(course.instructor).to.equal(instructor.address);
      expect(course.isActive).to.be.true;
    });

    it("非所有者不应该能够创建课程", async function () {
      await expect(
        coursePlatform.connect(student).createCourse(
          "测试课程",
          "测试描述",
          "QmTestHash",
          COURSE_PRICE,
          instructor.address
        )
      ).to.be.revertedWith("Only owner can call this function");
    });

    it("不应该允许创建空标题的课程", async function () {
      await expect(
        coursePlatform.createCourse(
          "",
          "测试描述",
          "QmTestHash",
          COURSE_PRICE,
          instructor.address
        )
      ).to.be.revertedWith("Course title cannot be empty");
    });
  });

  describe("课程购买测试", function () {
    beforeEach(async function () {
      // 创建一个测试课程
      await coursePlatform.createCourse(
        "测试课程",
        "测试描述",
        "QmTestHash",
        COURSE_PRICE,
        instructor.address
      );
    });

    it("用户应该能够购买课程", async function () {
      // 学生授权代币给课程平台
      await ydToken.connect(student).approve(
        await coursePlatform.getAddress(),
        COURSE_PRICE
      );

      // 购买课程
      const tx = await coursePlatform.connect(student).purchaseCourse(1);

      await expect(tx)
        .to.emit(coursePlatform, "CoursePurchased")
        .withArgs(1, student.address, COURSE_PRICE, await time.latest());

      // 验证购买状态
      expect(
        await coursePlatform.hasUserPurchasedCourse(student.address, 1)
      ).to.be.true;
    });

    it("应该正确分配收益", async function () {
      const instructorInitialBalance = await ydToken.balanceOf(instructor.address);
      const ownerInitialBalance = await ydToken.balanceOf(owner.address);

      await ydToken.connect(student).approve(
        await coursePlatform.getAddress(),
        COURSE_PRICE
      );

      await coursePlatform.connect(student).purchaseCourse(1);

      // 检查讲师收到90%
      const instructorFinalBalance = await ydToken.balanceOf(instructor.address);
      const instructorPayment = instructorFinalBalance - instructorInitialBalance;
      expect(instructorPayment).to.equal(ethers.parseEther("90"));

      // 检查平台收到10%
      const ownerFinalBalance = await ydToken.balanceOf(owner.address);
      const platformFee = ownerFinalBalance - ownerInitialBalance;
      expect(platformFee).to.equal(ethers.parseEther("10"));
    });

    it("用户不应该能够重复购买同一课程", async function () {
      await ydToken.connect(student).approve(
        await coursePlatform.getAddress(),
        COURSE_PRICE.mul(2)
      );

      await coursePlatform.connect(student).purchaseCourse(1);

      await expect(
        coursePlatform.connect(student).purchaseCourse(1)
      ).to.be.revertedWith("You already own this course");
    });

    it("余额不足时不应该能够购买课程", async function () {
      // 创建一个余额不足的用户
      const poorUser = addrs[0];
      
      await ydToken.connect(poorUser).approve(
        await coursePlatform.getAddress(),
        COURSE_PRICE
      );

      await expect(
        coursePlatform.connect(poorUser).purchaseCourse(1)
      ).to.be.revertedWith("Insufficient YD token balance");
    });
  });

  describe("内容访问测试", function () {
    beforeEach(async function () {
      await coursePlatform.createCourse(
        "测试课程",
        "测试描述",
        "QmTestContentHash",
        COURSE_PRICE,
        instructor.address
      );
    });

    it("购买者应该能够访问课程内容", async function () {
      await ydToken.connect(student).approve(
        await coursePlatform.getAddress(),
        COURSE_PRICE
      );

      await coursePlatform.connect(student).purchaseCourse(1);

      const contentHash = await coursePlatform.connect(student).getCourseContent(1);
      expect(contentHash).to.equal("QmTestContentHash");
    });

    it("未购买者不应该能够访问课程内容", async function () {
      await expect(
        coursePlatform.connect(student).getCourseContent(1)
      ).to.be.revertedWith("You must purchase this course to access content");
    });

    it("所有者应该能够访问所有课程内容", async function () {
      const contentHash = await coursePlatform.getCourseContent(1);
      expect(contentHash).to.equal("QmTestContentHash");
    });
  });

  describe("课程管理测试", function () {
    beforeEach(async function () {
      await coursePlatform.createCourse(
        "测试课程",
        "测试描述",
        "QmTestHash",
        COURSE_PRICE,
        instructor.address
      );
    });

    it("所有者应该能够更新课程", async function () {
      await coursePlatform.updateCourse(
        1,
        "新标题",
        "新描述",
        ethers.parseEther("200")
      );

      const course = await coursePlatform.getCourse(1);
      expect(course.title).to.equal("新标题");
      expect(course.price).to.equal(ethers.parseEther("200"));
    });

    it("所有者应该能够停用课程", async function () {
      await coursePlatform.deactivateCourse(1);

      await expect(
        coursePlatform.getCourse(1)
      ).to.be.revertedWith("Course is not active");
    });

    it("所有者应该能够重新激活课程", async function () {
      await coursePlatform.deactivateCourse(1);
      await coursePlatform.reactivateCourse(1);

      const course = await coursePlatform.getCourse(1);
      expect(course.isActive).to.be.true;
    });
  });

  describe("查询功能测试", function () {
    beforeEach(async function () {
      await coursePlatform.createCourse(
        "课程1",
        "描述1",
        "hash1",
        COURSE_PRICE,
        instructor.address
      );

      await coursePlatform.createCourse(
        "课程2",
        "描述2", 
        "hash2",
        ethers.parseEther("50"),
        instructor.address
      );
    });

    it("应该能够获取所有有效课程", async function () {
      const courses = await coursePlatform.getAllActiveCourses();
      expect(courses.length).to.equal(2);
      expect(courses[0].title).to.equal("课程1");
      expect(courses[1].title).to.equal("课程2");
    });

    it("应该能够获取用户购买历史", async function () {
      // 学生购买第一门课程
      await ydToken.connect(student).approve(
        await coursePlatform.getAddress(),
        COURSE_PRICE
      );
      await coursePlatform.connect(student).purchaseCourse(1);

      const userCourses = await coursePlatform.getUserCourses(student.address);
      expect(userCourses.length).to.equal(1);
      expect(userCourses[0]).to.equal(1);
    });

    it("应该能够获取平台统计信息", async function () {
      const stats = await coursePlatform.getPlatformStats();
      expect(stats.totalCourses).to.equal(2);
      expect(stats.activeCourses).to.equal(2);
      expect(stats.totalSales).to.equal(0);

      // 购买一门课程后重新检查
      await ydToken.connect(student).approve(
        await coursePlatform.getAddress(),
        COURSE_PRICE
      );
      await coursePlatform.connect(student).purchaseCourse(1);

      const newStats = await coursePlatform.getPlatformStats();
      expect(newStats.totalSales).to.equal(1);
    });
  });

  describe("平台费用管理测试", function () {
    it("所有者应该能够设置平台费用百分比", async function () {
      await coursePlatform.setPlatformFeePercentage(15);
      expect(await coursePlatform.platformFeePercentage()).to.equal(15);
    });

    it("平台费用不应该超过50%", async function () {
      await expect(
        coursePlatform.setPlatformFeePercentage(60)
      ).to.be.revertedWith("Platform fee cannot exceed 50%");
    });

    it("所有者应该能够设置费用接收地址", async function () {
      const newRecipient = addrs[0].address;
      await coursePlatform.setPlatformFeeRecipient(newRecipient);
      expect(await coursePlatform.platformFeeRecipient()).to.equal(newRecipient);
    });
  });

  describe("权限管理测试", function () {
    it("所有者应该能够转移合约所有权", async function () {
      await coursePlatform.transferOwnership(instructor.address);
      expect(await coursePlatform.owner()).to.equal(instructor.address);
    });

    it("非所有者不应该能够转移所有权", async function () {
      await expect(
        coursePlatform.connect(student).transferOwnership(instructor.address)
      ).to.be.revertedWith("Only owner can call this function");
    });

    it("所有者应该能够更新YD代币合约地址", async function () {
      const newTokenAddress = addrs[0].address;
      await coursePlatform.updateYDTokenAddress(newTokenAddress);
      expect(await coursePlatform.ydToken()).to.equal(newTokenAddress);
    });
  });

  describe("紧急功能测试", function () {
    it("所有者应该能够提取合约中的代币", async function () {
      // 先向合约发送一些代币
      await ydToken.transfer(await coursePlatform.getAddress(), ethers.parseEther("100"));
      
      const initialBalance = await ydToken.balanceOf(owner.address);
      await coursePlatform.emergencyWithdrawTokens();
      const finalBalance = await ydToken.balanceOf(owner.address);
      
      expect(finalBalance - initialBalance).to.equal(ethers.parseEther("100"));
    });

    it("应该能够查看合约代币余额", async function () {
      await ydToken.transfer(await coursePlatform.getAddress(), ethers.parseEther("50"));
      const balance = await coursePlatform.getContractTokenBalance();
      expect(balance).to.equal(ethers.parseEther("50"));
    });
  });

  describe("完整购买流程测试", function () {
    it("应该能够完成完整的课程购买和访问流程", async function () {
      // 1. 创建课程
      await coursePlatform.createCourse(
        "完整测试课程",
        "这是一个完整的测试流程",
        "QmCompleteTestHash",
        COURSE_PRICE,
        instructor.address
      );

      // 2. 检查课程是否创建成功
      const course = await coursePlatform.getCourse(1);
      expect(course.title).to.equal("完整测试课程");

      // 3. 学生授权代币
      await ydToken.connect(student).approve(
        await coursePlatform.getAddress(),
        COURSE_PRICE
      );

      // 4. 购买课程
      await coursePlatform.connect(student).purchaseCourse(1);

      // 5. 验证购买成功
      const hasPurchased = await coursePlatform.hasUserPurchasedCourse(student.address, 1);
      expect(hasPurchased).to.be.true;

      // 6. 访问课程内容
      const contentHash = await coursePlatform.connect(student).getCourseContent(1);
      expect(contentHash).to.equal("QmCompleteTestHash");

      // 7. 检查购买历史
      const userCourses = await coursePlatform.getUserCourses(student.address);
      expect(userCourses.length).to.equal(1);
      expect(userCourses[0]).to.equal(1);

      // 8. 检查课程销量
      const updatedCourse = await coursePlatform.getCourse(1);
      expect(updatedCourse.totalSales).to.equal(1);
    });
  });
});