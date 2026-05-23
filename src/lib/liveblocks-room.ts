const ROOM_PARAM = "room";
const GUEST_PROFILE_KEY = "fridgeboard-liveblocks-guest";

const GUEST_COLORS = [
  "#d9868c",
  "#efc068",
  "#81a59f",
  "#8ea4d6",
  "#c96f5c",
  "#8b6850",
];

export type GuestProfile = {
  color: string;
  name: string;
};

export function getLiveblocksPublicKey() {
  return import.meta.env.VITE_LIVEBLOCKS_PUBLIC_KEY?.trim() ?? "";
}

export function isLiveblocksEnabled() {
  return Boolean(getLiveblocksPublicKey());
}

export function createRoomId() {
  return `fridgeboard-${crypto.randomUUID()}`;
}

export function getRoomIdFromUrl() {
  const url = new URL(window.location.href);
  return url.searchParams.get(ROOM_PARAM);
}

export function setRoomIdInUrl(roomId: string) {
  const url = new URL(window.location.href);
  url.searchParams.set(ROOM_PARAM, roomId);
  window.history.replaceState({}, "", url);
}

export function getGuestProfile() {
  const storedProfile = window.localStorage.getItem(GUEST_PROFILE_KEY);

  if (storedProfile) {
    try {
      const parsed = JSON.parse(storedProfile) as Partial<GuestProfile>;

      if (parsed.name && parsed.color) {
        return parsed as GuestProfile;
      }
    } catch {
      window.localStorage.removeItem(GUEST_PROFILE_KEY);
    }
  }

  const profile = {
    color: GUEST_COLORS[Math.floor(Math.random() * GUEST_COLORS.length)],
    name: `Guest ${Math.floor(100 + Math.random() * 900)}`,
  } satisfies GuestProfile;

  window.localStorage.setItem(GUEST_PROFILE_KEY, JSON.stringify(profile));
  return profile;
}
