export const baseURL = import.meta.env.VITE_BACKEND ;

export const SummaryApi = {
  // Auth
  register: { url: "/api/auth/register", method: "post" },
  login: { url: "/api/auth/login", method: "post" },
  user_details: { url: "/api/auth/me", method: "get" },
  logout: { url: "/api/auth/logout", method: "get" },

  // Meetings - placeholder endpoints (implement server later)
  create_meeting: { url: "/api/meetings/create", method: "post" },
  join_meeting: { url: "/api/meetings/join", method: "post" },
  
  //chat
  get_history: { url: "/api/chat/history", method: "post" },
};
