import { useEffect, useReducer } from "react";
import axios from "axios";

const BASE_URL =
  "https://cors-anywhere.herokuapp.com/https://jobs.github.com/positions.json";

const ACTION = {
  MAKE_REQUEST: "make_request",
  GET_DATA: "get_data",
  ERROR: "error",
  UPDATE_HAS_NEXT_PAGE: "update-has-next-page"
};

function reducer(state, action) {
  switch (action.type) {
    case ACTION.MAKE_REQUEST:
      return { loading: true, jobs: [] };
    case ACTION.GET_DATA:
      return { ...state, loading: false, jobs: action.payload.jobs };
    case ACTION.ERROR:
      return { ...state, loading: false, error: action.payload.error };
    case ACTION.UPDATE_HAS_NEXT_PAGE:
      return { ...state, hasNextPage: action.payload.hasNextPage };
    default:
      return state;
  }
}

export default function useFetchJobs(params, page) {
  const [state, dispatch] = useReducer(reducer, { jobs: [], loading: true });
  useEffect(() => {
    const cancelToken1 = axios.CancelToken.source();
    dispatch({ type: ACTION.MAKE_REQUEST });
    axios
      .get(BASE_URL, {
        cancelToken: cancelToken1.token,
        params: { markdown: true, page: page, ...params }
      })
      .then((res) => {
        dispatch({ type: ACTION.GET_DATA, payload: { jobs: res.data } });
      })
      .catch((e) => {
        if (axios.isCancel(e)) return;
        dispatch({ type: ACTION.ERROR, payload: { error: e } });
      });
    const cancelToken2 = axios.CancelToken.source();
    axios
      .get(BASE_URL, {
        cancelToken: cancelToken2.token,
        params: { markdown: true, page: page + 1, ...params }
      })
      .then((res) => {
        dispatch({
          type: ACTION.UPDATE_HAS_GET_DATA,
          payload: { hasNextPage: res.data.length !== 0 }
        });
      })
      .catch((e) => {
        if (axios.isCancel(e)) return;
        dispatch({ type: ACTION.ERROR, payload: { error: e } });
      });
    return () => {
      cancelToken1.cancel();
      cancelToken2.cancel();
    };
  }, [params, page]);

  return state;
}
