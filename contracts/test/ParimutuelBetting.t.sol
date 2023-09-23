// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.17;

import "forge-std/Test.sol";
import "forge-std/console2.sol";

import {ERC20} from "openzeppelin/token/ERC20/ERC20.sol";
import {ParimutuelBetting} from "../src/ParimutuelBetting.sol";

contract MockErc20 is ERC20 {
    constructor() ERC20("TEST", "TEST") {}

    function mintAndApprove(
        address owner,
        address spender,
        uint256 amount
    ) public {
        _mint(owner, amount);
        _approve(owner, spender, amount);
    }
}

contract TestContract is Test {
    MockErc20 public erc20;
    ParimutuelBetting public betting;

    address public immutable marketCreator;
    address public immutable alice;
    address public immutable bob;
    address public immutable carol;

    constructor() {
        marketCreator = makeAddr("marketCreator");
        alice = makeAddr("alice");
        bob = makeAddr("bob");
        carol = makeAddr("carol");
    }

    function setUp() public {
        erc20 = new MockErc20();
        betting = new ParimutuelBetting(erc20);
    }

    function testEndToEnd_Basic() public {
        vm.prank(marketCreator);
        uint256 haltTime = block.timestamp + 1000;
        uint256 marketId = betting.proposeMarket(3, haltTime);

        // Alice bets 100$ to Outcome1
        uint256 aliceAmount = 100;
        uint256 aliceIndex = 1;
        erc20.mintAndApprove(alice, address(betting), aliceAmount);

        vm.prank(alice);
        betting.bet(marketId, aliceAmount, aliceIndex);

        // Bob bets 200$ to Outcome2
        uint256 bobAmount = 200;
        uint256 bobIndex = 2;
        erc20.mintAndApprove(bob, address(betting), bobAmount);

        vm.prank(bob);
        betting.bet(marketId, bobAmount, bobIndex);

        // Resolution: Outcome1 wins
        vm.prank(marketCreator);
        vm.warp(haltTime + 1);
        uint256 winnerIndex = 1;
        betting.resolveMarket(marketId, winnerIndex);

        //Claim
        vm.prank(alice);
        betting.claim(marketId);
        uint256 aliceBalance = erc20.balanceOf(alice);
        assertEq(aliceBalance, 300, "Alice Balance is not 300");

        vm.prank(bob);
        betting.claim(marketId);
        uint256 bobBalance = erc20.balanceOf(bob);
        console2.log(bobBalance);
        assertEq(bobBalance, 0, "Bob Balance is not 0");
    }

    function testEndToEnd_MultipleBets() public {
        vm.prank(marketCreator);
        uint256 haltTime = block.timestamp + 1000;
        uint256 marketId = betting.proposeMarket(3, haltTime);

        // Alice bets 100$ to Outcome1
        uint256 aliceAmount = 100;
        uint256 aliceIndex = 1;
        erc20.mintAndApprove(alice, address(betting), aliceAmount);

        vm.prank(alice);
        betting.bet(marketId, aliceAmount, aliceIndex);

        // Alice bets 100$ to Outcome2
        aliceAmount = 100;
        aliceIndex = 2;
        erc20.mintAndApprove(alice, address(betting), aliceAmount);

        vm.prank(alice);
        betting.bet(marketId, aliceAmount, aliceIndex);

        // Resolution: Outcome1 wins
        vm.prank(marketCreator);
        vm.warp(haltTime + 1);
        uint256 winnerIndex = 1;
        betting.resolveMarket(marketId, winnerIndex);

        //Claim
        vm.prank(alice);
        betting.claim(marketId);
        uint256 aliceBalance = erc20.balanceOf(alice);
        assertEq(aliceBalance, 200, "Alice Balance is not 100");
    }

    function testEndToEnd_OutcomeIndexOutOfRange() public {
        vm.prank(marketCreator);
        uint256 haltTime = block.timestamp + 1000;
        uint256 marketId = betting.proposeMarket(3, haltTime);

        // Alice bets 100$ to Outcome1
        uint256 aliceAmount = 100;
        uint256 aliceIndex = 5; //Outcome Index 5 doesn't exist
        erc20.mintAndApprove(alice, address(betting), aliceAmount);

        vm.expectRevert(ParimutuelBetting.OutcomeIndexOutOfRange.selector);
        vm.prank(alice);
        betting.bet(marketId, aliceAmount, aliceIndex);
    }
}
