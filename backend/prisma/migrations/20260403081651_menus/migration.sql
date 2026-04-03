-- CreateTable
CREATE TABLE "Menus" (
    "id" TEXT NOT NULL,
    "menu_name" TEXT NOT NULL,
    "menu_parent" TEXT,
    "menu_level" INTEGER NOT NULL,
    "menu_order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Menus_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Menus" ADD CONSTRAINT "Menus_menu_parent_fkey" FOREIGN KEY ("menu_parent") REFERENCES "Menus"("id") ON DELETE SET NULL ON UPDATE CASCADE;
