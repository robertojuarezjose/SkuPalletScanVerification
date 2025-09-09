import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAccount } from '../../lib/hook/userAccount';
import NavBar from "../layout/Navbar";
import { useEffect } from "react";

export default function RequireAuth() {

    const {currentUser, loadingUserInfo, checkAuth} = useAccount();
    const location = useLocation();

    // Only check authentication when component mounts
    useEffect(() => {
        // Only check if we don't have user data yet
        if (!currentUser && !loadingUserInfo) {
            checkAuth();
        }
    }, []);

    if(loadingUserInfo) return <div>Loading...</div>

    if(!currentUser) return <Navigate to='/login' state={{from: location}} />
    
  return (
    <>
      <NavBar/>
      <Outlet/>
    </>
     
  )
}