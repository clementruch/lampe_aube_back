import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Device } from './device.entity';
import { User } from './user.entity';

@Entity('alarms')
export class Alarm {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ManyToOne(() => User, { eager: true })
  owner: User;

  @ManyToOne(() => Device, (d) => d.alarms, {
    onDelete: 'CASCADE',
    nullable: true,
    eager: true,
  })
  device: Device | null;

  @Column('int') hour: number; // 0..23
  @Column('int') minute: number; // 0..59
  @Column({ type: 'simple-array', default: '' })
  days: number[];

  @Column('int', { default: 15 }) durationMinutes: number;
  @Column({ default: true }) enabled: boolean;

  @Column({ default: false }) sunrise: boolean;
  @Column({ type: 'varchar', length: 100, nullable: true })
  label: string | null;

  @CreateDateColumn() createdAt: Date;
  @Column({ type: 'datetime', nullable: true }) lastTriggeredAt: Date | null;
}
