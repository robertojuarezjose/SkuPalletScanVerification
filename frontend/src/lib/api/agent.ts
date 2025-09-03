import axios from "axios";
import type { AxiosResponse } from "axios";
import { store } from "../stores/store"; // Store is now ready to use
import { toast } from "react-toastify"; // Toastify is already available
// import { router } from "../../app/router/Routes"; // TODO: Setup router
import { API_URL } from "../api/constants";

const sleep = (delay: number) => {
    return new Promise((resolve) => {
        setTimeout(resolve, delay);
    });
}

const agent = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

// Help function to get the response data
const responseBody = <T>(response: AxiosResponse<T>) => response.data;

// Function to check if we should show error toasts
const shouldShowToast = () => {
    // Check if current path is login page
    const isAuthPage = window.location.pathname === '/' || 
                      window.location.pathname === '/login';
    return !isAuthPage;
};

agent.interceptors.request.use(config => {
    // Add loading indicator using store
    store.uiStore.isBusy();
    return config; 
})

agent.interceptors.response.use(
    async response => {
        await sleep(1000); // Simulate network delay
        // Update UI state using store
        store.uiStore.isIdle();
        return response;
    },

    async error => {
        await sleep(1000); // Simulate network delay
        // Update UI state using store
        store.uiStore.isIdle();
        
        const {status, data} = error.response || {};
        const showToast = shouldShowToast();
        
        if (error.response) {
            switch (status) {
                case 400:
                    if(data?.errors) {
                        const modalStateErrors = [];
                        for (const key in data.errors) {
                            if (data.errors[key]) {
                                modalStateErrors.push(data.errors[key]);
                            }
                        }
                        throw modalStateErrors.flat();
                    } else if(showToast) {
                        toast.error(data);
                    }
                    break;
                case 401:
                    if(showToast) toast.error('Unauthorized');
                    break;
                case 403:
                    if(showToast) toast.error('Forbidden');
                    break;
                case 404:
                    if(showToast) toast.error('Not found');
                    // TODO: Implement routing
                    // router.navigate('/not-found');
                    break;
                case 500:
                    if(showToast) toast.error('Server error');
                    // TODO: Implement routing
                    // router.navigate('/server-error', {state: {error: data}});
                    break;
                default:
                    if(showToast) toast.error('An unexpected error occurred');
                    break;
            }
        } else if(showToast) {
            toast.error('Network error: Could not connect to server');
        }

        return Promise.reject(error);
    }
);

// Request methods
const requests = {
    get: <T>(url: string, config?: { headers?: Record<string, string> }) => 
        agent.get<T, AxiosResponse<T>>(url, config).then(responseBody),
    post: <T>(url: string, body: unknown, config?: { headers?: Record<string, string> }) => 
        agent.post<T, AxiosResponse<T>>(url, body, config).then(responseBody),
    put: <T>(url: string, body: unknown, config?: { headers?: Record<string, string> }) => 
        agent.put<T, AxiosResponse<T>>(url, body, config).then(responseBody),
    del: <T>(url: string, config?: { headers?: Record<string, string> }) => 
        agent.delete<T, AxiosResponse<T>>(url, config).then(responseBody),
};

export default requests;