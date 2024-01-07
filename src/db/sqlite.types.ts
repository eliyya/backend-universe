export type dbRegisters = {
    'id': number
    'created_at': string
    'email': string
    'password': string
    'user_id': number | null
}

export type dbUsers = {
    'id': number
    'username': string
    'displayname': string | null
    'avatar': string | null
}

export type dbClasses = {
    'id': number
    'created_at': string
    'name': string
    'subject': string
    'teacher_id': number
    'icon': string | null
    'description': string | null
}

export type dbClassMembers = {
    'class_id': number
    'user_id': number
}

export type dbClassGroups = {
    'class_id': number
    'group_id': number
}

export type dbGroupMembers = {
    'group_id': number
    'user_id': number
}

export type dbGroups = {
    'id': number
    'created_at': string
    'owner_id': number
    'name': string
    'icon': string | null
    'description': string | null
}
