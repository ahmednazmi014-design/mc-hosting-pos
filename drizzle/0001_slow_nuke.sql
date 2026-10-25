CREATE TABLE `contactMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerName` varchar(160) NOT NULL,
	`phone` varchar(40),
	`email` varchar(320),
	`message` text NOT NULL,
	`contactStatus` enum('NEW','READ','CLOSED') NOT NULL DEFAULT 'NEW',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contactMessages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customOrderRequests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`requestNumber` varchar(50) NOT NULL,
	`customerName` varchar(160) NOT NULL,
	`phone` varchar(40) NOT NULL,
	`email` varchar(320),
	`companyName` varchar(180),
	`orderType` varchar(80) NOT NULL,
	`productsRequired` text NOT NULL,
	`estimatedQuantity` varchar(100) NOT NULL,
	`preferredDeliveryDate` varchar(40),
	`deliveryArea` varchar(180) NOT NULL,
	`additionalRequirements` text,
	`customStatus` enum('NEW','REVIEWING','QUOTED','CONFIRMED','COMPLETED','CANCELLED') NOT NULL DEFAULT 'NEW',
	`customNotificationStatus` enum('PENDING','SENT','FAILED') NOT NULL DEFAULT 'PENDING',
	`notificationError` text,
	`idempotencyKey` varchar(100) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customOrderRequests_id` PRIMARY KEY(`id`),
	CONSTRAINT `customOrderRequests_requestNumber_unique` UNIQUE(`requestNumber`),
	CONSTRAINT `customOrderRequests_idempotencyKey_unique` UNIQUE(`idempotencyKey`)
);
--> statement-breakpoint
CREATE TABLE `orderItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`productId` int,
	`productName` varchar(180) NOT NULL,
	`packSize` varchar(60) NOT NULL,
	`unitPrice` int NOT NULL,
	`quantity` int NOT NULL,
	`lineTotal` int NOT NULL,
	CONSTRAINT `orderItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderNumber` varchar(40) NOT NULL,
	`customerName` varchar(160) NOT NULL,
	`phone` varchar(40) NOT NULL,
	`email` varchar(320),
	`address` text NOT NULL,
	`areaCity` varchar(160) NOT NULL,
	`notes` text,
	`subtotal` int NOT NULL,
	`deliveryFee` int NOT NULL,
	`total` int NOT NULL,
	`paymentMethod` varchar(50) NOT NULL,
	`status` enum('NEW','CONFIRMED','PROCESSING','READY','OUT_FOR_DELIVERY','COMPLETED','CANCELLED') NOT NULL DEFAULT 'NEW',
	`notificationStatus` enum('PENDING','SENT','FAILED') NOT NULL DEFAULT 'PENDING',
	`notificationError` text,
	`idempotencyKey` varchar(100) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_orderNumber_unique` UNIQUE(`orderNumber`),
	CONSTRAINT `orders_idempotencyKey_unique` UNIQUE(`idempotencyKey`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(140) NOT NULL,
	`name` varchar(180) NOT NULL,
	`category` varchar(80) NOT NULL,
	`description` text NOT NULL,
	`imageUrl` text NOT NULL,
	`price` int NOT NULL,
	`packSize` varchar(60) NOT NULL,
	`available` boolean NOT NULL DEFAULT true,
	`featured` boolean NOT NULL DEFAULT false,
	`popularity` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_slug_unique` UNIQUE(`slug`)
);
