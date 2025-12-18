"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AllRolesPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to main roles page with tabs
    router.replace("/admin/roles?tab=roles");
  }, [router]);

  return null;
}
