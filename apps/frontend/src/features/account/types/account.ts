export interface UpdateUserDTO {
  name?: string;
  email?: string;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
}

export interface AddFriendDTO {
  friendId: number;
}

export interface FriendDTO {
  id: number;
  name: string;
  avatarUrl: string;
}
