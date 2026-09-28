import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum PlanTenant {
  FREE = 'FREE',
  PRO = 'PRO',
  ELITE = 'ELITE',
}

@Entity('tenants', { schema: 'public' })
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  nombre: string;

  @Index({ unique: true })
  @Column({ length: 50 })
  slug: string; // ej: "mi-criadero"

  @Index({ unique: true })
  @Column({ name: 'schema_name', length: 63 })
  schemaName: string; // ej: "t_mi_criadero"

  @Column({ name: 'owner_email', length: 150 })
  ownerEmail: string;

  @Column({ name: 'owner_name', length: 100 })
  ownerName: string;

  @Column({
    type: 'enum',
    enum: PlanTenant,
    default: PlanTenant.FREE,
  })
  plan: PlanTenant;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'stripe_customer_id', length: 100, nullable: true })
  stripeCustomerId: string;

  @Column({ name: 'stripe_subscription_id', length: 100, nullable: true })
  stripeSubscriptionId: string;

  @Column({ name: 'max_aves', default: 25 })
  maxAves: number;

  @Column({ name: 'logo_url', length: 500, nullable: true })
  logoUrl: string;

  @Column({ name: 'pais', length: 50, nullable: true })
  pais: string;

  @Column({ name: 'telefono', length: 30, nullable: true })
  telefono: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
