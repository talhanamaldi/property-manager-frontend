import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { logout } from "@/features/auth/authSlice";
import { useNavigate } from "react-router-dom";

export default function SignOut() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    useEffect(() => {
        dispatch(logout());
        navigate("/signin", { replace: true });
    }, [dispatch, navigate]);
    return null;
}
