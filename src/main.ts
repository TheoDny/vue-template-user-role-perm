import { createApp } from "vue"
import { createPinia } from "pinia"
import App from "./App.vue"
import { router } from "./router"
import { installGlobalApiErrorHandler } from "@/services/api-error-handler.service"

import "./assets/index.css"

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
installGlobalApiErrorHandler(router, pinia)

app.mount("#app")
