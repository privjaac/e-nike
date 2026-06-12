CREATE TABLE `order_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_id` integer NOT NULL,
	`sku_id` integer NOT NULL,
	`product_id` integer NOT NULL,
	`product_name` text NOT NULL,
	`sku_code` text NOT NULL,
	`size` text NOT NULL,
	`color` text NOT NULL,
	`quantity` integer NOT NULL,
	`unit_price` real NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer,
	`order_number` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`total_amount` real NOT NULL,
	`shipping_address` text,
	`fulfillment_node_id` integer,
	`estimated_delivery` text,
	`guest_token_hash` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_orders`("id", "user_id", "order_number", "status", "total_amount", "shipping_address", "fulfillment_node_id", "estimated_delivery", "guest_token_hash", "created_at") SELECT "id", "user_id", "order_number", "status", "total_amount", "shipping_address", "fulfillment_node_id", "estimated_delivery", NULL, "created_at" FROM `orders`;--> statement-breakpoint
DROP TABLE `orders`;--> statement-breakpoint
ALTER TABLE `__new_orders` RENAME TO `orders`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `orders_order_number_unique` ON `orders` (`order_number`);