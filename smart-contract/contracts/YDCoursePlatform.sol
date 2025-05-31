// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

contract YDCoursePlatform {
    
    // YD代币合约地址
    IERC20 public ydToken;
    
    // 合约所有者
    address public owner;
    
    // 课程结构
    struct Course {
        uint256 id;                    // 课程ID
        string title;                  // 课程标题
        string description;            // 课程描述
        string contentHash;            // 课程内容哈希（IPFS或其他存储）
        uint256 price;                 // 课程价格（YD代币数量）
        address instructor;            // 讲师地址
        bool isActive;                 // 课程是否有效
        uint256 createdAt;            // 创建时间
        uint256 totalSales;           // 总销售量
    }
    
    // 购买记录结构
    struct Purchase {
        uint256 courseId;             // 课程ID
        address buyer;                // 购买者
        uint256 purchaseTime;         // 购买时间
        uint256 pricePaid;           // 支付的代币数量
    }
    
    // 状态变量
    uint256 public nextCourseId = 1;                                   // 下一个课程ID
    mapping(uint256 => Course) public courses;                        // 课程映射
    mapping(address => mapping(uint256 => bool)) public userCourses;  // 用户购买的课程
    mapping(uint256 => Purchase[]) public coursePurchases;            // 课程购买记录
    mapping(address => uint256[]) public userPurchaseHistory;         // 用户购买历史
    
    // 平台设置
    uint256 public platformFeePercentage = 10;  // 平台手续费百分比（10%）
    address public platformFeeRecipient;        // 平台手续费接收地址
    
    // 修饰符
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier courseExists(uint256 courseId) {
        require(courseId > 0 && courseId < nextCourseId, "Course does not exist");
        require(courses[courseId].isActive, "Course is not active");
        _;
    }
    
    // 事件
    event CourseCreated(
        uint256 indexed courseId, 
        string title, 
        address indexed instructor, 
        uint256 price
    );
    
    event CoursePurchased(
        uint256 indexed courseId, 
        address indexed buyer, 
        uint256 price, 
        uint256 timestamp
    );
    
    event CourseUpdated(uint256 indexed courseId, string title, uint256 newPrice);
    event CourseDeactivated(uint256 indexed courseId);
    event InstructorPaid(address indexed instructor, uint256 amount);
    event PlatformFeePaid(address indexed recipient, uint256 amount);
    
    // 构造函数
    constructor(address _ydTokenAddress) {
        owner = msg.sender;
        ydToken = IERC20(_ydTokenAddress);
        platformFeeRecipient = msg.sender;  // 默认平台费用发给合约所有者
    }
    
    // 创建新课程 - 只有owner可以调用
    function createCourse(
        string memory _title,
        string memory _description,
        string memory _contentHash,
        uint256 _price,
        address _instructor
    ) external onlyOwner returns (uint256) {
        require(bytes(_title).length > 0, "Course title cannot be empty");
        require(_price > 0, "Course price must be greater than 0");
        require(_instructor != address(0), "Invalid instructor address");
        
        uint256 courseId = nextCourseId;
        
        courses[courseId] = Course({
            id: courseId,
            title: _title,
            description: _description,
            contentHash: _contentHash,
            price: _price,
            instructor: _instructor,
            isActive: true,
            createdAt: block.timestamp,
            totalSales: 0
        });
        
        nextCourseId++;
        
        emit CourseCreated(courseId, _title, _instructor, _price);
        return courseId;
    }
    
    // 购买课程
    function purchaseCourse(uint256 courseId) external courseExists(courseId) {
        require(!userCourses[msg.sender][courseId], "You already own this course");
        
        Course storage course = courses[courseId];
        uint256 coursePrice = course.price;
        
        // 检查用户YD代币余额
        require(ydToken.balanceOf(msg.sender) >= coursePrice, "Insufficient YD token balance");
        
        // 计算平台费用和讲师收入
        uint256 platformFee = (coursePrice * platformFeePercentage) / 100;
        uint256 instructorPayment = coursePrice - platformFee;
        
        // 转移YD代币
        // 从用户转到合约（临时持有）
        require(
            ydToken.transferFrom(msg.sender, address(this), coursePrice),
            "Failed to transfer YD tokens"
        );
        
        // 支付给讲师
        if (instructorPayment > 0) {
            require(
                ydToken.transfer(course.instructor, instructorPayment),
                "Failed to pay instructor"
            );
            emit InstructorPaid(course.instructor, instructorPayment);
        }
        
        // 支付平台费用
        if (platformFee > 0) {
            require(
                ydToken.transfer(platformFeeRecipient, platformFee),
                "Failed to pay platform fee"
            );
            emit PlatformFeePaid(platformFeeRecipient, platformFee);
        }
        
        // 记录购买
        userCourses[msg.sender][courseId] = true;
        userPurchaseHistory[msg.sender].push(courseId);
        
        Purchase memory newPurchase = Purchase({
            courseId: courseId,
            buyer: msg.sender,
            purchaseTime: block.timestamp,
            pricePaid: coursePrice
        });
        
        coursePurchases[courseId].push(newPurchase);
        course.totalSales++;
        
        emit CoursePurchased(courseId, msg.sender, coursePrice, block.timestamp);
    }
    
    // 检查用户是否拥有某个课程
    function hasUserPurchasedCourse(address user, uint256 courseId) 
        external 
        view 
        returns (bool) 
    {
        return userCourses[user][courseId];
    }
    
    // 获取课程详情
    function getCourse(uint256 courseId) 
        external 
        view 
        courseExists(courseId) 
        returns (Course memory) 
    {
        return courses[courseId];
    }
    
    // 获取课程内容（只有购买者或所有者可以访问）
    function getCourseContent(uint256 courseId) 
        external 
        view 
        courseExists(courseId) 
        returns (string memory) 
    {
        require(
            userCourses[msg.sender][courseId] || msg.sender == owner,
            "You must purchase this course to access content"
        );
        return courses[courseId].contentHash;
    }
    
    // 获取用户购买的所有课程
    function getUserCourses(address user) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return userPurchaseHistory[user];
    }
    
    // 获取课程购买记录
    function getCoursePurchases(uint256 courseId) 
        external 
        view 
        returns (Purchase[] memory) 
    {
        return coursePurchases[courseId];
    }
    
    // 获取所有有效课程列表
    function getAllActiveCourses() 
        external 
        view 
        returns (Course[] memory) 
    {
        // 先计算有效课程数量
        uint256 activeCount = 0;
        for (uint256 i = 1; i < nextCourseId; i++) {
            if (courses[i].isActive) {
                activeCount++;
            }
        }
        
        // 创建结果数组
        Course[] memory activeCourses = new Course[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 1; i < nextCourseId; i++) {
            if (courses[i].isActive) {
                activeCourses[index] = courses[i];
                index++;
            }
        }
        
        return activeCourses;
    }
    
    // Owner管理功能
    
    // 更新课程信息
    function updateCourse(
        uint256 courseId,
        string memory _title,
        string memory _description,
        uint256 _price
    ) external onlyOwner courseExists(courseId) {
        Course storage course = courses[courseId];
        
        if (bytes(_title).length > 0) {
            course.title = _title;
        }
        if (bytes(_description).length > 0) {
            course.description = _description;
        }
        if (_price > 0) {
            course.price = _price;
        }
        
        emit CourseUpdated(courseId, course.title, course.price);
    }
    
    // 停用课程
    function deactivateCourse(uint256 courseId) 
        external 
        onlyOwner 
        courseExists(courseId) 
    {
        courses[courseId].isActive = false;
        emit CourseDeactivated(courseId);
    }
    
    // 重新激活课程
    function reactivateCourse(uint256 courseId) external onlyOwner {
        require(courseId > 0 && courseId < nextCourseId, "Course does not exist");
        courses[courseId].isActive = true;
    }
    
    // 设置平台费用百分比
    function setPlatformFeePercentage(uint256 _feePercentage) external onlyOwner {
        require(_feePercentage <= 50, "Platform fee cannot exceed 50%");
        platformFeePercentage = _feePercentage;
    }
    
    // 设置平台费用接收地址
    function setPlatformFeeRecipient(address _recipient) external onlyOwner {
        require(_recipient != address(0), "Invalid recipient address");
        platformFeeRecipient = _recipient;
    }
    
    // 更新YD代币合约地址
    function updateYDTokenAddress(address _newYDTokenAddress) external onlyOwner {
        require(_newYDTokenAddress != address(0), "Invalid token address");
        ydToken = IERC20(_newYDTokenAddress);
    }
    
    // 转移合约所有权
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        owner = newOwner;
    }
    
    // 紧急功能：提取合约中的YD代币（如果有）
    function emergencyWithdrawTokens() external onlyOwner {
        uint256 balance = ydToken.balanceOf(address(this));
        if (balance > 0) {
            ydToken.transfer(owner, balance);
        }
    }
    
    // 查看合约中的YD代币余额
    function getContractTokenBalance() external view returns (uint256) {
        return ydToken.balanceOf(address(this));
    }
    
    // 获取平台统计信息
    function getPlatformStats() 
        external 
        view 
        returns (
            uint256 totalCourses,
            uint256 activeCourses,
            uint256 totalSales
        ) 
    {
        totalCourses = nextCourseId - 1;
        activeCourses = 0;
        totalSales = 0;
        
        for (uint256 i = 1; i < nextCourseId; i++) {
            if (courses[i].isActive) {
                activeCourses++;
            }
            totalSales += courses[i].totalSales;
        }
    }
}