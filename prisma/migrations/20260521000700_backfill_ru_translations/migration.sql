-- Backfill default RU translations from existing public text fields.
INSERT INTO "CompanyTranslation" ("id", "companyId", "locale", "name", "description", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, "id", 'RU', "name", "description", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "Company"
ON CONFLICT ("companyId", "locale") DO NOTHING;

INSERT INTO "PostTranslation" ("id", "postId", "locale", "title", "excerpt", "content", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, "id", 'RU', "title", "excerpt", "content", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "Post"
ON CONFLICT ("postId", "locale") DO NOTHING;

INSERT INTO "ProjectTranslation" ("id", "projectId", "locale", "title", "description", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, "id", 'RU', "title", "description", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "Project"
ON CONFLICT ("projectId", "locale") DO NOTHING;

INSERT INTO "ServiceCategoryTranslation" ("id", "categoryId", "locale", "name", "description", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, "id", 'RU', "name", "description", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "ServiceCategory"
ON CONFLICT ("categoryId", "locale") DO NOTHING;

INSERT INTO "ServiceTranslation" ("id", "serviceId", "locale", "title", "description", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, "id", 'RU', "title", "description", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "Service"
ON CONFLICT ("serviceId", "locale") DO NOTHING;

INSERT INTO "AdTranslation" ("id", "adId", "locale", "title", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, "id", 'RU', "title", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "Ad"
ON CONFLICT ("adId", "locale") DO NOTHING;
