import { useState } from "react";
import supabase from "../supabase";
import { Database } from "../supabase/schema";

export type PlayerRow = Database["public"]["Tables"]["players"]["Row"];

const usePlayer = (playerName: string) => {
  const [player, setPlayer] = useState<PlayerRow | undefined>(undefined);

  const localPlayer = localStorage.getItem("player");

  if (localPlayer) setPlayer(JSON.parse(localPlayer));

  return { player };
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
