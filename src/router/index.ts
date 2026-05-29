import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            children: [
                {
                    name: "test1",
                    path: "/test1",
                    component: () => import("@/components/HelloWorld.vue")
                },
                {
                    name: "users",
                    path: "/users",
                    component: () => import("@/pages/private/users/ListUsers.vue")
                }
            ],
            component: () => import("@/pages/private/Layout.vue"),
            name: "home",
            path: "/"
        },
        {
            component: () => import("@/pages/public/Login.vue"),
            name: "login",
            path: "/login"
        }
    ]
});

export default router;
