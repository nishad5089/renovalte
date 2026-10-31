interface Props {
  name:
    | "dashboard"
    | "new"
    | "proposal"
    | "projects"
    | "euro"
    | "sparkles"
    | "send"
    | "chevron"
    | "pin"
    | "menu"
    | "close"
    | "logout"
    | "home"
    | "settings"
    | "more"
    | "image"
    | "mic"
    | "stop";
  size?: number;
}
const paths: Record<Props["name"], string> = {
  more: "M5 11a1 1 0 1 0 0 2a1 1 0 0 0 0-2 M12 11a1 1 0 1 0 0 2a1 1 0 0 0 0-2 M19 11a1 1 0 1 0 0 2a1 1 0 0 0 0-2",
  image:
    "M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z M3 16l6-6 12 11 M14 14l3-3 4 4 M16 7h.01",
  mic: "M9 5a3 3 0 0 1 6 0v7a3 3 0 0 1-6 0z M5 10v2a7 7 0 0 0 14 0v-2 M12 19v3 M8 22h8",
  stop: "M6 6h12v12H6z",
  settings:
    "M9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0",
  dashboard: "M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z",
  new: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M12 12v6 M9 15h6",
  proposal:
    "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M8 13h8 M8 17h5",
  projects:
    "M3 7V5a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z M7 10v6 M12 12v4 M17 9v7",
  euro: "M19 5a7 7 0 1 0 0 14 M4 10h11 M4 14h10",
  sparkles:
    "M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z M20 2v4 M18 4h4",
  send: "M22 2L9 15 M22 2l-8 20-5-7-7-5z",
  chevron: "M9 6l6 6-6 6",
  pin: "M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0z M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0",
  menu: "M4 6h16 M4 12h16 M4 18h16",
  close: "M6 6l12 12 M6 18L18 6",
  logout: "M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4 M14 8l5 4-5 4 M19 12H9",
  home: "M3 10l9-7 9 7 M5 9v12h14V9 M9 21v-8h6v8",
};
export function WorkspaceIcon({ name, size = 20 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
