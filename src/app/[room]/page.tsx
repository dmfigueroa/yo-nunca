"use client";
import { Card } from "@/components/ui/card";
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
    <div className="flex w-full flex-col items-center py-10">
      <h1 className="scroll-m-20 pb-2 text-3xl font-semibold capitalize tracking-tight transition-colors first:mt-0">
        {unnormalizeRoomName(room?.name)}
      </h1>

      <div className="flex w-full flex-wrap justify-start px-6 pt-16">
        {players.map((p) => (
          <div key={p.id} className="w-1/2 px-4 md:w-1/4 lg:w-1/5">
            <Card className="mb-9 flex aspect-square w-full flex-col items-center justify-center px-7 py-8">
              <span className="mb-4 scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                {p.puntaje}
              </span>
              <span className="scroll-m-20 text-xl font-semibold tracking-tight">
                {p.name}
              </span>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
