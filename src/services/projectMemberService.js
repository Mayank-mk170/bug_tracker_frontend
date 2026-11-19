
import api from "./api";

// Get all members of a project
export const getProjectMembers = async (projectId) => {
  const response = await api.get(`/projects/${projectId}/members`);
  return response.data;
};

// Add a member to a project
export const addProjectMember = async (projectId, memberData) => {
  const response = await api.post(
    `/projects/${projectId}/members`,
    memberData
  );
  return response.data;
};

// Remove a member from a project
export const removeProjectMember = async (projectId, userId) => {
  const response = await api.delete(
    `/projects/${projectId}/members/${userId}`
  );
  return response.data;
};
