import db from '@db/sqlite.ts'
// import { hash } from '@utils/hash.ts'

// const f = db.sql`
//     insert into groups (
//         name,
//         description,
//         owner_id
//         )
//     values (
//         'test',
//         'test description',
//         1
//     ) returning *`
// console.log(f)

// const v = db.sql`
//     insert into registers (
//         email,
//         password
//         )
//     values (
//         ${'kanna@kobayashi.com'},
//         ${await hash('password')}
//     ) returning *`

// const v = db.sql`
//     insert into users (
//         username
//         )
//     values (
//         'kanna'
//     ) returning *`

// const v = db.sql`
//     UPDATE registers
//     SET user_id = 2
//     WHERE id = 2
//     RETURNING *`

// const i = db.sql`
//     insert into group_members (
//         group_id,
//         user_id
//         )
//     values (
//         2,
//         3
//     ) returning *`

// console.log(i)

// const v = db.sql`
//     insert into users (
//         username
//         )
//     values (
//         'Bocchi'
//     ) returning *`

// const v = db.sql`
//     insert into registers (
//         email,
//         password,
//         user_id
//         )
//     values (
//         ${'bocchi@therock.com'},
//         ${await hash('password')},
//         3
//     ) returning *`

// const v = db.sql`
//     select *
//     from group_members`

// get * from groups and join group_members to get member_ids
// const v = db.sql`
//     select groups.*, json_group_array(group_members.user_id) as member_ids
//     from groups
//     left join group_members
//     on groups.id = group_members.group_id
//     where groups.id = 1`

// const v = db.sql`
//     delete from groups
//     where id = 1`

// console.log(v)

// const m = db.sql`
//     select *
//     from users`

// const m = db.sql`
//     select *
//     from group_members`

const user_id = 2

const m = db.sql`
    select 
        groups.*, 
        json_group_array(group_members.user_id) 
            as member_ids
    from groups
    left join group_members
    on groups.id = group_members.group_id
    where group_members.user_id = ${user_id}
    or groups.owner_id = ${user_id}`

console.log(user_id, m)
