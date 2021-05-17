import {
  fetchAll,
  newPost,
  updatePostRequest,
  removePostRequest,
  addPostReactionRequest,
  removePostReactionRequest,
} from "../../api/post";
import { login, register } from "../../api/user";
import { newComment } from "../../api/comment";
import { suspendPostRequest } from "../../api/admin";
export const loginAction = (payload, history) => async (dispatch) => {
  try {
    const user = await login(payload);
    localStorage.setItem("currentUser", JSON.stringify(user));
    dispatch({ type: "LOGIN", payload: user });
    history.push("/");
  } catch (error) {
    alert(error);
  }
};

export const registerAction = (payload) => async (dispatch) => {
  try {
    console.log(payload);
    const user = await register(payload);
    dispatch({ type: "REGISTER", payload: user });
    alert("Success, can login now");
  } catch (error) {}
};

export const logOut = () => (dispatch) => {
  localStorage.removeItem("currentUser");
  dispatch({ type: "LOGOUT" });
  window.location.reload();
};

export const fetchPosts = () => async (dispatch) => {
  try {
    const posts = await fetchAll();
    console.log("POSTS", posts);
    dispatch({ type: "FETCH_ALL", payload: posts });
  } catch (error) {
    alert(error);
  }
};

export const createPost = (data) => async (dispatch) => {
  try {
    const post = await newPost(data);
    dispatch({ type: "NEW_POST", payload: post });
    dispatch({ type: "CREATED", payload: "Post was created successfully" });
  } catch (error) {
    alert(error);
  }
};

export const updatePost = (data, id) => async (dispatch) => {
  try {
    const post = await updatePostRequest(data, id);
    dispatch({ type: "UPDATE", payload: post });
  } catch (error) {
    alert(error);
  }
};
export const removePost = (id) => async (dispatch) => {
  try {
    await removePostRequest(id);
    dispatch({ type: "REMOVE_POST", payload: id });
    dispatch({ type: "REMOVED", payload: "Post removed succesfully" });
  } catch (error) {
    alert(error);
  }
};

export const addComent = (content, id) => async (dispatch) => {
  try {
    const post = await newComment(content, id);
    dispatch({ type: "UPDATE", payload: post });
  } catch (error) {}
};

export const addReaction = (data) => async (dispatch) => {
  try {
    const react = await addPostReactionRequest(data);
    dispatch({ type: "ADD_REACTION", payload: react });
  } catch (error) {
    alert(error);
  }
};

export const removeReaction = (id, postId) => async (dispatch) => {
  try {
    await removePostReactionRequest(id);

    dispatch({ type: "REMOVE_REACTION", payload: { id, postId } });
  } catch (error) {
    alert(error);
  }
};

export const suspendPost = (data) => async (dispatch) => {
  try {
    await suspendPostRequest(data);
    dispatch({ type: "SUSPEND_POST", payload: data.postId });
  } catch (error) {
    alert(error);
  }
};
