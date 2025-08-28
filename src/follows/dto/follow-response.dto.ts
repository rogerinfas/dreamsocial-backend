export class FollowResponseDto {
  id: string;

  followerId: string;

  followingId: string;

  createdAt: Date;
}

export class FollowUserDto {
  id: string;

  email: string;

  profile: any;
}

export class FollowWithUserDto {
  id: string;

  followerId: string;

  followingId: string;

  createdAt: Date;

  follower: FollowUserDto;

  following: FollowUserDto;
}

export class FollowStatsDto {
  followersCount: number;

  followingCount: number;

  isFollowing: boolean;
}

export class FollowListResponseDto {
  users: FollowResponseDto[];

  total: number;

  page: number;

  limit: number;
}

export class FollowListWithUsersResponseDto {
  users: FollowWithUserDto[];

  total: number;

  page: number;

  limit: number;
}
