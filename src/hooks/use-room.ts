const useRoom = (name: string) => {
    const normalizedName = normalizeRoomName(name)
    return { name: normalizedName }
};

export const normalizeRoomName = (value: string) => {
    return value.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
};

export default useRoom;
