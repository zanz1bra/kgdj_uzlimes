const SUPABASE_URL = "https://vshfjwueojruorxkltyu.supabase.co";
const SUPABASE_KEY = "sb_publishable_has7Gz7VgorBjFV9PAH2jQ_F7caqPav"; // same key the page already uses

export default async () => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/points?select=id&limit=1`, {
    headers: { apikey: SUPABASE_KEY },
  });
  console.log("Supabase ping:", res.status);
};

export const config = { schedule: "0 8 * * 1,4" }; // Mondays and Thursdays, 08:00 UTC