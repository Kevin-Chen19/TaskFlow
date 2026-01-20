import dashboard from "../pages/dashboard/dashboard.vue";
import projects from "../pages/projects/projects.vue";
import tasks from "../pages/tasks/tasks.vue";
import team from "../pages/team/team.vue";
import reports from "../pages/reports/reports.vue";
import roles from "@/pages/roles/roles.vue";
import settings from "@/pages/settings/settings.vue";
const routesConfig = [
  {
    path: "/dashboard",
    component: dashboard,
  },
  {
    path: "/projects",
    component: projects,
  },
  {
    path: "/tasks",
    component: tasks,
  },
  {
    path: "/team",
    component: team,
  },
  {
    path: "/reports",
    component: reports,
  },
  {
    path: "/roles",
    component: roles,
  },
  {
    path: "/settings",
    component: settings,
  },
];
export default routesConfig;
