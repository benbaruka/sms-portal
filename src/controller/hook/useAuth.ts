"use client";
const useAuth = () => {
  const token = localStorage.getItem("authToken");
  const userSession = localStorage.getItem("user-session");
  const User = userSession ? JSON.parse(userSession) : null;
  const idRole = User?.data?.role;
  const nameUser = User?.data?.username;
  const avatarUser = User?.data?.avatar;
  return {
    token,
    idRole,
    User,
    nameUser,
    avatarUser,
  };
};
export default useAuth;
