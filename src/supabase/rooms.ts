import { atom } from "jotai";
import supabase from ".";

export type Room = {
  id: string;
  name: string;
  created_at: string;
};

const roomAtom = atom<Room | null>(null);

const getOrCreateRoom = async (room: string) => {
  const { data } = await supabase
    .from("rooms")
    .select("*")
    .eq("name", room)
    .single();

  if (data) {
    return data;
  }

  const newRoom = await supabase.from("rooms").insert({
    name: room,
  });

  return newRoom;
};
