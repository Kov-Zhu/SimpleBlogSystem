const { expect } = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const Blog = require('../models/Blog');
const Comment = require('../models/Comment');
const {
  getBlogs,
  addBlog,
  editBlog,
  deleteBlog,
  createBlogComment
} = require('../controllers/blogController');

describe('Blog API Tests', () => {
  let findStub, createStub, findByIdStub, findByIdAndUpdateStub, findByIdAndDeleteStub, commentCreateStub;

  beforeEach(() => {
    // Mock database operations
    findStub = sinon.stub(Blog, 'find');
    createStub = sinon.stub(Blog, 'create');
    findByIdStub = sinon.stub(Blog, 'findById');
    findByIdAndUpdateStub = sinon.stub(Blog, 'findByIdAndUpdate');
    findByIdAndDeleteStub = sinon.stub(Blog, 'findByIdAndDelete');
    commentCreateStub = sinon.stub(Comment, 'create');
  });

  afterEach(() => {
    // Restore original functions
    findStub.restore();
    createStub.restore();
    findByIdStub.restore();
    findByIdAndUpdateStub.restore();
    findByIdAndDeleteStub.restore();
    commentCreateStub.restore();
  });

  /*** 1. 测试 getBlogs() 获取已发布的博客 ***/
  it('should return all published blogs with populated fields', async () => {
    const blogId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();

    // Mock blog data
    const blogs = [{
      _id: blogId,
      title: "Sample Blog",
      content: "This is a test blog",
      author: { _id: userId, name: "Test User", email: "test@example.com" },
      comments: [],
      status: 'published'
    }];

    // Mock the behavior of Blog.find()
    findStub.returns({
      populate: sinon.stub().returns({
        populate: sinon.stub().returns({
          lean: sinon.stub().resolves(blogs)
        })
      })
    });

    const req = {};
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    await getBlogs(req, res);

    expect(findStub.calledOnce).to.be.true;
    expect(res.json.calledWith(blogs)).to.be.true;
  });

  /*** 2. 测试 addBlog() 添加博客 ***/
  it('should create a new blog successfully', async () => {
    const req = {
      user: { id: new mongoose.Types.ObjectId() },
      body: {
        title: "New Blog",
        content: "This is a new blog content",
        tags: "#test",
        status: "published"
      }
    };

    // Mock created blog
    const createdBlog = {
      _id: new mongoose.Types.ObjectId(),
      ...req.body,
      author: req.user.id
    };

    createStub.resolves(createdBlog);

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await addBlog(req, res);

    expect(createStub.calledOnceWith({
      title: req.body.title,
      content: req.body.content,
      tags: req.body.tags,
      author: req.user.id,
      status: req.body.status
    })).to.be.true;

    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledWith(createdBlog)).to.be.true;
  });

  /*** 3. 测试 editBlog() 编辑博客 ***/
  it('should update the blog when the user is the author', async () => {
    const userId = new mongoose.Types.ObjectId().toString();
    const blogId = new mongoose.Types.ObjectId().toString();

    // 模拟博客
    const existingBlog = {
      _id: blogId,
      title: "Old Title",
      content: "Old Content",
      author: userId,
      toObject: () => existingBlog
    };

    const updatedBlog = {
      ...existingBlog,
      title: "Updated Title",
      content: "Updated Content",
      toObject: () => updatedBlog
    };

    // Stub `findById` 返回旧博客
    findByIdStub.resolves(existingBlog);

    // Stub `findByIdAndUpdate` 模拟返回 Mongoose Query
    findByIdAndUpdateStub.returns({
      populate: sinon.stub().returns({
        populate: sinon.stub().returns({
          lean: sinon.stub().resolves(updatedBlog)
        })
      })
    });

    const req = {
      params: { id: blogId },
      user: { id: userId },
      body: { title: "Updated Title", content: "Updated Content" }
    };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    // 调用 `editBlog`
    await editBlog(req, res);

    // 验证返回状态码
    expect(res.status.calledWith(200)).to.be.true;
  });



  /*** 4. 测试 deleteBlog() 删除博客 ***/
  it('should delete a blog when the user is the author', async () => {
    const blogId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();

    const req = {
      user: { id: userId.toString() },
      params: { id: blogId.toString() }
    };

    const existingBlog = { _id: blogId, author: userId.toString() };

    findByIdStub.resolves(existingBlog);
    findByIdAndDeleteStub.resolves({});

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await deleteBlog(req, res);

    expect(findByIdStub.calledOnceWith(blogId.toString())).to.be.true;
    expect(findByIdAndDeleteStub.calledOnceWith(blogId.toString())).to.be.true;
    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledWith({ message: 'Blog deleted successfully' })).to.be.true;
  });

  /*** 5. 测试 createBlogComment() 添加评论 ***/
  it('should create a comment for a blog', async () => {
    const blogId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();

    const req = {
      user: { id: userId.toString() },
      body: {
        blogId: blogId.toString(),
        content: "This is a comment"
      }
    };

    // Mock created comment
    const createdComment = {
      _id: new mongoose.Types.ObjectId(),
      blog: blogId.toString(),
      author: userId.toString(),
      content: req.body.content
    };

    commentCreateStub.resolves(createdComment);

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await createBlogComment(req, res);

    expect(commentCreateStub.calledOnceWith({
      blog: blogId.toString(),
      author: userId.toString(),
      content: req.body.content
    })).to.be.true;

    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledWith(createdComment)).to.be.true;
  });
});
