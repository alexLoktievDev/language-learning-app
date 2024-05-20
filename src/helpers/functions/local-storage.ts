/**
 * Utilities for handling local storage operations related to tokens.
 */
import { AccessTokenType, RefreshTokenType } from "@types";

// Access Token
export const getAccessTokenFromLocalStorage = () =>
  localStorage.getItem("accessToken");

export const setAccessTokenToLocalStorage = (accessToken: AccessTokenType) =>
  localStorage.setItem("accessToken", accessToken);

export const removeAccessTokenFromLocalStorage = () =>
  localStorage.removeItem("accessToken");

// Refresh Token
export const getRefreshTokenFromLocalStorage = () =>
  localStorage.getItem("refreshToken");

export const setRefreshTokenToLocalStorage = (refreshToken: RefreshTokenType) =>
  localStorage.setItem("refreshToken", refreshToken);

export const removeRefreshTokenFromLocalStorage = () =>
  localStorage.removeItem("refreshToken");

// Access Token Expiration
export const setAccessTokenExpiresAtToLocalStorage = (
  expirationTime = "7200",
) => localStorage.setItem("accessTokenExpirationTime", expirationTime);

export const getAccessTokenExpiresAtFromLocalStorage = () =>
  localStorage.getItem("accessTokenExpirationTime");

export const removeAccessTokenExpiresAtFromLocalStorage = () =>
  localStorage.removeItem("accessTokenExpirationTime");
