-- CreateTable
CREATE TABLE "World" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "schemaVersion" TEXT NOT NULL DEFAULT '0.1.0',
    "version" TEXT NOT NULL,
    "description" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "constantsJson" TEXT NOT NULL DEFAULT '[]',
    "stateRulesJson" TEXT NOT NULL DEFAULT '[]',
    "spineJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "City" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "worldId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "stateSchemaJson" TEXT NOT NULL,
    "initialStateJson" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "City_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PlayerTimeline" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "playerId" TEXT NOT NULL,
    "worldId" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "currentDayId" TEXT NOT NULL,
    "currentSceneId" TEXT NOT NULL,
    "personalFlagsJson" TEXT NOT NULL,
    "unlockedArchiveIds" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PlayerTimeline_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PlayerTimeline_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PlayerTimeline_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Trace" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT,
    "playerTimelineId" TEXT NOT NULL,
    "worldId" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "dayId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "visibility" TEXT NOT NULL,
    "weight" REAL NOT NULL,
    "effectsJson" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Trace_playerTimelineId_fkey" FOREIGN KEY ("playerTimelineId") REFERENCES "PlayerTimeline" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Trace_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Trace_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Trace_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "RuntimeSession" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DailyPulse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT,
    "worldId" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "dayId" TEXT NOT NULL,
    "stateBeforeJson" TEXT NOT NULL,
    "traceIdsJson" TEXT NOT NULL,
    "stateAfterJson" TEXT NOT NULL,
    "selectedVariantIdsJson" TEXT NOT NULL,
    "ruleAuditJson" TEXT NOT NULL DEFAULT '[]',
    "observerReportId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DailyPulse_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DailyPulse_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DailyPulse_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "RuntimeSession" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ObserverReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "worldId" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "dayId" TEXT NOT NULL,
    "pulseId" TEXT,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "traceSummaryJson" TEXT NOT NULL,
    "stateDeltaSummaryJson" TEXT NOT NULL,
    "selectedVariantSummaryJson" TEXT NOT NULL,
    "ruleAuditSummaryJson" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ObserverReport_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ObserverReport_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ObserverReport_pulseId_fkey" FOREIGN KEY ("pulseId") REFERENCES "DailyPulse" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RuntimeSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "worldId" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "currentDayId" TEXT NOT NULL,
    "timelineIdsJson" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RuntimeSession_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RuntimeSession_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ObserverReport_pulseId_key" ON "ObserverReport"("pulseId");
