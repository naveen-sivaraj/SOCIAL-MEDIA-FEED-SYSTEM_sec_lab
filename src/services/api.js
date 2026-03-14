import axios from 'axios';

const BASE_URL = 'https://jsonplaceholder.typicode.com';

export const fetchPosts = async (page = 1, limit = 10) => {
  const response = await axios.get(`${BASE_URL}/posts`, {
    params: { _page: page, _limit: limit }
  });
  // Since JSONPlaceholder headers contain x-total-count, we could return it but let's keep it simple.
  return response.data;
};

export const fetchPostById = async (id) => {
  const response = await axios.get(`${BASE_URL}/posts/${id}`);
  return response.data;
};

export const fetchUsers = async () => {
  const response = await axios.get(`${BASE_URL}/users`);
  return response.data; // To map userId to Name
};

export const fetchUserById = async (id) => {
  const response = await axios.get(`${BASE_URL}/users/${id}`);
  return response.data;
};

export const fetchUserPosts = async (userId) => {
  const response = await axios.get(`${BASE_URL}/posts`, {
    params: { userId }
  });
  return response.data;
};

export const fetchCommentsByPostId = async (postId) => {
  const response = await axios.get(`${BASE_URL}/comments`, {
    params: { postId }
  });
  return response.data;
};
