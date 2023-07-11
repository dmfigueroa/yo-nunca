import { useEffect, useState } from "react";
import supabase from "../supabase";

const roomSelect = `
  name,
  host,
  players!players_room_name_fkey (
      id,
      name,
      puntaje
  )
`;

const getRoomFromDB = async (name: string) => {
  return await supabase
    .from("rooms")
    .select(roomSelect)
    .eq("name", name)
    .limit(1);
};

type RoomRow = NonNullable<
  Awaited<ReturnType<typeof getRoomFromDB>>["data"]
>[0];

const useRoom = (name: string) => {
  const normalizedName = normalizeRoomName(name);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [data, setData] = useState<RoomRow | undefined>(undefined);

  return { name: normalizedName, data, error };
};

export const normalizeRoomName = (value: string) => {
  return value
    .trim()
    .replace(/[^a-zA-Z0-9]/g, "-")
    .toLowerCase();
};

export const getOrCreateRoom = async (
  name: string,
  playerId?: number
): Promise<Result<RoomRow, Error>> => {
  const normalizedName = normalizeRoomName(name);

  let { data, error } = await getRoomFromDB(normalizedName);

  if (error) return { success: false, error: new Error(error.message) };

  let room = data?.[0];

  if (!room) {
    if (!playerId) {
      return { success: false, error: new Error("No player given") };
    }

    const result = await createRoom(normalizedName, playerId);

    if (result.success) {
      room = result.data;
    } else {
      return result;
    }
  }

  if (playerId) {
    const { error: playerError } = await supabase
      .from("players")
      .update({
        room_name: room.name,
      })
      .eq("id", playerId);
  }

  return { success: true, data: room };
};

const createRoom = async (
  name: string,
  playerId: number
): Promise<Result<RoomRow, Error>> => {
  const { data: createdData, error: createError } = await supabase
    .from("rooms")
    .insert({
      name: name,
      host: playerId,
    })
    .select(roomSelect);

  if (createError)
    return { success: false, error: new Error(createError.message) };

  if (!createdData)
    return { success: false, error: new Error("Error creating room") };

  const room = createdData[0];

  if (!room) return { success: false, error: new Error("Error creating room") };

  return getOrCreateRoom(name);
};

export default useRoom;
