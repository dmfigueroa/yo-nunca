"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { usePlayers } from "@/src/hooks/use-player";
import useRoom, { unnormalizeRoomName } from "@/src/hooks/use-room";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

export const runtime = "edge";

const Title = ({ roomName }: { roomName: string }) => (
  <h1 className="scroll-m-20 pb-2 text-3xl font-semibold capitalize tracking-tight transition-colors first:mt-0">
    {unnormalizeRoomName(roomName)}
  </h1>
);

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

  const sortedPlayers = useMemo(
    () =>
      players.sort((a, b) => {
        if ((b?.puntaje || 0) - (a?.puntaje || 0) !== 0)
          return (b?.puntaje || 0) - (a?.puntaje || 0);
        return a.name?.localeCompare(b.name || "") || 0;
      }),
    [players]
  );

  if (error) {
    return <h1>Room not found</h1>;
  }

  return (
    <div className="container grid w-full grid-cols-4">
      <div className="order-2 col-span-4 flex w-full flex-col items-center md:order-1 md:col-span-3 md:py-10">
        <div className="flex w-full flex-wrap justify-start px-6 pt-16">
          {sortedPlayers.map((p) => (
            <div key={p.id} className="w-1/2 px-4 md:w-1/4 lg:w-1/5 xl:w-1/6">
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
      <div className="order-1 col-span-4 flex flex-col md:order-2 md:col-span-1">
        <div className="mx-auto flex w-11/12 flex-col justify-center gap-6 py-10 md:ml-0 md:h-screen">
          <Button
            variant="outline"
            className="border-red-500 uppercase text-red-500 hover:bg-red-500 hover:text-white"
          >
            Lo hice
          </Button>
          <Button
            variant="outline"
            className="border-success uppercase text-success hover:bg-success hover:text-white"
          >
            No lo hice
          </Button>
        </div>
      </div>
    </div>
  );
}
