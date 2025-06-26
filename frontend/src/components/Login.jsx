import { Container, Grow, TextField, Button, Link, Alert } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { useNavigate } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import axiosInstance from './APIs/Axios.jsx';
import AlreadyLoggedIn from './snippets/AlreadyLoggedIn.jsx';
import { useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

export default function Login() {
    const navigate = useNavigate();
    const [invalidCredentials, setInvalidCredentials] = useState(false);
    const [alreadyLoggedIn, setAlreadyLoggedIn] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const formSchema = yup.object({
        username: yup.string().required('Username is required!').min(3, 'Username must be at least 3 characters long'),
        password: yup.string().required('Password is required!').min(8, 'Password must be at least 8 characters long'),
    });
    const { handleSubmit, control, setError } = useForm({
        resolver: yupResolver(formSchema),
        defaultValues: {
            username: '',
            password: '',
        },
    });

    const submission = (data) => {
        setInvalidCredentials(false);
        setAlreadyLoggedIn(false);

        if (localStorage.getItem('token')) {
            setAlreadyLoggedIn(true);
            return;
        }

        setIsSubmitting(true);

        axiosInstance.post('/login/', { username: data.username, password: data.password })
            .then((response) => {
                if (response.status === 200) {
                    localStorage.setItem('token', response.data.token);
                    navigate('/');
                } else {
                    setInvalidCredentials(true);
                }
            })
            .catch((error) => {
                if (error.response && error.response.status === 401) {
                    setInvalidCredentials(true);
                    setError("username", {
                        type: "manual",
                        message: "Invalid username or password"
                    });
                    setError("password", {
                        type: "manual",
                        message: "Invalid username or password"
                    });
                } else {
                    console.error("Login error:", error);
                    alert("An unexpected error occurred. Please try again.");
                }
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    };

    return (
        <Container maxWidth='sm'>
            {invalidCredentials && (
                <Grow in={invalidCredentials} style={{ transitionDelay: '200ms' }}>
                    <Alert severity='error' className='my-3' onClose={() => setInvalidCredentials(false)}>
                        Invalid username or password. Please try again.
                    </Alert>
                </Grow>
            )}

            {alreadyLoggedIn && (
                <Grow in={alreadyLoggedIn} style={{ transitionDelay: '200ms' }}>
                    <Alert icon={<CheckIcon fontSize='inherit' />} severity='info' className='my-3' onClose={() => setAlreadyLoggedIn(false)}>
                        You are already logged in. If you want to log in as another user, please log out first.
                    </Alert>
                </Grow>
            )}

            <div className='d-flex flex-column glassy align-items-center text-center p-4 px-0 px-sm-5'>
                {localStorage.getItem('token') ? (
                    <AlreadyLoggedIn />
                ) : (
                    <>
                        <h1 className='fw-bold secondaryColor my-3'>
                            <i className='bi-box-arrow-in-right'></i>&nbsp;Login
                        </h1>
                        <form onSubmit={handleSubmit(submission)}>
                            <Controller
                                name='username'
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                    <TextField
                                        {...field}
                                        label='Username'
                                        variant='outlined'
                                        error={!!error}
                                        helperText={error ? error.message : ''}
                                        margin='normal'
                                        required
                                        fullWidth
                                        autoComplete='username'
                                        autoFocus
                                        color='tertiary'
                                        disabled={isSubmitting}
                                    />
                                )}
                            />

                            <Controller
                                name='password'
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                    <TextField
                                        {...field}
                                        label='Password'
                                        variant='outlined'
                                        error={!!error}
                                        helperText={error ? error.message : ''}
                                        margin='normal'
                                        type='password'
                                        required
                                        fullWidth
                                        autoComplete='current-password'
                                        color='tertiary'
                                        disabled={isSubmitting}
                                    />
                                )}
                            />

                            <Button
                                type='submit'
                                fullWidth
                                variant='contained'
                                className='my-3'
                                size='large'
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Logging In...' : 'Sign In'}
                            </Button>

                            <Link href='/forgot-password/' className='text-light'>
                                Forgot password?
                            </Link>
                            <br />
                            <Link href='/register/' className='text-light'>
                                Don't have an account? Sign Up
                            </Link>
                        </form>
                    </>
                )}
            </div>
        </Container>
    );
}