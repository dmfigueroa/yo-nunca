import { useEffect, useState } from "react";
import supabase from "../supabase";
import { Database } from "../supabase/schema";

const roomSelect = `
  name,
  host,
  round,
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

type RoomRowWithPlayers = NonNullable<
  Awaited<ReturnType<typeof getRoomFromDB>>["data"]
>[0];

type RoomRow = Database["public"]["Tables"]["rooms"]["Row"];

export const useRoom = (name: string) => {
  const normalizedName = normalizeRoomName(name);
  const [error, setError] = useState("");
  const [room, setData] = useState<RoomRow | undefined>(undefined);

  useEffect(() => {
    supabase
      .from("rooms")
      .select()
      .eq("name", normalizedName)
      .limit(1)
      .then((response) => {
        if (response.error) {
          return setError(response.error.message);
        }
        if (!response.data) {
          return setError("No data found");
        }
        setData(response.data[0]);
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
          table: "rooms",
          filter: `name=eq.${normalizedName}`,
        },
        (payload) => {
          if (payload.errors && payload.errors.length > 0)
            return setError(payload.errors[0]);

          setData((room) => {
            if (!room) return undefined;

            return {
              ...room,
              round: Number(payload.new.round) || 1,
            };
          });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [normalizedName]);

  const nextRound = async () => {
    if (!room) return;

    await supabase
      .from("rooms")
      .update({ round: (room.round || 1) + 1 })
      .eq("name", room.name);
  };

  return { name: normalizedName, room, error, nextRound };
};

export const normalizeRoomName = (value: string) => {
  return value
    .trim()
    .replace(/[^a-zA-Z0-9]/g, "-")
    .toLowerCase();
};

export const denormalizeRoomName = (value = "") => {
  return value.replace(/-/g, " ");
};

export const getOrCreateRoom = async (
  name: string,
  playerId?: number
): Promise<Result<RoomRowWithPlayers, Error>> => {
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
): Promise<Result<RoomRowWithPlayers, Error>> => {
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
