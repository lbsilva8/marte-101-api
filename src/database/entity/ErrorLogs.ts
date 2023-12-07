import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn
} from 'typeorm';

@Entity()
export class ErrorLogs extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  errorDate: Date;

  @Column()
  errorRoute: string;

  @Column()
  errorDescription: string;
}
