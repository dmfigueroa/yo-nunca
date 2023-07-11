"use client";
import { usePlayers } from "@/src/hooks/use-player";
import useRoom, { unnormalizeRoomName } from "@/src/hooks/use-room";
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

  const { room, error } = useRoom(roomName);
  const { players, error: playersError } = usePlayers(roomName);

  useEffect(() => {
    console.log(room, players, error);
  }, [room, players, error]);

  if (error) {
    return <h1>Room not found</h1>;
  }

  return (
    <div className="flex w-full flex-col items-center py-7">
      <h1 className="scroll-m-20 pb-2 text-3xl font-semibold capitalize tracking-tight transition-colors first:mt-0">
        {unnormalizeRoomName(room?.name)}
      </h1>

      <ul>
        {players.map((p) => (
          <li key={p.id}>
            {p.name} - {p.puntaje}
          </li>
        ))}
      </ul>
    </div>
  );
}
