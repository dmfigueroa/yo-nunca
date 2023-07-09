"use client";
import useRoom from "@/src/hooks/use-room";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const runtime = "edge";

export default function Room({
  params: { room: roomName },
}: {
  params: { room: string };
}) {
  const name =
    typeof window !== "undefined" ? localStorage.getItem("name") : null;

  const router = useRouter();

  useEffect(() => {
    if (!name) {
      router.push("/");
    }
  }, [name, router]);

  const room = useRoom(roomName)

  return (
    <div>
      <h1>{room.name}</h1>
    </div>
  );
}
