import supabase from "@/supabase";
import { Database } from "@/supabase/schema";
import { useEffect, useState } from "react";

type Vote = Database["public"]["Tables"]["votes"]["Row"];

export const useRound = (roundNumber?: number, room?: string) => {
  const [round, setRound] = useState<Vote[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase
      .from("votes")
      .select("*")
      .eq("room_name", room)
      .eq("round", roundNumber)
      .then((response) => {
        if (response.error) {
          setError(response.error.message);
          return;
        }

        setRound(response.data);
      });
  }, [room, roundNumber]);

  useEffect(() => {
    const subscription = supabase
      .channel(`${room}.rounds`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "votes",
          filter: `room_name=eq.${room}`,
        },
        (payload) => {
          const newVote = payload.new as Vote;
          if (payload.eventType === "INSERT") {
            setRound((round) => [...round, newVote]);
          } else if (payload.eventType === "UPDATE") {
            setRound((round) => {
              const index = round.findIndex(
                (p) =>
                  p.room_name === newVote.room_name &&
                  p.round === newVote.round &&
                  p.player === newVote.player
              );
              if (index > 0) {
                return [
                  ...round.slice(0, index),
                  newVote,
                  ...round.slice(index + 1),
                ];
              }
              return [...round, newVote];
            });
          } else if (payload.eventType === "DELETE") {
            const old = payload.old as Vote;
            return round.filter(
              (v) =>
                v.room_name === old.room_name &&
                v.player === old.player &&
                v.round === old.round
            );
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  });

  const sendResponse = async (result: boolean, playerId: number) => {
    if (!roundNumber || !room) return;

    const voteResponse = await supabase
      .from("votes")
      .insert({
        player: playerId,
        round: roundNumber,
        room_name: room,
        vote: result,
      })
      .select();

    if (!voteResponse.error && result) {
      await supabase.rpc("increment_points", { player_id: playerId });
    }
  };

  return { sendResponse, round };
};
