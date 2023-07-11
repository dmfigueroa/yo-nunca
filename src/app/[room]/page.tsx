"use client";
import { usePlayers } from "@/src/hooks/use-player";
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

  const { data, error } = useRoom(roomName);
  const { players, error: playersError } = usePlayers(roomName);

  useEffect(() => {
    console.log(data, players);
  }, [data, players]);

  if (error) {
    return <h1>Room not found</h1>;
  }

  return (
    <div>
      <h1>{data?.name}</h1>

      <ul>
        {players.map((p) => (
          <li key={p.id}>{p.name}</li>
        ))}
      </ul>
    </div>
  );
}
