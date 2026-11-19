
import api from "./api";

// Get issues belonging to one project
export const getIssuesByProject = async (projectId) => {
  const response = await api.get(`/issues/project/${projectId}`);
  return response.data;
};

// Get issues across multiple projects
export const getAllProjectIssues = async (projects) => {
  const issueRequests = projects.map((project) =>
    getIssuesByProject(project.id)
  );

  const issueResults = await Promise.all(issueRequests);

  return issueResults.flat();
};

// Create a new issue
export const createIssue = async (issueData) => {
  const response = await api.post("/issues", issueData);
  return response.data;
};

// Update issue details
export const updateIssue = async (issueId, issueData) => {
  const response = await api.put(`/issues/${issueId}`, {
    title: issueData.title,
    description: issueData.description,
    priority: issueData.priority,
  });

  return response.data;
};

// Update issue status
export const updateIssueStatus = async (issueId, status) => {
  const response = await api.patch(`/issues/${issueId}/status`, {
    status,
  });

  return response.data;
};

// Assign issue to developer
export const assignIssue = async (issueId, assigneeEmail) => {
  const response = await api.patch(`/issues/${issueId}/assign`, {
    assigneeEmail,
  });

  return response.data;
};

// Delete issue
export const deleteIssue = async (issueId) => {
  const response = await api.delete(`/issues/${issueId}`);
  return response.data;
};

// Filter issues by project, status, priority and assignee
export const filterIssues = async (projectId, filters = {}) => {
  const response = await api.get("/issues/filter", {
    params: {
      projectId,
      status: filters.status || undefined,
      priority: filters.priority || undefined,
      assigneeEmail: filters.assigneeEmail || undefined,
    },
  });

  return response.data;
};

// Search issues with server-side pagination
export const searchIssues = async (
  projectId,
  keyword,
  page = 0,
  size = 10
) => {
  const response = await api.get("/issues/search", {
    params: {
      projectId,
      keyword,
      page,
      size,
    },
  });

  return response.data;
};

// Get paginated and sorted project issues
export const getIssuesPaginated = async (
  projectId,
  page = 0,
  size = 10,
  sortBy = "createdAt",
  direction = "DESC"
) => {
  const response = await api.get(
    `/issues/project/${projectId}/paginated`,
    {
      params: {
        page,
        size,
        sortBy,
        direction,
      },
    }
  );

  return response.data;
};
