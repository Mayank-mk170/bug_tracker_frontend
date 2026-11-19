
import api from "./api";

// Get all comments for an issue
export const getComments = async (issueId) => {
  const response = await api.get(
    `/issues/${issueId}/comments`
  );

  return response.data;
};

// Add a comment
export const addComment = async (issueId, content) => {
  const response = await api.post(
    `/issues/${issueId}/comments`,
    { content }
  );

  return response.data;
};

// Update a comment
export const updateComment = async (
  issueId,
  commentId,
  content
) => {
  const response = await api.put(
    `/issues/${issueId}/comments/${commentId}`,
    { content }
  );

  return response.data;
};

// Delete a comment
export const deleteComment = async (
  issueId,
  commentId
) => {
  const response = await api.delete(
    `/issues/${issueId}/comments/${commentId}`
  );

  return response.data;
};
