const { assert } = require("chai");
const SocialNetwork = artifacts.require("../src/contracts/SocialNetwork.sol");

require("chai")
  .use(require("chai-as-promised"))
  .should();

contract("Social Network contract", ([deployer, author, tipper]) => {
  let socialNetwork, address, accounts;
  before(async () => {
    socialNetwork = await SocialNetwork.deployed();
    accounts = await web3.eth.getAccounts();
  });

  it("deploys successfully", async () => {
    address = await socialNetwork.address;
    assert.notEqual(address, 0x0);
    assert.notEqual(address, "");
    assert.notEqual(address, null);
    assert.notEqual(address, undefined);
  });

  // Get the post count
  it("post count should be 0 on init", async () => {
    const count = await socialNetwork.getPostCount();
    const name = await socialNetwork.name();
    assert.equal(count, 0);
    assert.equal(name, "Simple Social Dapp");
  });

  it("create a new post, updated count should be added, and posts", async () => {
    const newPost = "new post";
    const count = await socialNetwork.getPostCount();
    await socialNetwork.createPost(newPost, { from: author });

    const updatedCount = await socialNetwork.getPostCount();
    assert.equal(updatedCount.toNumber(), count + 1);

    // Success
    const post = await socialNetwork.posts(updatedCount);
    assert.equal(post.content, newPost, "content is correct");
    assert.equal(post.id.toNumber(), updatedCount, "id is correct");
    assert.equal(post.author, author, "author is correct");
    assert.equal(post.tipAmount.toNumber(), 0, "tip amount is correct");

    // Failure
    await socialNetwork.createPost("", { from: author }).should.be.rejected;
  });

  it("tip post", async () => {
    const wei = 1;
    const updatedCount = await socialNetwork.getPostCount();
    const result = await socialNetwork.tipPost(updatedCount, {
      from: tipper,
      value: wei,
    });
    const event = result.logs[0].args;
    assert.equal(event.id.toNumber(), updatedCount, "id is correct");
    assert.equal(event.tipper, tipper, "tipper is correct");
    assert.equal(event.author, author, "tipper is correct");
    assert.equal(event.tips.toNumber(), wei, "tip amount is correct");
    assert.equal(event.totalTipAmount.toNumber(), wei, "tip amount is correct");

    const result2 = await socialNetwork.tipPost(updatedCount, {
      from: tipper,
      value: wei,
    });
    const event2 = result2.logs[0].args;
    // tip amount should be correct
    assert.equal(event2.tips.toNumber(), wei, "tip amount is correct");
    assert.equal(
      event2.totalTipAmount.toNumber(),
      wei + event.totalTipAmount.toNumber(),
      "tip amount is correct"
    );

    // Failure (wrong postId)
    await socialNetwork.tipPost(1000, { from: tipper, value: wei }).should.be
      .rejected;
  });
});
