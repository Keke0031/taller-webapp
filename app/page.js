"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredSession } from "@/lib/session";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const usuario = getStoredSession();
    router.replace(usuario ? "/dashboard" : "/login");
  }, [router]);
  return <div className="loading-box">Cargando…</div>;
}
