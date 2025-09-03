import {useForm} from 'react-hook-form';
import { useAccount } from '../../lib/hook/userAccount.ts';   
import type { LoginSchema } from '../../lib/schemas/loginSchema.ts';
import { loginSchema } from "../../lib/schemas/loginSchema.ts";
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Paper, Typography } from '@mui/material';
import LockOpen from '@mui/icons-material/LockOpen';
import TextInput from '../../app/shared/components/TextInput';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';


export default function LoginForm() {
    const {loginUser, currentUser} = useAccount();
    const navigate = useNavigate();
    const {control, handleSubmit, formState: {isValid, isSubmitting}} = useForm<LoginSchema>({
        mode: 'onTouched',
        resolver: zodResolver(loginSchema),
        defaultValues: { username: '', password: '' },
    });

    // Redirect if user is already logged in
    useEffect(() => {
        if (currentUser) {
            navigate('/home');
        }
    }, [currentUser, navigate]);

    const onSubmit =  (data: LoginSchema) => {
        console.log(data);
        loginUser.mutateAsync({username: data.username, password: data.password}, {
            onSuccess: async () => {
                console.log('Login successful');
                navigate('/home');
            },
            onError: (error) => {
                console.log(error);
            }
        });

    }



  return (
    <Box 
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}
    >
      <Paper 
        component='form' 
        onSubmit={handleSubmit(onSubmit)} 
        sx={{
            p: 3, 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 2, 
            width: '100%',
            maxWidth: '400px', 
            borderRadius: 3
        }} 
      >
        <Box display="flex" alignItems='center' justifyContent='center'
            gap={3} color='secondary.main'
        >
            <LockOpen fontSize='large' />
            <Typography variant='h4'>Sign in</Typography>


        </Box>
        <TextInput label='Username' control={control} name='username' placeholder='Enter your username'/>
        <TextInput label='Password' type='password' control={control} name='password'/>
        <Button
            type='submit' 
            disabled={!isValid || isSubmitting}
            variant='contained'
            size='large'
            
        >
            Login
        </Button>
        
   
    </Paper>
    </Box>
  )
}