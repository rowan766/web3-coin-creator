// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

interface IERC20 {
    function totalSupply() external view returns(uint256);
    function balanceOf(address account) external view returns(uint256);
    function transfer(address to, uint256 amount) external returns(bool);
    function allowance(address owner, address spender) external view returns(uint256);
    function approve(address spender, uint256 amount) external returns(bool);
    function transferFrom(address from, address to, uint256 amount) external returns(bool);
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

contract YDToken is IERC20 {
    // 基本代币信息
    uint256 private _totalSupply;
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    string public name = "YD Token";
    string public symbol = "YD";
    uint8 public decimals = 18;
    
    // 权限控制
    address public owner;
    
    // 🆕 代币销售相关
    uint256 public tokenPrice = 400000000000000; // 1 YD = 0.0004 ETH (2500:1比例)
    bool public saleActive = true; // 是否开启销售
    uint256 public maxTokensPerTransaction = 10000 * 10**decimals; // 单次最大购买量
    
    // 修饰符
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    // 🆕 新增事件
    event TokensPurchased(address indexed buyer, uint256 ethAmount, uint256 tokenAmount);
    event TokensSold(address indexed seller, uint256 tokenAmount, uint256 ethAmount);
    event PriceUpdated(uint256 oldPrice, uint256 newPrice);
    event SaleStatusChanged(bool isActive);
    event Mint(address indexed to, uint256 amount);
    event Burn(address indexed from, uint256 amount);

    constructor(uint256 _initialSupply) {
        owner = msg.sender;
        _totalSupply = _initialSupply * 10**decimals;
        _balances[msg.sender] = _totalSupply;
        emit Transfer(address(0), msg.sender, _totalSupply);
    }

    // 基本ERC20功能（保持不变）
    function totalSupply() public view override returns(uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) public view override returns(uint256) {
        return _balances[account];
    }

    function transfer(address to, uint256 amount) public override returns(bool) {
        require(to != address(0), "Transfer to zero address");
        require(_balances[msg.sender] >= amount, "Insufficient balance");

        _balances[msg.sender] -= amount;
        _balances[to] += amount;
        
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function allowance(address owner_addr, address spender) public view override returns(uint256) {
        return _allowances[owner_addr][spender];
    }

    function approve(address spender, uint256 amount) public override returns(bool) {
        require(spender != address(0), "Approve to zero address");
        
        _allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) public override returns(bool) {
        require(from != address(0), "Transfer from zero address");
        require(to != address(0), "Transfer to zero address");
        require(_balances[from] >= amount, "Insufficient balance");
        require(_allowances[from][msg.sender] >= amount, "Allowance exceeded");

        _allowances[from][msg.sender] -= amount;
        _balances[from] -= amount;
        _balances[to] += amount;
        
        emit Transfer(from, to, amount);
        return true;
    }

    // 🆕 核心购买功能 - 用ETH购买YD代币
    function buyTokens() external payable {
        require(saleActive, "Token sale is not active");
        require(msg.value > 0, "Send ETH to buy tokens");
        
        uint256 tokenAmount = (msg.value * 10**decimals) / tokenPrice;
        require(tokenAmount <= maxTokensPerTransaction, "Exceeds max tokens per transaction");
        require(_balances[owner] >= tokenAmount, "Not enough tokens available for sale");
        
        // 从owner账户转移代币到购买者
        _balances[owner] -= tokenAmount;
        _balances[msg.sender] += tokenAmount;
        
        emit Transfer(owner, msg.sender, tokenAmount);
        emit TokensPurchased(msg.sender, msg.value, tokenAmount);
    }

    // 🆕 计算指定ETH数量能买多少代币
    function calculateTokensFromETH(uint256 ethAmount) external view returns(uint256) {
        return (ethAmount * 10**decimals) / tokenPrice;
    }

    // 🆕 计算指定代币数量需要多少ETH
    function calculateETHFromTokens(uint256 tokenAmount) external view returns(uint256) {
        return (tokenAmount * tokenPrice) / 10**decimals;
    }

    // 🆕 卖出代币换取ETH（可选功能）
    function sellTokens(uint256 tokenAmount) external {
        require(saleActive, "Token sale is not active");
        require(_balances[msg.sender] >= tokenAmount, "Insufficient token balance");
        
        uint256 ethAmount = (tokenAmount * tokenPrice) / 10**decimals;
        require(address(this).balance >= ethAmount, "Contract has insufficient ETH");
        
        // 转移代币到合约owner
        _balances[msg.sender] -= tokenAmount;
        _balances[owner] += tokenAmount;
        
        // 发送ETH给卖方
        payable(msg.sender).transfer(ethAmount);
        
        emit Transfer(msg.sender, owner, tokenAmount);
        emit TokensSold(msg.sender, tokenAmount, ethAmount);
    }

    // 🆕 Owner管理功能
    function updateTokenPrice(uint256 newPrice) external onlyOwner {
        uint256 oldPrice = tokenPrice;
        tokenPrice = newPrice;
        emit PriceUpdated(oldPrice, newPrice);
    }

    function setSaleStatus(bool _saleActive) external onlyOwner {
        saleActive = _saleActive;
        emit SaleStatusChanged(_saleActive);
    }

    function setMaxTokensPerTransaction(uint256 _maxTokens) external onlyOwner {
        maxTokensPerTransaction = _maxTokens;
    }

    function withdrawETH() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH to withdraw");
        payable(owner).transfer(balance);
    }

    function depositETHForSale() external payable onlyOwner {
        // Owner可以向合约存入ETH，用于回购代币
    }

    // 原有的mint和burn功能
    function mint(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Mint to zero address");
        
        _totalSupply += amount;
        _balances[to] += amount;
        
        emit Transfer(address(0), to, amount);
        emit Mint(to, amount);
    }

    function burn(uint256 amount) external {
        require(_balances[msg.sender] >= amount, "Insufficient balance to burn");
        
        _balances[msg.sender] -= amount;
        _totalSupply -= amount;
        
        emit Transfer(msg.sender, address(0), amount);
        emit Burn(msg.sender, amount);
    }

    function burnFrom(address from, uint256 amount) external onlyOwner {
        require(from != address(0), "Burn from zero address");
        require(_balances[from] >= amount, "Insufficient balance to burn");
        
        _balances[from] -= amount;
        _totalSupply -= amount;
        
        emit Transfer(from, address(0), amount);
        emit Burn(from, amount);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        owner = newOwner;
    }

    function increaseAllowance(address spender, uint256 addedValue) external returns(bool) {
        require(spender != address(0), "Increase allowance to zero address");
        
        _allowances[msg.sender][spender] += addedValue;
        emit Approval(msg.sender, spender, _allowances[msg.sender][spender]);
        return true;
    }

    function decreaseAllowance(address spender, uint256 subtractedValue) external returns(bool) {
        require(spender != address(0), "Decrease allowance to zero address");
        require(_allowances[msg.sender][spender] >= subtractedValue, "Decreased allowance below zero");
        
        _allowances[msg.sender][spender] -= subtractedValue;
        emit Approval(msg.sender, spender, _allowances[msg.sender][spender]);
        return true;
    }

    // 🆕 查看合约ETH余额
    function contractETHBalance() external view returns(uint256) {
        return address(this).balance;
    }

    // 🆕 获取当前代币价格信息
    function getTokenPrice() external view returns(uint256) {
        return tokenPrice;
    }

    // 接收ETH的回调函数
    receive() external payable {
        // 当有人直接向合约发送ETH时，自动购买代币
        require(saleActive, "Token sale is not active");
        require(msg.value > 0, "Send ETH to buy tokens");
        
        uint256 tokenAmount = (msg.value * 10**decimals) / tokenPrice;
        require(tokenAmount <= maxTokensPerTransaction, "Exceeds max tokens per transaction");
        require(_balances[owner] >= tokenAmount, "Not enough tokens available for sale");
        
        _balances[owner] -= tokenAmount;
        _balances[msg.sender] += tokenAmount;
        
        emit Transfer(owner, msg.sender, tokenAmount);
        emit TokensPurchased(msg.sender, msg.value, tokenAmount);
    }
}