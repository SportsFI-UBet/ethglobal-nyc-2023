// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.17;
import "forge-std/console2.sol";

import {IERC20} from "openzeppelin/token/ERC20/IERC20.sol";
import {SafeERC20} from "openzeppelin/token/ERC20/utils/SafeERC20.sol";

contract ParimutuelBetting {
    using SafeERC20 for IERC20;

    /// @dev cannot make a bet with a different index than before
    error CantBetWithDifferentIndex();
    error OutcomeIndexOutOfRange();

    struct Wager {
        uint256 size;
        uint256 outcome;
    }

    // Bet period
    // Reveal period
    // Claim period

    struct Market {
        address owner;
        uint256 totalSum;
        uint256 winningIndex;
        // Enter halt period after which no betting can take place
        uint256 haltTime;
        /// @dev if non-zero, then "reveal period" begins, where users can reveal
        /// their wager side. When block exceeds this, reveal period is over, and
        /// claim period starts
        uint256 winningSum;
        bool isResolved;
        uint256 numOutcomes;
        uint256[] outcomeSum;
        mapping(address => Wager[]) userWagers;
        address[] users;
        // TODO: support push if winningSum == 0?
    }

    IERC20 public erc20;
    mapping(uint256 => Market) public markets;
    uint256 public nextId;

    constructor(IERC20 erc20_) {
        erc20 = erc20_;
    }

    // TODO: how to tie off-chain metadata to market? Just use market id?
    function proposeMarket(
        uint256 numOutcomes,
        uint256 haltTime
    ) external returns (uint256 marketId) {
        require(numOutcomes > 1, "Numbef of outcomes should be greater than 1");

        marketId = ++nextId;
        Market storage market = markets[marketId];
        market.numOutcomes = numOutcomes;
        market.haltTime = haltTime;
        market.owner = msg.sender;
        market.outcomeSum = new uint256[](numOutcomes);
    }

    function resolveMarket(uint256 marketId, uint256 winningIndex) external {
        Market storage market = markets[marketId];

        require(market.numOutcomes > 1, "Invalid Market");
        require(
            market.isResolved != true,
            "Cannot resolve already resolved market"
        );

        require(
            winningIndex < market.numOutcomes,
            "WinningIndex does not exist"
        );

        require(
            block.timestamp >= market.haltTime,
            "Cannot resolve before halt time"
        );
        require(
            msg.sender == market.owner,
            "Cannot resolve as non-owner of market"
        );

        market.winningIndex = winningIndex;
        market.winningSum = market.outcomeSum[winningIndex];
        market.isResolved = true;
    }

    function bet(
        uint256 marketId,
        uint256 size,
        uint256 outcomeIndex
    ) external payable {
        Market storage market = markets[marketId];

        // TODO: should be able to invalidate market?
        require(
            block.timestamp < market.haltTime,
            "Cannot resolve before halt time"
        );

        if (outcomeIndex >= market.numOutcomes) {
            revert OutcomeIndexOutOfRange();
        }

        // Bookkeeping a bet
        Wager memory wager = Wager(size, outcomeIndex);
        market.userWagers[msg.sender].push(wager);
        market.totalSum += size;
        market.outcomeSum[outcomeIndex] += size;

        // Receiv bet money
        erc20.transferFrom(msg.sender, address(this), size);
    }

    function claim(uint256 marketId) external returns (uint256 amount) {
        require(!isBettingPeriod(marketId), "still betting period");

        Market storage market = markets[marketId];
        Wager[] memory wagers = market.userWagers[msg.sender];

        for (uint i = 0; i < wagers.length; i++) {
            uint256 outcome = wagers[i].outcome;

            //TODO: Check that market is resolved
            if (market.isResolved && market.winningIndex == outcome) {
                amount = (market.totalSum * wagers[i].size) / market.winningSum;
                erc20.safeTransfer(msg.sender, amount);
                //TODO: Emit payment has made
            }
        }
    }

    function isBettingPeriod(uint256 marketId) public view returns (bool) {
        return block.timestamp < markets[marketId].haltTime;
    }

    function isResolved(uint256 marketId) public view returns (bool) {
        return markets[marketId].isResolved;
    }
}

// decrypting in solidity
// verifying private key corresponds to public key
