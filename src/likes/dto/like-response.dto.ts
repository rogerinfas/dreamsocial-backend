import { User } from '../../users/entities/user.entity';
import { Post } from '../../posts/entities/post.entity';

export class LikeResponseDto {
  id: string;
  user: User;
  post: Post;
  createdAt: Date;
}

export class LikeCountDto {
  postId: string;
  likeCount: number;
  isLikedByUser: boolean;
}
