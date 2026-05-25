CREATE INDEX IF NOT EXISTS "User_roleId_idx" ON "User"("roleId");
CREATE INDEX IF NOT EXISTS "User_isBanned_idx" ON "User"("isBanned");
CREATE INDEX IF NOT EXISTS "User_createdAt_idx" ON "User"("createdAt");
CREATE INDEX IF NOT EXISTS "CompanyInvite_companyId_email_idx" ON "CompanyInvite"("companyId", "email");
CREATE INDEX IF NOT EXISTS "CompanyInvite_acceptedAt_revokedAt_expiresAt_idx" ON "CompanyInvite"("acceptedAt", "revokedAt", "expiresAt");
