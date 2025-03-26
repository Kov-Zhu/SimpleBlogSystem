const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const mongoose = require('mongoose');
const { expect } = chai;
const app = require('../server'); // Adjust path as necessary
const Blog = require('../models/Blog');
const Comment = require('../models/Comment');
const { addBlog, getBlogs, createComment } = require('../controllers/blogController');

chai.use(chaiHttp);

describe('Blog API Tests', () => {
  let createBlogStub, findBlogStub, createCommentStub;

  beforeEach(() => {
    // Stubbing methods
    createBlogStub = sinon.stub(Blog, 'create');
    findBlogStub = sinon.stub(Blog, 'find');
    createCommentStub = sinon.stub(Comment, 'create');
  });

  afterEach(() => {
    // Restore the stubs
    createBlogStub.restore();
    findBlogStub.restore();
    createCommentStub.restore();
  });

  // ================== Add Blog Tests ==================
  describe('Add Blog', () => {
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

      // Mock blog that would be created
      const createdBlog = {
        _id: new mongoose.Types.ObjectId(),
        ...req.body,
        author: req.user.id
      };

      // Use for expected response
      const expectedBlog = {
        _id: createdBlog._id,
        ...req.body,
        author: req.user.id
      }

      // Mock Blog.create to resolve the created blog
      createBlogStub.resolves(createdBlog);

      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy(),
      };

      // Call addBlog function
      await addBlog(req, res);
      console.log(res.json.getCalls()[0]);

      // Assert that Blog.create was called with correct arguments
      expect(createBlogStub.calledOnceWith({
        title: req.body.title,
        content: req.body.content,
        tags: req.body.tags,
        author: req.user.id,
        status: req.body.status
      })).to.be.true;

      // Assert the response status and json content
      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledWithMatch(expectedBlog)).to.be.true;


    });

    it('should return 500 if an error occurs', async () => {
      const req = {
        user: { id: new mongoose.Types.ObjectId() },
        body: {
          title: "New Blog",
          content: "This is a new blog content",
          tags: ["tech", "coding"],
          status: "published"
        }
      };

      // Simulate an error in Blog.create
      createBlogStub.throws(new Error('DB Error'));

      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy(),
      };

      // Call addBlog function
      await addBlog(req, res);

      // Assert that the error response is sent
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
    });
  });

  describe('Get Blogs', () => {
    it('should return all published blogs', async () => {
      const blogId = new mongoose.Types.ObjectId();
      const req = {};

      // Mock data setup
      const user = {
        _id: new mongoose.Types.ObjectId(),
        name: "John Doe",
        email: "john@example.com"
      };

      // Mock blog data
      const blogs = {
        _id: new mongoose.Types.ObjectId(),
        title: "Test Blog",
        content: "Test content",
        author: user,
        comments: [{
          _id: new mongoose.Types.ObjectId(),
          content: "Great post!"
        }],
        status: 'published'
      };

      // Use for expected response
      // const expectedBlogs = blogs.map(blog => {
      //   return {
      //     title: blogs.title,
      //     content: blogs.content,
      //     author: blogs.author,
      //     tags: blogs.tags,
      //     status: blogs.status,
      //   }
      // });


      // Query chain mocking
      const queryMock = {
        populate: sinon.stub().returnsThis(), // populate 返回自身以支持链式调用
        exec: sinon.stub().resolves(blogs)    // exec 返回解析后的数据
      };

      // Mock Blog.find() returning the list of blogs
      findBlogStub.returns(queryMock);

      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy()
      };

      // Call getBlogs function
      await getBlogs(req, res);

      // Verify query construction
      expect(findBlogStub.calledOnceWith({ status: 'published' })).to.be.true;
      
      // Verify populate calls
      expect(queryMock.populate.firstCall.calledWith('author', 'name email'))
        .to.be.true;
      expect(queryMock.populate.secondCall.calledWith('comments'))
        .to.be.true;

      // Assert that findBlogStub was called and the correct response was returned
      expect(findBlogStub.calledOnce).to.be.true;

    });

    it('should return 500 if an error occurs while fetching blogs', async () => {
      const req = {};

      // Simulate an error in Blog.find()
      findBlogStub.throws(new Error('DB Error'))

      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy(),
      };

      // Call getBlogs function
      await getBlogs(req, res);

      // Assert that the error response is sent
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
    });
  });

  describe('Create Comment', () => {
    it('should create a new comment successfully', async () => {
      const req = {
        body: {
          blogId: new mongoose.Types.ObjectId(),
          authorId: new mongoose.Types.ObjectId(),
          content: "This is a new comment"
        }
      };

      const newComment = {
        _id: new mongoose.Types.ObjectId(),
        blog: req.body.blogId,
        author: req.body.authorId,
        content: req.body.content
      };

      const expectedComment = {
        blog: req.body.blogId,
        author: req.body.authorId,
        content: req.body.content
      };

      // Mock Comment.create to resolve with new comment
      createCommentStub.resolves(newComment);

      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy(),
      };

      // Call createComment function
      await createComment(req, res);

      // Assert that Comment.create was called with correct arguments
      expect(createCommentStub.calledOnceWith({
        blog: req.body.blogId,
        author: req.body.authorId,
        content: req.body.content,
      })).to.be.true;

      // Assert the response status and json content
      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'Comment created successfully', comment: expectedComment })).to.be.true;
    });

    it('should return 500 if an error occurs while creating comment', async () => {
      const req = {
        body: {
          blogId: new mongoose.Types.ObjectId(),
          authorId: new mongoose.Types.ObjectId(),
          content: "This is a new comment"
        }
      };

      // Simulate an error in Comment.create
      createCommentStub.throws(new Error('DB Error'));

      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy(),
      };

      // Call createComment function
      await createComment(req, res);

      // Assert that the error response is sent
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
    });
  });
});
