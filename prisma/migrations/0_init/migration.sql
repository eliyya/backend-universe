-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "universe";

-- CreateTable
CREATE TABLE "universe"."users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "displayname" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "universe"."registers" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "user_id" TEXT,

    CONSTRAINT "registers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "universe"."groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "owner_id" TEXT NOT NULL,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "universe"."groups_users" (
    "group_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "groups_users_pkey" PRIMARY KEY ("group_id","user_id")
);

-- CreateTable
CREATE TABLE "universe"."classes" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT,
    "teacher_id" TEXT NOT NULL,

    CONSTRAINT "classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "universe"."classes_groups" (
    "class_id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,

    CONSTRAINT "classes_groups_pkey" PRIMARY KEY ("class_id","group_id")
);

-- CreateTable
CREATE TABLE "universe"."classes_users" (
    "class_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "classes_users_pkey" PRIMARY KEY ("class_id","user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "universe"."users"("username");

-- AddForeignKey
ALTER TABLE "universe"."registers" ADD CONSTRAINT "registers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "universe"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "universe"."groups" ADD CONSTRAINT "groups_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "universe"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "universe"."groups_users" ADD CONSTRAINT "groups_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "universe"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "universe"."groups_users" ADD CONSTRAINT "groups_users_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "universe"."groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "universe"."classes" ADD CONSTRAINT "classes_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "universe"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "universe"."classes_groups" ADD CONSTRAINT "classes_groups_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "universe"."classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "universe"."classes_groups" ADD CONSTRAINT "classes_groups_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "universe"."groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "universe"."classes_users" ADD CONSTRAINT "classes_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "universe"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "universe"."classes_users" ADD CONSTRAINT "classes_users_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "universe"."classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

