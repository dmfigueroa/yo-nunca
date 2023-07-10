import supabase from "../supabase";
import { Database } from "../supabase/schema";

const useRoom = async (name: string) => {
  const normalizedName = normalizeRoomName(name);

  const roomResult = await getOrCreateRoom(normalizedName);

  return { name: normalizedName, ...roomResult };
};

export const normalizeRoomName = (value: string) => {
  return value.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
};

export const getOrCreateRoom = async (
  name: string
): Promise<Result<Database["public"]["Tables"]["rooms"]["Row"], Error>> => {
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
