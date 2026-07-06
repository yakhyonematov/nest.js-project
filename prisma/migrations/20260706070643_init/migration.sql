-- CreateTable
CREATE TABLE "User2" (
    "id" SERIAL NOT NULL,
    "surname" TEXT NOT NULL,
    "job" TEXT NOT NULL,
    "country" TEXT NOT NULL,

    CONSTRAINT "User2_pkey" PRIMARY KEY ("id")
);
