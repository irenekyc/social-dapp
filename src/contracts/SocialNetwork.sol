pragma solidity >=0.4.21;

contract SocialNetwork{
  uint256 public postCount;
  string public name;

  mapping (uint => Post) public posts;

  struct Post{
    uint256 id;
    string content;
    address payable author;
    uint256 tipAmount;
  }

  constructor() public{
    postCount = 0;
    name = "Simple Social Dapp";
  }

  event PostCreated (
    uint256 id,
    string content,
    address payable author,
    uint256 tipAmount
  );

  event PostTipped (
    uint256 id,
    address tipper,
    address payable author,
    uint256 tips,
    uint256 totalTipAmount
  );

  function getPostCount() public view returns(uint){
    return postCount;
  }

// create posts
  function createPost(string memory _content) public {
    require(bytes(_content).length > 0, "Post content cannot be empty");

    address payable author = msg.sender;
    postCount ++;
    uint256 id = postCount;
    posts[postCount] = Post(id, _content, author, 0);

    emit PostCreated(id, _content, author, 0);
  }

  // allow users to tip post
  function tipPost(uint256 _postId) public payable{
    require(msg.value > 0, "Please tip a gwei / ehter");
    require(_postId > 0 && _postId <= postCount, "Looks like the post does not exist");


    // fetch the post and update tip amount data
    Post memory _post = posts[_postId];
    _post.tipAmount = _post.tipAmount + msg.value;
    posts[_postId] = _post;

    // pay author
    _post.author.transfer(msg.value);


    // trigger event
    emit PostTipped(_postId,  msg.sender, _post.author, msg.value, _post.tipAmount);
  }

}