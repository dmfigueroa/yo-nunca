"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Room({
  params: { name: roomName },
}: {
  params: { name: string };
}) {
  const name =
    typeof window !== "undefined" ? localStorage.getItem("name") : null;

  const router = useRouter();

  useEffect(() => {
    if (!name) {
      router.push("/");
    }
  }, [name, router]);

  return (
    <div>
      <h1>{roomName}</h1>
    </div>
  );
}
