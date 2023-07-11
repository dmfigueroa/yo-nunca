import { useEffect, useState } from "react";
import supabase from "../supabase";
import { Database } from "../supabase/schema";
import { normalizeRoomName } from "./use-room";

export type PlayerRow = Database["public"]["Tables"]["players"]["Row"];

const usePlayer = (playerName: string) => {
  const [player, setPlayer] = useState<PlayerRow | undefined>(undefined);

  const localPlayer = localStorage.getItem("player");

  if (localPlayer) setPlayer(JSON.parse(localPlayer));

  return { player };
};

export const usePlayers = (roomName: string) => {
  const normalizedName = normalizeRoomName(roomName);
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase
      .from("players")
      .select()
      .eq("room_name", normalizedName)
      .then((playersResponse) => {
        if (playersResponse.error) {
          return setError(playersResponse.error.message);
        }
        if (!playersResponse.data) {
          return setError("No data found");
        }
        setPlayers(playersResponse.data);
      });
  }, [normalizedName]);

  useEffect(() => {
    const subscription = supabase
      .channel(normalizedName)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "players",
          filter: `room_name=eq.${normalizedName}`,
        },
        (payload) => {
          if (payload.errors && payload.errors.length > 0) {
            return setError(payload.errors[0]);
          }

          setPlayers((players) => {
            const index = players.findIndex((p) => p.id === payload.new.id);
            const newPlayer = payload.new as (typeof players)[0];
            if (index > 0) {
              return [
                ...players.slice(0, index),
                newPlayer,
                ...players.slice(index + 1),
              ];
            }
            return [...players, newPlayer];
          });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [normalizedName]);

  return { players, error };
};

export const getOrCreatePlayer = async (
  playerName: string
): Promise<Result<PlayerRow, Error>> => {
  const { data: playerData } = await supabase
    .from("players")
    .select()
    .limit(1)
    .eq("name", playerName);

  if (playerData && playerData.length > 0)
    return { success: true, data: playerData[0] };

  const { data, error } = await supabase
    .from("players")
    .upsert({ name: playerName, puntaje: 0 })
    .select();

  if (error) return { success: false, error: new Error(error.message) };

  if (!data)
    return { success: false, error: new Error("Error creating player") };

  const player = data[0];

  if (!player)
    return { success: false, error: new Error("Error creating player") };

  return { success: true, data: player };
};

export default usePlayer;
