"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import LoginModal from './auth/LoginModal';
import { useAuth } from '../context/AuthContext';
import { Menu, MenuItem } from '@mui/material';
import { AccountCircle, Folder, Logout } from '@mui/icons-material';

export default function Header() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const [loginOpen, setLoginOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);

    const handleTabChange = () => {
        router.push('/my-files');
    };

    const handleLogin = () => {
        setLoginOpen(true);
    };

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleMenuClose();
        logout();
    };

    return (
        <>
            <AppBar position="static" sx={{
                backgroundColor: '#1e1f22', // or try #2b2d31
                color: '#f5f5f5',
                boxShadow: 'none', // cleaner, modern look
            }}>
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Genomic Data Visualizer
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {user ? (
                            <>
                                <Button
                                    color="inherit"
                                    onClick={handleMenuClick}
                                    endIcon={<AccountCircle />}
                                >
                                    {user.email}
                                </Button>
                                <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={handleMenuClose}
                                    PaperProps={{
                                        elevation: 3,
                                        sx: {
                                            mt: 1,
                                            minWidth: '200px'
                                        }
                                    }}
                                >
                                    <MenuItem
                                        onClick={() => {
                                            handleMenuClose();
                                            handleTabChange();
                                        }}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1
                                        }}
                                    >
                                        My Files
                                    </MenuItem>
                                    <MenuItem
                                        onClick={handleLogout}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            color: 'error.main'
                                        }}
                                    >
                                        Logout
                                    </MenuItem>
                                </Menu>
                            </>
                        ) : (
                            <Button
                                color="inherit"
                                onClick={handleLogin}
                                sx={{ ml: 1 }}
                            >
                                Log in
                            </Button>
                        )}
                    </Box>
                </Toolbar>
            </AppBar>
            <LoginModal
                open={loginOpen}
                onClose={() => setLoginOpen(false)}
            />
        </>
    );
}
