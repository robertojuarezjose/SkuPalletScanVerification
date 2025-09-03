import { AppBar, Box, Container, MenuItem, Toolbar, Typography } from "@mui/material";
import { NavLink } from "react-router-dom";
import { Observer } from "mobx-react-lite";
import { useAccount } from "../../lib/hook/userAccount";
import { store } from "../../lib/stores/store";
import { navLinks } from "../../lib/utils/links";

export default function NavBar() {
    const { currentUser, logoutUser } = useAccount();

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="fixed" sx={{
                backgroundColor: 'primary.main',
            }}>
                <Container maxWidth="xl">
                    <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Box>
                            <MenuItem component={NavLink} to='/' sx={{ display: 'flex', gap: 2 }}>
                               
                                <Typography sx={{position: 'relative'}} variant="h4" fontWeight='bold'>
                                    Scan System
                                </Typography>
                                <Observer>
                                    {() => store.uiStore.isLoading ? (
                                        <Box 
                                            sx={{
                                                width: 20,
                                                height: 20,
                                                animation: 'spin 1s linear infinite',
                                                borderRadius: '50%',
                                                border: '2px solid transparent',
                                                borderTop: '2px solid white',
                                                position: 'absolute',
                                                top: '30%',
                                                left: '105%',
                                                '@keyframes spin': {
                                                    '0%': { transform: 'rotate(0deg)' },
                                                    '100%': { transform: 'rotate(360deg)' }
                                                }
                                            }}
                                        />
                                    ) : null}
                                </Observer>
                            </MenuItem>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            {
                                navLinks.map((link) => (
                                    <MenuItem 
                                        key={link.href} 
                                        component={NavLink} 
                                        to={link.href}
                                        sx={{
                                            '&.active': {
                                                borderBottom: '2px solid white',
                                                borderRadius: 0
                                            }
                                        }}
                                    >
                                        {link.label}
                                    </MenuItem>
                                ))
                            }
                            
                        </Box>
                        <Box display='flex' alignItems='center'>
                            {currentUser ? (
                                <Box display="flex" gap={2}>
                                    <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                                        {currentUser.displayName}
                                    </Typography>
                                    <MenuItem 
                                        onClick={() => logoutUser.mutate()}
                                        sx={{
                                            '&:hover': {
                                                backgroundColor: 'rgba(255, 255, 255, 0.1)'
                                            }
                                        }}
                                    >
                                        Logout
                                    </MenuItem>
                                </Box>
                            ) : (
                                <>
                                    <MenuItem 
                                        component={NavLink} 
                                        to='/login'
                                        sx={{
                                            '&.active': {
                                                borderBottom: '2px solid white',
                                                borderRadius: 0
                                            }
                                        }}
                                    >
                                        Login
                                    </MenuItem>
                                </>
                            )}
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>
        </Box>
    )
}
