import dashboard from "../pages/dashboard/dashboard.vue";
import projects from "../pages/projects/projects.vue";
import tasks from "../pages/tasks/tasks.vue";
import team from "../pages/team/team.vue";
import calendar from "../pages/calendar/calendar.vue";
import roles from "@/pages/roles/roles.vue";
import settings from "@/pages/settings/settings.vue";
import me from "@/pages/me/me.vue";
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
    path: "/calendar",
    component: calendar,
  },
  {
    path: "/roles",
    component: roles,
  },
  {
    path: "/settings",
    component: settings,
  },
  {
    path: "/me",
    component: me,
  }
];
export default routesConfig;
