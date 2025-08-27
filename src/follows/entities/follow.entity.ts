import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('follows')
@Unique(['follower', 'following']) // Un usuario solo puede seguir a otro una vez
@Index(['follower']) // Índice para consultas por seguidor
@Index(['following']) // Índice para consultas por seguido
export class Follow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'follower_id' })
  follower: User; // Usuario que sigue

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'following_id' })
  following: User; // Usuario que es seguido

  @CreateDateColumn()
  createdAt: Date;
}
