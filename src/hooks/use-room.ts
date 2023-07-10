import { useEffect, useState } from "react";
import supabase from "../supabase";
import { Database } from "../supabase/schema";

type RoomRow = Database["public"]["Tables"]["rooms"]["Row"];

const useRoom = (name: string) => {
  const normalizedName = normalizeRoomName(name);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<RoomRow | null>(null);

  useEffect(() => {
    getOrCreateRoom(normalizedName).then((result) => {
      if (result.success) {
        setError(null);
        setData(result.data);
      } else {
        setData(null);
        setError(result.error);
      }
    });
  }, [normalizedName]);

  return { name: normalizedName, data, error };
};

export const normalizeRoomName = (value: string) => {
  return value.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
};

export const getOrCreateRoom: (
  name: string
) => Promise<Result<RoomRow, Error>> = async (name: string) => {
  const normalizedName = normalizeRoomName(name);

  const { data: room, error } = await supabase
    .from("rooms")
    .select()
    .eq("name", normalizedName)
    .limit(1);

  if (error) {
    return { success: false, error: new Error(error.message) };
  }

  if (!room[0]) {
    return { success: false, error: new Error("No room found") };
  }

  return { success: true, data: room[0] };
};

export default useRoom;
