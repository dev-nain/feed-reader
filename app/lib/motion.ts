import type { Variants } from "framer-motion";

/** Parent staggers its children in; keyed remount on layout change replays it. */
export const listContainer: Variants = {
	hidden: {},
	show: { transition: { staggerChildren: 0.035 } },
};

export const listItem: Variants = {
	hidden: { opacity: 0, y: 8 },
	show: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.25, ease: "easeOut" },
	},
};
