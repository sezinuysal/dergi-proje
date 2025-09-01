/*
  Warnings:

  - You are about to drop the column `fileKey` on the `Flipbook` table. All the data in the column will be lost.
  - You are about to drop the column `is_public` on the `Flipbook` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Flipbook` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `assetKey` to the `Flipbook` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pageCount` to the `Flipbook` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Flipbook` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Flipbook` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Flipbook` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Flipbook] DROP COLUMN [fileKey],
[is_public];
ALTER TABLE [dbo].[Flipbook] ADD [assetKey] NVARCHAR(500) NOT NULL,
[coverKey] NVARCHAR(500),
[isPublic] BIT NOT NULL CONSTRAINT [Flipbook_isPublic_df] DEFAULT 0,
[pageCount] INT NOT NULL,
[slug] NVARCHAR(200) NOT NULL,
[tokenProtected] BIT NOT NULL CONSTRAINT [Flipbook_tokenProtected_df] DEFAULT 1,
[type] NVARCHAR(10) NOT NULL,
[updated_at] DATETIME2 NOT NULL;

-- CreateTable
CREATE TABLE [dbo].[AccessGrant] (
    [id] INT NOT NULL IDENTITY(1,1),
    [userId] INT NOT NULL,
    [flipbookId] INT NOT NULL,
    [grantedById] INT,
    [grantedAt] DATETIME2 NOT NULL CONSTRAINT [AccessGrant_grantedAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [AccessGrant_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [AccessGrant_userId_flipbookId_key] UNIQUE NONCLUSTERED ([userId],[flipbookId])
);

-- CreateTable
CREATE TABLE [dbo].[ReadingProgress] (
    [id] INT NOT NULL IDENTITY(1,1),
    [userId] INT NOT NULL,
    [flipbookId] INT NOT NULL,
    [lastPage] INT NOT NULL CONSTRAINT [ReadingProgress_lastPage_df] DEFAULT 1,
    [completed] BIT NOT NULL CONSTRAINT [ReadingProgress_completed_df] DEFAULT 0,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [ReadingProgress_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [ReadingProgress_userId_flipbookId_key] UNIQUE NONCLUSTERED ([userId],[flipbookId])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [AccessGrant_flipbookId_idx] ON [dbo].[AccessGrant]([flipbookId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [AccessGrant_userId_idx] ON [dbo].[AccessGrant]([userId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [ReadingProgress_flipbookId_idx] ON [dbo].[ReadingProgress]([flipbookId]);

-- CreateIndex
ALTER TABLE [dbo].[Flipbook] ADD CONSTRAINT [Flipbook_slug_key] UNIQUE NONCLUSTERED ([slug]);

-- AddForeignKey
ALTER TABLE [dbo].[AccessGrant] ADD CONSTRAINT [AccessGrant_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[AccessGrant] ADD CONSTRAINT [AccessGrant_flipbookId_fkey] FOREIGN KEY ([flipbookId]) REFERENCES [dbo].[Flipbook]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[AccessGrant] ADD CONSTRAINT [AccessGrant_grantedById_fkey] FOREIGN KEY ([grantedById]) REFERENCES [dbo].[User]([id]) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ReadingProgress] ADD CONSTRAINT [ReadingProgress_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[ReadingProgress] ADD CONSTRAINT [ReadingProgress_flipbookId_fkey] FOREIGN KEY ([flipbookId]) REFERENCES [dbo].[Flipbook]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
