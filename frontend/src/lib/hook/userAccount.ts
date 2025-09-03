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
            return await AccountApi.login(credentials);
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
            console.error('Login error:', error);
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

    // Get current user query
    const {data: currentUser, isLoading: loadingUserInfo } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            return await AccountApi.current();
        },
        enabled: !queryClient.getQueryData(['user']),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    

    return {
        loginUser,
        currentUser,
        logoutUser,
        loadingUserInfo,
        registerUser
        
    };
};