"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MyDocumentsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/documents?tab=my-documents");
  }, [router]);

  return null;
}
