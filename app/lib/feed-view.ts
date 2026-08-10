import { useSearchParams } from "react-router";
import type { FeedItem } from "./mock-feed";

/*
 * Transient view state for the feed column, held in the URL rather than a cookie
 * (which is where the durable layout preference lives). A filtered view is then
 * shareable, survives reload under SSR, and needs no resource route.
 *
 * Search params are user-editable input: every value is guarded, and anything
 * unrecognised falls back to the default instead of throwing.
 */

export type FeedFilter = "unread" | "starred";
export type FeedOrder = "newest" | "oldest";
export type FeedTimestamp = "relative" | "absolute";

export interface FeedView {
	filters: FeedFilter[];
	order: FeedOrder;
	timestamp: FeedTimestamp;
}

export const DEFAULT_VIEW: FeedView = {
	filters: [],
	order: "newest",
	timestamp: "relative",
};

const PARAM = { filter: "filter", order: "order", time: "time" } as const;

function isFilter(value: string): value is FeedFilter {
	return value === "unread" || value === "starred";
}

function isOrder(value: unknown): value is FeedOrder {
	return value === "newest" || value === "oldest";
}

function isTimestamp(value: unknown): value is FeedTimestamp {
	return value === "relative" || value === "absolute";
}

export function parseFeedView(params: URLSearchParams): FeedView {
	const raw = params.get(PARAM.filter)?.split(",") ?? [];
	const order = params.get(PARAM.order);
	const timestamp = params.get(PARAM.time);

	return {
		// Dedupe so `?filter=unread,unread` cannot double-apply.
		filters: [...new Set(raw.filter(isFilter))],
		order: isOrder(order) ? order : DEFAULT_VIEW.order,
		timestamp: isTimestamp(timestamp) ? timestamp : DEFAULT_VIEW.timestamp,
	};
}

/** Filter then sort. Never mutates `items`. */
export function applyFeedView(items: FeedItem[], view: FeedView): FeedItem[] {
	const filtered = view.filters.length
		? items.filter(
				(item) =>
					// Multiple filters combine with AND.
					(!view.filters.includes("unread") || !item.read) &&
					(!view.filters.includes("starred") || item.starred),
			)
		: items;

	// Copy before sorting: `feedItems` is module-level and must not be mutated.
	// (`toSorted` would need lib ES2023 and drops Safari < 16.4 for no gain.)
	return [...filtered].sort((a, b) =>
		view.order === "oldest"
			? a.iso.localeCompare(b.iso)
			: b.iso.localeCompare(a.iso),
	);
}

/**
 * Current view plus a setter that preserves unrelated params and drops any value
 * equal to its default, so an untouched view leaves a clean URL.
 */
export function useFeedView(): [FeedView, (next: Partial<FeedView>) => void] {
	const [params, setParams] = useSearchParams();
	const view = parseFeedView(params);

	function update(next: Partial<FeedView>) {
		const merged = { ...view, ...next };
		const draft = new URLSearchParams(params);

		if (merged.filters.length)
			draft.set(PARAM.filter, merged.filters.join(","));
		else draft.delete(PARAM.filter);

		if (merged.order !== DEFAULT_VIEW.order)
			draft.set(PARAM.order, merged.order);
		else draft.delete(PARAM.order);

		if (merged.timestamp !== DEFAULT_VIEW.timestamp)
			draft.set(PARAM.time, merged.timestamp);
		else draft.delete(PARAM.time);

		// `replace` so toggling filters does not fill the history stack — Back
		// should leave the list, not undo six checkbox clicks.
		setParams(draft, { replace: true, preventScrollReset: true });
	}

	return [view, update];
}

export function toggleFilter(
	filters: FeedFilter[],
	filter: FeedFilter,
): FeedFilter[] {
	return filters.includes(filter)
		? filters.filter((f) => f !== filter)
		: [...filters, filter];
}
