"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CreateDocumentTypeRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/documents?tab=create-type");
  }, [router]);

  return null;
}
