import { useEffect, useState } from "react";
import supabase from "../supabase";
import { Database } from "../supabase/schema";

type RoomRow = Database["public"]["Tables"]["rooms"]["Row"];

const useRoom = (name: string) => {
  const normalizedName = normalizeRoomName(name);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [data, setData] = useState<RoomRow | undefined>(undefined);

  useEffect(() => {
    getOrCreateRoom(normalizedName).then((result) => {
      if (result.success) {
        setError(undefined);
        setData(result.data);
      } else {
        setData(undefined);
        setError(result.error);
      }
    });
  }, [normalizedName]);

  return { name: normalizedName, data, error };
};

export const normalizeRoomName = (value: string) => {
  return value.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
};

export const getOrCreateRoom = async (
  name: string
): Promise<Result<RoomRow, Error>> => {
  const normalizedName = normalizeRoomName(name);

  const { data, error } = await supabase
    .from("rooms")
    .select()
    .eq("name", normalizedName)
    .limit(1);

  if (error) return { success: false, error: new Error(error.message) };

  const room = data[0];

  if (!room) return { success: false, error: new Error("No room found") };

  return { success: true, data: room };
};

export default useRoom;
