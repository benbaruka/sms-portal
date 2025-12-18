import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "SMS Portail",
  description: "SMS Portail Application",
  // other metadata
};

export default function SignUp() {
  return <SignUpForm />;
}
