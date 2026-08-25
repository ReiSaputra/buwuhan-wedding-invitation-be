import type { User } from "../../generated/prisma/client";

interface SignUpReq {
  fullName: string;
  email: string;
  password: string;
}

interface SignInReq {
  email: string;
  password: string;
}

interface RefreshTokenReq {
  refreshToken: string;
}

interface LogoutReq {
  refreshToken: string;
}

interface RequestMeta {
  userAgent?: string | undefined;
  ipAddress?: string | undefined;
}

interface SignUpRes {
  message: string;
  status: number;
  data: {
    id: string;
    fullName: string;
    email: string;
  };
}

interface SignInRes {
  message: string;
  status: number;
  data: {
    id: string;
    fullName: string;
    email: string;
    accessToken: string;
    refreshToken: string;
  };
}

interface RefreshTokenRes {
  message: string;
  status: number;
  data: {
    accessToken: string;
    refreshToken: string;
  };
}

interface LogoutRes {
  message: string;
  status: number;
}

function signUpResponse(user: User) {
  return {
    message: "User created successfully",
    status: 201,
    data: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
    },
  };
}

function signInResponse(user: User, accessToken: string, refreshToken: string) {
  return {
    message: "User signed in successfully",
    status: 200,
    data: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      accessToken,
      refreshToken,
    },
  };
}

function refreshTokenResponse(accessToken: string, refreshToken: string) {
  return {
    message: "Token refreshed successfully",
    status: 200,
    data: {
      accessToken,
      refreshToken,
    },
  };
}

function logoutResponse() {
  return {
    message: "Logged out successfully",
    status: 200,
  };
}

export type {
  SignUpReq,
  SignInReq,
  RefreshTokenReq,
  LogoutReq,
  RequestMeta,
  SignUpRes,
  SignInRes,
  RefreshTokenRes,
  LogoutRes,
};
export { signUpResponse, signInResponse, refreshTokenResponse, logoutResponse };