import { Axios } from "../utils/Axios";

/**
 * apiObj: { url, method }
 * data: request body
 * params: string to append to url (eg: "/:id" or "?q=xx")
 */
export const callApi = async (apiObj, data = {}, params = "") => {
  try {
    const res = await Axios({
      method: apiObj.method,
      url: `${apiObj.url}${params}`,
      data
    });
    return res.data;
  } catch (err) {
    // normalize error
    const payload = err?.response?.data || { msg: err.message || "API error" };
    throw payload;
  }
};
