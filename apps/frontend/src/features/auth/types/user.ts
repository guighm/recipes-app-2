export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  avatarUrl: string;
}

export interface JwtDTO {
  id: number;
  accessToken: string;
}

export interface UserDTO {
  id: number;
  name: string;
  email: string;
  avatarUrl: string;
  createdAt: string;
}