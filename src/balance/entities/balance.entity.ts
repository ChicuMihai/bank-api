import { User } from '../../users/entities/user.entity';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class Balance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('numeric', {
    default: 100.5,
    transformer: {
      to(value) {
        return value;
      },
      from(value) {
        return parseFloat(value);
      },
    },
  })
  amount: number;

  @OneToOne(() => User, (user) => user.balance)
  @JoinColumn()
  user: User;
}
