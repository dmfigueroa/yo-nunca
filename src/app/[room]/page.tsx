"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { usePlayer, usePlayers } from "@/hooks/use-player";
import { denormalizeRoomName, useRoom } from "@/hooks/use-room";
import { useRound } from "@/hooks/use-round";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { forwardRef, useEffect, useMemo, type HTMLProps } from "react";
import { PlayerRow } from "../../hooks/use-player";
import { cva } from "class-variance-authority";

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

const PlayerCard = ({
  player,
  voted,
}: {
  player: PlayerRow;
  voted?: boolean;
}) => {
  const variant = useMemo(() => {
    if (voted === true) return "did";
    if (voted === false) return "didnt";
    return undefined;
  }, [voted]);

  const variants = cva(
    "mb-9 flex aspect-square w-full flex-col items-center justify-center px-7 py-8",
    {
      variants: {
        variant: {
          did: "border-success text-success",
          didnt: "border-red-500 text-red-500",
        },
      },
    }
  );

  return (
    <div className="w-1/2 px-4 md:w-1/3 lg:w-1/4 xl:w-1/5">
      <Card className={cn(variants({ variant }))}>
        <span className="mb-4 scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          {player.puntaje}
        </span>
        <span className="scroll-m-20 text-xl font-semibold tracking-tight">
          {player.name}
        </span>
      </Card>
    </div>
  );
};

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

  const { room, error, nextRound } = useRoom(roomName);
  const { players, error: playersError } = usePlayers(roomName);
  const player = usePlayer();
  const { round, sendResponse } = useRound(
    room?.round ?? undefined,
    room?.name
  );
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

  if (error || !room || !player) {
    return <h1>Room not found</h1>;
  }

  return (
    <div className="container grid w-full grid-cols-4">
      <div className="order-2 col-span-4 flex w-full flex-col items-center md:order-1 md:col-span-3 md:py-10">
        <Title className="hidden md:block" roomName={roomName} />
        <p>Round {room.round}</p>
        <div className="flex w-full flex-wrap justify-start px-6 pt-6 md:pt-10">
          {sortedPlayers.map((p) => (
            <PlayerCard
              key={p.id}
              player={p}
              voted={round?.find((v) => v.player === p.id)?.vote ?? undefined}
            />
          ))}
        </div>
      </div>
      <div className="order-1 col-span-4 flex flex-col md:order-2 md:col-span-1">
        <Title className="pt-8 text-center md:hidden" roomName={roomName} />
        <div className="mx-auto flex w-11/12 flex-col justify-center gap-6 py-4 md:ml-0 md:h-screen md:py-10">
          <Button
            variant="outline"
            className="border-success uppercase text-success hover:bg-success hover:text-white"
            onClick={() => sendResponse(true, player.id)}
          >
            Lo hice
          </Button>
          <Button
            variant="outline"
            className="border-red-500 uppercase text-red-500 hover:bg-red-500 hover:text-white"
            onClick={() => sendResponse(false, player.id)}
          >
            No lo hice
          </Button>
          {isHost && (
            <Button className="uppercase" variant="outline" onClick={nextRound}>
              Siguiente ronda
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
