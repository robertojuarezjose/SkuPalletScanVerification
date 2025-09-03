import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAccount } from '../../lib/hook/userAccount';

export default function RequireAuth() {

    const {currentUser, loadingUserInfo} = useAccount();
    const location = useLocation();


    if(loadingUserInfo) return <div>Loading...</div>


    if(!currentUser) return <Navigate to='/login' state={{from: location}} />
    
  return (
    <Outlet/>
  )
}