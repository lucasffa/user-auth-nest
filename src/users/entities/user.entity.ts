// src/users/entities/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate } from 'typeorm';
import { Role } from '../../common/enums/roles.enum';
import * as bcrypt from 'bcrypt';

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    uuid: string;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({
        type: 'enum',
        enum: Role,
    })
    role: Role;

    @Column({ default: true })
    isActive: boolean;

    @Column({ default: false })
    isDeleted: boolean;

    @Column({ type: 'timestamp', nullable: true })
    lastActiveStatusAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    lastDeletionAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    lastLoginAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    lastLogoutAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    lastUpdateAt: Date;

    @BeforeInsert()
    async hashPassword() {
        this.password = await bcrypt.hash(this.password, 10);
    }

    @BeforeUpdate()
    async updateTimestamp() {
        this.lastUpdateAt = new Date();
    }

    async validatePassword(password: string): Promise<boolean> {
        return await bcrypt.compare(password, this.password);
    }

    deactivate() {
        this.isActive = false;
        this.isDeleted = false;
        this.lastActiveStatusAt = new Date();
    }

    activate() {
        this.isActive = true;
        this.isDeleted = false;
        this.lastActiveStatusAt = new Date();
    }

    markAsDeleted() {
        this.isDeleted = true;
        this.deactivate();
        this.lastDeletionAt = new Date();
    }

    setLastLogin() {
        this.lastLoginAt = new Date();
    }

    setLastLogout() {
        this.lastLogoutAt = new Date();
    }
}
