"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { usePlayer, usePlayers } from "@/hooks/use-player";
import { useRoom, denormalizeRoomName } from "@/hooks/use-room";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { forwardRef, useEffect, useMemo, type HTMLProps } from "react";

export const runtime = "edge";

// eslint-disable-next-line react/display-name
const Title = forwardRef<
  HTMLHeadingElement,
  HTMLProps<HTMLHeadingElement> & { roomName: string }
>(({ roomName, className, ...props }, ref) => (
  <h1
    ref={ref}
    className={cn(
      "scroll-m-20 pb-2 text-3xl font-semibold capitalize tracking-tight transition-colors first:mt-0",
      className
    )}
    {...props}
  >
    {denormalizeRoomName(roomName)}
  </h1>
));

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
  const player = usePlayer();
  const isHost = useMemo(
    () => room && player && room.host === player.id,
    [room, player]
  );

  const sortedPlayers = useMemo(
    () =>
      players.sort((a, b) => {
        if ((b?.puntaje || 0) - (a?.puntaje || 0) !== 0)
          return (b?.puntaje || 0) - (a?.puntaje || 0);
        return a.name?.localeCompare(b.name || "") || 0;
      }),
    [players]
  );

  if (error || !room) {
    return <h1>Room not found</h1>;
  }

  return (
    <div className="container grid w-full grid-cols-4">
      <div className="order-2 col-span-4 flex w-full flex-col items-center md:order-1 md:col-span-3 md:py-10">
        <Title className="hidden md:block" roomName={roomName} />
        <p>Round {room.round}</p>
        <div className="flex w-full flex-wrap justify-start px-6 pt-6 md:pt-10">
          {sortedPlayers.map((p) => (
            <div key={p.id} className="w-1/2 px-4 md:w-1/3 lg:w-1/4 xl:w-1/5">
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
        <Title className="pt-8 text-center md:hidden" roomName={roomName} />
        <div className="mx-auto flex w-11/12 flex-col justify-center gap-6 py-4 md:ml-0 md:h-screen md:py-10">
          <Button
            variant="outline"
            className="border-success uppercase text-success hover:bg-success hover:text-white"
          >
            Lo hice
          </Button>
          <Button
            variant="outline"
            className="border-red-500 uppercase text-red-500 hover:bg-red-500 hover:text-white"
          >
            No lo hice
          </Button>
          {isHost && (
            <Button className="uppercase" variant="outline">
              Siguiente ronda
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
