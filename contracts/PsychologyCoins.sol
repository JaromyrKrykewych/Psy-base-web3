// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract PsychologyCoins is ERC20, Ownable, ReentrancyGuard {
    
    // Mapping to track if user has completed a specific action before
    // user address => action ID => completed before (bool)
    mapping(address => mapping(string => bool)) public hasCompletedBefore;
    
    // Mapping to track total completions per user per action
    // user address => action ID => completion count
    mapping(address => mapping(string => uint256)) public completionCount;
    
    // Mapping to track total actions completed by user
    mapping(address => uint256) public totalActionsCompleted;
    
    // Reward amounts
    uint256 public constant FIRST_TIME_REWARD = 5 * 10**18; // 5 tokens
    uint256 public constant REPEAT_REWARD = 1 * 10**18;     // 1 token
    
    // Events
    event ActionCompleted(
        address indexed user, 
        string actionId, 
        bool isFirstTime, 
        uint256 rewardAmount
    );
    
    event ActionUncompleted(
        address indexed user,
        string actionId,
        uint256 penaltyAmount
    );

    constructor() ERC20("Psychology Coins", "PSYC") Ownable(msg.sender) {}

    /**
     * @dev Complete an action and earn rewards
     * @param actionId Unique identifier for the action (e.g., "startup-0", "interna-1")
     */
    function completeAction(string memory actionId) external nonReentrant {
        address user = msg.sender;
        bool isFirstTime = !hasCompletedBefore[user][actionId];
        uint256 rewardAmount;
        
        if (isFirstTime) {
            rewardAmount = FIRST_TIME_REWARD;
            hasCompletedBefore[user][actionId] = true;
            totalActionsCompleted[user]++;
        } else {
            rewardAmount = REPEAT_REWARD;
        }
        
        // Increment completion count
        completionCount[user][actionId]++;
        
        // Mint tokens as reward
        _mint(user, rewardAmount);
        
        emit ActionCompleted(user, actionId, isFirstTime, rewardAmount);
    }
    
    /**
     * @dev Uncomplete an action (remove rewards when user unselects)
     * @param actionId Unique identifier for the action
     */
    function uncompleteAction(string memory actionId) external nonReentrant {
        address user = msg.sender;
        require(completionCount[user][actionId] > 0, "Action not completed yet");
        
        uint256 penaltyAmount;
        
        // If this was the only completion, remove first-time bonus
        if (completionCount[user][actionId] == 1 && hasCompletedBefore[user][actionId]) {
            penaltyAmount = FIRST_TIME_REWARD;
            hasCompletedBefore[user][actionId] = false;
            totalActionsCompleted[user]--;
        } else {
            // Remove repeat reward
            penaltyAmount = REPEAT_REWARD;
        }
        
        // Decrement completion count
        completionCount[user][actionId]--;
        
        // Burn tokens as penalty (only if user has enough balance)
        require(balanceOf(user) >= penaltyAmount, "Insufficient balance for penalty");
        _burn(user, penaltyAmount);
        
        emit ActionUncompleted(user, actionId, penaltyAmount);
    }
    
    /**
     * @dev Check if user has completed an action before
     */
    function hasUserCompletedAction(address user, string memory actionId) 
        external 
        view 
        returns (bool) 
    {
        return hasCompletedBefore[user][actionId];
    }
    
    /**
     * @dev Get completion count for a specific action
     */
    function getCompletionCount(address user, string memory actionId) 
        external 
        view 
        returns (uint256) 
    {
        return completionCount[user][actionId];
    }
    
    /**
     * @dev Get user's total unique actions completed
     */
    function getTotalActionsCompleted(address user) 
        external 
        view 
        returns (uint256) 
    {
        return totalActionsCompleted[user];
    }
    
    /**
     * @dev Emergency function to adjust user rewards (only owner)
     * Useful for corrections or special circumstances
     */
    function adjustUserBalance(address user, uint256 amount, bool isAdd) 
        external 
        onlyOwner 
    {
        if (isAdd) {
            _mint(user, amount);
        } else {
            require(balanceOf(user) >= amount, "Insufficient balance");
            _burn(user, amount);
        }
    }
    
    /**
     * @dev Override decimals to make it more user-friendly
     */
    function decimals() public pure override returns (uint8) {
        return 18;
    }
}