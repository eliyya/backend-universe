export interface dbRegisters {
    'id'?: number | null
    'created_at': string
    'email': string
    'password': string
    'user_id'?: number | null
}

export interface dbUsers {
    'id'?: number | null
    'username': string
    'displayname'?: string | null
    'avatar'?: string | null
}

export interface dbClasses {
    'id'?: number | null
    'created_at': string
    'name': string
    'subject': string
    'teacher_id': number
    'icon'?: string | null
    'description'?: string | null
}

export interface dbClassMembers {
    'class_id': number
    'user_id': number
}

export interface dbClassGroups {
    'class_id': number
    'group_id': number
}

export interface dbGroupMembers {
    'group_id': number
    'user_id': number
}

export interface dbGroups {
    'id'?: number | null
    'created_at': string
    'owner_id': number
    'name': string
    'icon'?: string | null
    'description'?: string | null
}

