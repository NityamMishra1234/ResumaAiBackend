
import { Session } from "../../sessions/entity/sessions.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('users')
export class User{
    @PrimaryGeneratedColumn('uuid')
    id : string;

    @Column()
    name: string;

    @Column()
    email : string;

    @Column()
    password : string;

    @OneToMany(()=> Session , (session)=> session.user)
    sessions : Session[]

    @CreateDateColumn()
    createdAt : Date;

    @UpdateDateColumn()
    updatedAt : Date;
    
}