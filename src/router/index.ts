import { createRouter, createWebHistory } from "vue-router";
import { userDataConfig } from "@/store/layout/storeUserData.ts";
import HomeView from "@/views/HomeView.vue";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            children: [
                {
                    component: () => import("@/pages/private/dashboard/Dashboard.vue"),
                    meta: {
                        allowedRole: [ "Admin", "Gerente" ], label: "Dashboard",
                        icon: IconMaterialSymbolsDashboardOutlineRounded
                    },
                    name: "dashboard",
                    path: "/dashboard"
                },
                {
                    component: () => import("@/pages/private/task/TaskColumn.vue"),
                    meta: {
                        allowedRole: [ "Admin", "Gerente", "Usuario", "Tecnico" ], label: "Tareas",
                        icon: IconMaterialSymbolsInboxTextAsteriskOutline
                    },
                    name: "task",
                    path: "/task"
                },
                {
                    component: () => import("@/pages/private/projects/ListProjects.vue"),
                    meta: {
                        allowedRole: [ "Admin", "Gerente", "Usuario" ],
                        label: "Proyectos",
                        icon: IconMaterialSymbolsPivotTableChartRounded
                    },
                    name: "projects",
                    path: "/projects"
                },
                {
                    component: () => import("@/pages/private/assistance/AssistanceList.vue"),
                    meta: {
                        allowedRole: [ "Admin", "Gerente", "Usuario", "Tecnico" ],
                        label: "Asistencias",
                        icon: IconMaterialSymbolsCalendarMonth
                    },
                    name: "assistance",
                    path: "/assistance"
                },
                {
                    component: () => import("@/pages/private/reports/PrintReports.vue"),
                    meta: {
                        allowedRole: [ "Admin", "Gerente" ],
                        label: "Reportes",
                        icon: IconMaterialSymbolsPieChart
                    },
                    name: "reports",
                    path: "/reports"
                },
                {
                    component: () => import("@/pages/private/contacts/ContactsList.vue"),
                    meta: {
                        allowedRole: [ "Admin", "Gerente", "Usuario" ],
                        label: "Contactos",
                        icon: IconMaterialSymbolsPhoneEnabled
                    },
                    name: "contacts",
                    path: "/contacts-list"
                },
                {
                    component: () => import("@/pages/private/comments/CommentsList.vue"),
                    meta: {
                        allowedRole: [ "Admin", "Gerente", "Usuario" ],
                        label: "Comentarios",
                        icon: IconMaterialSymbolsCommentRounded
                    },
                    name: "comments-admin",
                    path: "/comments-admin"
                },
                {
                    component: () => import("@/pages/private/users/ListUsers.vue"),
                    meta: {
                        allowedRole: [ "Admin", "Gerente", 'Usuario' ], label: "Usuarios", icon: IconMaterialSymbolsSupervisorAccount
                    },
                    name: "users",
                    path: "/users"
                }
            ],
            component: () => import("@/pages/private/Layout.vue"),
            name: "home",
            path: "/home"
        },
        {
            path: "/",
            component: () => import("@/pages/public/LayoutWebPage.vue"),
            meta: { public: true },
            children: [
                { path: "", name: "webPage", component: HomeView },
                { path: "mision-y-vision", name: "mission-vision", component: () => import("@/views/MissionVisionView.vue") },
                { path: "promociones", name: "promotions", component: () => import("@/views/PromotionsView.vue") },
                { path: "testimonios", name: "testimonials", component: () => import("@/views/TestimonialsView.vue") },
                { path: "contacto", name: "contact", component: () => import("@/views/ContactView.vue") },
                { path: "politicas-de-privacidad", name: "privacy-policy", component: () => import("@/views/PrivacyPolicyView.vue") }
            ]
        },
        { path: "/login", name: "login", component: () => import("@/pages/public/Login.vue"), meta: { public: true } },
        { path: "/:pathMatch(.*)*", name: "not-found", component: () => import("@/components/NotFoundView.vue") }
    ]
});

router.beforeEach((to) => {
    const store = userDataConfig();

    const isAuth = Boolean(store.userData?.token);
    const userRole = store.userData?.user?.role;

    if (to.meta.public) {
        if (isAuth && to.name === "login") {
            return { name: "task" };
        }
        return true;
    }

    if ( !isAuth) {
        return { name: "login" };
    }

    const allowedRoles = to.meta.allowedRole as string[] | undefined;

    if (allowedRoles && !allowedRoles.includes(userRole)) {
        return { name: "not-authorized" };
    }

    return true;
});

export default router;
