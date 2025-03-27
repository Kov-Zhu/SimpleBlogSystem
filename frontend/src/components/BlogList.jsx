import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';
import CommentForm from './CommentForm';

const BlogList = ({ blogs, setBlogs, setEditingBlog, pagination, setPagination}) => {
    const { user } = useAuth();

    const handleDelete = async (id) => {
        if (!user) return alert('You must be logged in to delete a blog.');

        try {
            await axiosInstance.delete(`/api/blogs/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            setBlogs(blogs.filter(blog => blog._id !== id));
            alert('Blog deleted successfully.');
        } catch (error) {
            alert('Failed to delete blog.');
        }
    };

    const loadMoreComments = async (blogId) => {
        try {
            const nextPage = (pagination[blogId]?.page || 0) + 1;
            const response = await axiosInstance.get(`/api/blogs/${blogId}/comments?page=${nextPage}`);

            // Update pagination status
            setPagination(prev => ({
                ...prev,
                [blogId]: {
                    page: nextPage,
                    hasMore: nextPage < response.data.pages // 使用后端返回的总页数
                }
            }));

            setBlogs(prevBlogs =>
                prevBlogs.map(blog => {
                    if (blog._id === blogId) {
                        return {
                            ...blog,
                            comments: [...blog.comments, ...response.data.comments]
                        };
                    }
                    return blog;
                })
            );
            console.log('Test pagination loading');
            console.log('Pagination response data:', response.data);
            console.log('Pagination before updating:', pagination[blogId]);
            console.log('Pagination after updating:', {
                page: nextPage,
                hasMore: nextPage < response.data.pages
            });
        } catch (error) {
            console.error('Failed to load comments:', error);
        }
    };

    const handleNewComment = (blogId, newComment) => {
        setBlogs(blogs.map(blog => {
            if (blog._id === blogId) {
                newComment.author = user;
                return {
                    ...blog,
                    comments: [newComment, ...blog.comments]
                };
            }
            return blog;
        }));
    };

    return (
        <div className="bg-white p-6 shadow-md rounded">
            {blogs.map(blog => (
                <div key={blog._id} className="border-b pb-4 mb-4">

                    {/* Blog Content */}
                    <h3 className="text-xl font-semibold">{blog.title}</h3>
                    <p className="text-gray-600">{blog.content}</p>
                    <div className="flex gap-2 mt-2">
                        <button
                            className="bg-green-500 text-white px-4 py-1 rounded"
                            onClick={() => setEditingBlog(blog)}
                        >
                            Edit
                        </button>
                        <button
                            className="bg-red-500 text-white px-4 py-1 rounded"
                            onClick={() => handleDelete(blog._id)}
                        >
                            Delete
                        </button>
                    </div>
                    <div className="mt-4">
                        <h4 className="font-semibold mb-2">Comment</h4>

                        {/* List of comments */}
                        {blog.comments?.map(comment => (
                            <div key={comment._id} className="bg-gray-50 p-3 rounded mb-2">
                                <div className="flex items-center mb-1">
                                    <span className="font-medium">{comment.author.name}</span>
                                    <span className="text-gray-500 text-sm ml-2">
                                        {new Date(comment.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-gray-700">{comment.content}</p>
                            </div>
                        ))}

                        {/* Load More Button */}
                        {console.log(pagination[blog._id]?.hasMore)}
                        {pagination[blog._id]?.hasMore && (
                            <button
                                onClick={() => loadMoreComments(blog._id)}
                                className="text-blue-600 text-sm mt-2"
                            >
                                Load more comments...
                            </button>
                        )}

                        {/* Comment form */}
                        {user && <CommentForm
                            blogId={blog._id}
                            onCommentAdded={(newComment) => handleNewComment(blog._id, newComment)}
                        />}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default BlogList;
