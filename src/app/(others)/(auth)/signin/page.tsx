"use client";

import { useState } from "react";
import SignInForm from "@/components/auth/SignInForm";
import SignUpForm from "@/components/auth/SignUpForm";

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <>
      {isSignUp ? (
        <SignUpForm setIsSignUp={setIsSignUp} />
      ) : (
        <SignInForm setIsSignUp={setIsSignUp} />
      )}
    </>
  );
}
