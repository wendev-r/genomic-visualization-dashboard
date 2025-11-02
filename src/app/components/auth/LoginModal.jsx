'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    Typography,
    Alert,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';

export default function LoginModal({ open, onClose }) {
    const { checkAuth, setUser } = useAuth();
    const [isRegistering, setIsRegistering] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const endpoint = isRegistering ? '/auth/register' : '/auth/login';
            const response = await fetch(`http://127.0.0.1:5000${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Authentication failed');
            }

            if (!isRegistering) {
                // For login, store token and user data
                if (data.access_token) {
                    const token = `${data.token_type} ${data.access_token}`;
                    console.log('Storing token:', token);
                    localStorage.setItem('token', token);
                    // Store user data directly from login response
                    if (data.user) {
                        localStorage.setItem('user', JSON.stringify(data.user));
                        if (setUser) {
                            setUser(data.user);
                        } else {
                            console.error('setUser is not available in the auth context');
                        }
                    }
                    await checkAuth(); // Verify the token works
                } else {
                    throw new Error('No access token received');
                }
            } else {
                // For registration, show success and switch to login
                setError('');
                setIsRegistering(false);
                return;
            }
            
            // Close the modal
            onClose();
            
            // Refresh the page to update the UI
            window.location.reload();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                {isRegistering ? 'Create Account' : 'Login'}
            </DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            name="email"
                            label="Email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            autoFocus
                        />
                        <TextField
                            name="password"
                            label="Password"
                            type="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2, flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            disabled={loading}
                        >
                            {isRegistering ? 'Register' : 'Login'}
                        </Button>
                    </Box>
                    <Typography
                        variant="body2"
                        sx={{ cursor: 'pointer', textDecoration: 'underline' }}
                        onClick={() => setIsRegistering(!isRegistering)}
                    >
                        {isRegistering
                            ? 'Already have an account? Login'
                            : 'Need an account? Register'}
                    </Typography>
                </DialogActions>
            </form>
        </Dialog>
    );
}