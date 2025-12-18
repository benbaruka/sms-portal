"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ClientDocumentsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/documents?tab=client-documents");
  }, [router]);

  return null;
}
