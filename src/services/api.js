import axios from 'axios';

const BASE_URL = 'https://dummyjson.com';

export const fetchPosts = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const response = await axios.get(`${BASE_URL}/posts`, {
    params: { limit, skip }
  });
  return response.data.posts;
};

export const fetchPostById = async (id) => {
  const response = await axios.get(`${BASE_URL}/posts/${id}`);
  return response.data;
};

export const fetchUsers = async () => {
  const response = await axios.get(`${BASE_URL}/users`, { params: { limit: 100 } });
  return response.data.users.map(u => ({
    id: u.id,
    name: `${u.firstName} ${u.lastName}`,
    username: u.username,
    email: u.email
  }));
};

export const fetchUserById = async (id) => {
  const response = await axios.get(`${BASE_URL}/users/${id}`);
  const u = response.data;
  return {
    id: u.id,
    name: `${u.firstName} ${u.lastName}`,
    username: u.username,
    email: u.email
  };
};

export const fetchUserPosts = async (userId) => {
  const response = await axios.get(`${BASE_URL}/posts/user/${userId}`);
  return response.data.posts;
};

export const fetchCommentsByPostId = async (postId) => {
  const response = await axios.get(`${BASE_URL}/posts/${postId}/comments`);
  return response.data.comments.map(c => ({
    id: c.id,
    postId: c.postId,
    body: c.body,
    name: c.user.fullName,
    email: `${c.user.username}@example.com` 
  }));
};
