import { API_SERVER_URL } from "./public-config";

import axios from "axios";

export const fetchContests = async () => {
  const res = await axios.get(`${API_SERVER_URL}/contests`);
  return res.data.contests;
};
