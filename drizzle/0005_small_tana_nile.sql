CREATE TABLE `hostingRenewals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`renewalNumber` varchar(50) NOT NULL,
	`serverId` int NOT NULL,
	`serverName` varchar(120) NOT NULL,
	`customerName` varchar(160) NOT NULL,
	`productName` varchar(120) NOT NULL,
	`amount` int NOT NULL,
	`durationMonths` int NOT NULL DEFAULT 1,
	`renewalStatus` enum('PENDING','PAID','EXPIRED','CANCELLED') NOT NULL DEFAULT 'PENDING',
	`dueAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hostingRenewals_id` PRIMARY KEY(`id`),
	CONSTRAINT `hostingRenewals_renewalNumber_unique` UNIQUE(`renewalNumber`)
);
--> statement-breakpoint
CREATE TABLE `hostingServers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`serverName` varchar(120) NOT NULL,
	`address` varchar(180) NOT NULL,
	`port` int NOT NULL DEFAULT 25565,
	`version` varchar(40) NOT NULL DEFAULT '1.21',
	`serverStatus` enum('ONLINE','OFFLINE','MAINTENANCE') NOT NULL DEFAULT 'OFFLINE',
	`playersOnline` int NOT NULL DEFAULT 0,
	`maxPlayers` int NOT NULL DEFAULT 20,
	`productName` varchar(120) NOT NULL,
	`customerName` varchar(160) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`lastCheckedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hostingServers_id` PRIMARY KEY(`id`)
);
