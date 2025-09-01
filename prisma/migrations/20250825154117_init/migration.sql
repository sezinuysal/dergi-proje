BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[User] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(100) NOT NULL,
    [email] NVARCHAR(320) NOT NULL,
    [password] NVARCHAR(200) NOT NULL,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [User_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [User_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [User_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[Role] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(50) NOT NULL,
    CONSTRAINT [Role_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Role_name_key] UNIQUE NONCLUSTERED ([name])
);

-- CreateTable
CREATE TABLE [dbo].[UserRole] (
    [id] INT NOT NULL IDENTITY(1,1),
    [userId] INT NOT NULL,
    [roleId] INT NOT NULL,
    CONSTRAINT [UserRole_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [UserRole_userId_roleId_key] UNIQUE NONCLUSTERED ([userId],[roleId])
);

-- CreateTable
CREATE TABLE [dbo].[Article] (
    [id] INT NOT NULL IDENTITY(1,1),
    [title] NVARCHAR(200) NOT NULL,
    [content] NVARCHAR(max) NOT NULL,
    [authorId] INT NOT NULL,
    [status] NVARCHAR(20) NOT NULL CONSTRAINT [Article_status_df] DEFAULT 'draft',
    [created_at] DATETIME2 NOT NULL CONSTRAINT [Article_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Article_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Flipbook] (
    [id] INT NOT NULL IDENTITY(1,1),
    [title] NVARCHAR(200) NOT NULL,
    [fileKey] NVARCHAR(500) NOT NULL,
    [is_public] BIT NOT NULL CONSTRAINT [Flipbook_is_public_df] DEFAULT 0,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [Flipbook_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Flipbook_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[UserRole] ADD CONSTRAINT [UserRole_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[UserRole] ADD CONSTRAINT [UserRole_roleId_fkey] FOREIGN KEY ([roleId]) REFERENCES [dbo].[Role]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Article] ADD CONSTRAINT [Article_authorId_fkey] FOREIGN KEY ([authorId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
