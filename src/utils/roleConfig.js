
export const ROLE_DASHBOARDS = {
  MANAGER: "/manager/dashboard",
  DEVELOPER: "/developer/dashboard",
};

export const getDashboardPath = (role) => {
  return ROLE_DASHBOARDS[role] || "/login";
};
