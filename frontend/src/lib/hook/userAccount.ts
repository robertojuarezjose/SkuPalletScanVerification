import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import AccountApi from '../api/accountApi';
import type { UserFormValues } from '../types/user';

export const useAccount = () => {  
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    
    // Login mutation
    const loginUser = useMutation({
        mutationFn: async (credentials: UserFormValues) => {     
            const response = await AccountApi.login(credentials);
            // Check if login was actually successful
            if (!response) {
                throw new Error('Invalid credentials');
            }
            return response;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['user'],
            });
            
            // Optionally redirect after login
            // navigate('/dashboard');
            toast.success('Login successful');
        },
        onError: (error: unknown) => {
            toast.error('Login failed');
            // Don't log 401 errors to console - they're expected for invalid credentials
            if ((error as any)?.response?.status !== 401) {
                console.error('Login error:', error);
            }
        }
    });

    // Register mutation
    const registerUser = useMutation({
        mutationFn: async (credentials: UserFormValues) => {
            return await AccountApi.register(credentials);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['user'],
            });
            toast.success('User registered successfully');
        },
        onError: (error: unknown) => {
            toast.error('Registration failed');
            console.error('Registration error:', error);
        }
    });

    // Logout mutation
    const logoutUser = useMutation({
        mutationFn: async () => {
            return await AccountApi.logout();
        },
        onSuccess: async () => {
            queryClient.removeQueries({queryKey: ['user']});
            // Remove other queries if needed
            toast.success('Logged out successfully');
            navigate('/');
        },
        onError: () => {
            toast.error('Logout failed');
        }
    });

    // Get current user query - only run when we have a potential token
    const {data: currentUser, isLoading: loadingUserInfo } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            return await AccountApi.current();
        },
        enabled: false, // Disable automatic fetching
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: false, // Don't retry on 401 errors
    });

    // Function to manually check authentication
    const checkAuth = () => {
        queryClient.fetchQuery({
            queryKey: ['user'],
            queryFn: async () => {
                try {
                    return await AccountApi.current();
                } catch (error: any) {
                    // Handle 401 gracefully - user is not authenticated
                    if (error?.response?.status === 401) {
                        return null;
                    }
                    throw error;
                }
            },
            staleTime: 5 * 60 * 1000,
        });
    };

    

    return {
        loginUser,
        currentUser,
        logoutUser,
        loadingUserInfo,
        registerUser,
        checkAuth
        
    };
};