import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime, r as Slot } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { S as Briefcase, _ as ChevronDown, a as Users, b as CalendarClock, c as Sunrise, d as Pause, f as Moon, g as ChevronLeft, h as ChevronRight, i as UtensilsCrossed, l as Settings, m as CircleDashed, n as Wind, p as Coffee, r as Utensils, s as Trash2, t as X, u as Plus, v as Check, x as CalendarCheck, y as CarFront } from "../_libs/lucide-react.mjs";
import { n as toast, t as Toaster } from "../_libs/sonner.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { a as Tooltip, i as ResponsiveContainer, n as XAxis, r as Bar, t as BarChart } from "../_libs/recharts+[...].mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { a as format, c as eachDayOfInterval, d as isSameDay, f as addWeeks, g as addDays, h as addMonths, i as subDays, l as endOfMonth, m as startOfWeek, n as setHours, o as endOfWeek, p as startOfDay, r as isYesterday, s as startOfMonth, t as setMinutes, u as endOfDay } from "../_libs/date-fns.mjs";
import { n as persist, r as create, t as createJSONStorage } from "../_libs/zustand.mjs";
import { a as DialogOverlay$1, c as DialogTrigger$1, i as DialogDescription$1, n as DialogClose, o as DialogPortal$1, r as DialogContent$1, s as DialogTitle$1, t as Dialog$1 } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { t as Root } from "../_libs/radix-ui__react-label.mjs";
import { a as SelectItemIndicator, c as SelectTrigger$1, i as SelectItem$1, l as SelectValue$1, n as SelectContent$1, o as SelectItemText, r as SelectIcon, s as SelectPortal, t as Select$1, u as SelectViewport } from "../_libs/@radix-ui/react-select+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Dgh_7LjX.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ChartTooltip({ active, payload, label, suffix = "" }) {
	if (!active || !payload?.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg bg-popover px-3 py-2 text-xs shadow-[var(--shadow-border)]",
		children: [label !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "font-medium tabular-nums text-foreground",
			children: [payload[0]?.value, suffix]
		})]
	});
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function uid() {
	if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
	return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
var OPTIONS = [
	{
		id: "day",
		label: "Day"
	},
	{
		id: "week",
		label: "Week"
	},
	{
		id: "month",
		label: "Month"
	}
];
function PeriodToggle({ value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-3 gap-1 rounded-xl bg-secondary p-1",
		children: OPTIONS.map((opt) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: () => onChange(opt.id),
			className: cn("h-9 rounded-lg text-sm font-medium transition-[background-color,color] duration-150", value === opt.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"),
			children: opt.label
		}, opt.id))
	});
}
function Card({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("rounded-2xl bg-card p-4 text-card-foreground shadow-[var(--shadow-border)] sm:p-5", className),
		...props
	});
}
function formatMoney(amount, currency) {
	return new Intl.NumberFormat(void 0, {
		style: "currency",
		currency,
		maximumFractionDigits: 2
	}).format(amount);
}
function formatDuration(totalMinutes) {
	const minutes = Math.max(0, Math.round(totalMinutes));
	if (minutes < 60) return `${minutes}m`;
	const h = Math.floor(minutes / 60);
	const m = minutes % 60;
	if (m === 0) return `${h}h`;
	return `${h}h ${m}m`;
}
function formatTime(at) {
	return format(at, "HH:mm");
}
function formatDayLabel(at, now = Date.now()) {
	const d = new Date(at);
	if (isSameDay(d, now)) return "Today";
	if (isYesterday(d)) return "Yesterday";
	return format(d, "EEE d MMM");
}
function formatRelativeAgo(at, now = Date.now()) {
	const diff = Math.max(0, now - at);
	const minutes = Math.floor(diff / 6e4);
	if (minutes < 1) return "Just now";
	if (minutes < 60) return `${minutes}m ago`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24 && isSameDay(at, now)) {
		const m = minutes % 60;
		return m === 0 ? `${hours}h ago` : `${hours}h ${m}m ago`;
	}
	return `${formatDayLabel(at, now)} ${formatTime(at)}`;
}
function plural(n, one, many = `${one}s`) {
	return n === 1 ? one : many;
}
var CONTEXTS = [
	{
		id: "before_meal",
		label: "Before a meal",
		short: "Meal",
		group: "before",
		icon: UtensilsCrossed
	},
	{
		id: "before_meeting",
		label: "Before a meeting",
		short: "Meeting",
		group: "before",
		icon: CalendarClock
	},
	{
		id: "morning",
		label: "Morning",
		short: "Morning",
		group: "before",
		icon: Sunrise
	},
	{
		id: "commute",
		label: "Commute",
		short: "Commute",
		group: "before",
		icon: CarFront
	},
	{
		id: "after_meal",
		label: "After a meal",
		short: "Meal",
		group: "after",
		icon: Utensils
	},
	{
		id: "after_meeting",
		label: "After a meeting",
		short: "Meeting",
		group: "after",
		icon: CalendarCheck
	},
	{
		id: "night",
		label: "Night",
		short: "Night",
		group: "after",
		icon: Moon
	},
	{
		id: "social",
		label: "Social",
		short: "Social",
		group: "around",
		icon: Users
	},
	{
		id: "coffee",
		label: "With a drink",
		short: "Drink",
		group: "around",
		icon: Coffee
	},
	{
		id: "work_break",
		label: "Work break",
		short: "Work",
		group: "around",
		icon: Briefcase
	},
	{
		id: "stress",
		label: "Stress",
		short: "Stress",
		group: "around",
		icon: Wind
	},
	{
		id: "boredom",
		label: "Boredom",
		short: "Boredom",
		group: "around",
		icon: Pause
	},
	{
		id: "other",
		label: "Other",
		short: "Other",
		group: "around",
		icon: CircleDashed
	}
];
var CONTEXT_BY_ID = Object.fromEntries(CONTEXTS.map((c) => [c.id, c]));
var GROUP_META = {
	before: {
		label: "Before",
		hint: "The run-up"
	},
	after: {
		label: "After",
		hint: "The come-down"
	},
	around: {
		label: "Around",
		hint: "Alongside the day"
	}
};
var GROUP_ORDER = [
	"before",
	"after",
	"around"
];
var WEEK = { weekStartsOn: 1 };
function periodRange(period, anchor) {
	if (period === "day") return {
		start: startOfDay(anchor),
		end: endOfDay(anchor)
	};
	if (period === "week") return {
		start: startOfWeek(anchor, WEEK),
		end: endOfWeek(anchor, WEEK)
	};
	return {
		start: startOfMonth(anchor),
		end: endOfMonth(anchor)
	};
}
function shiftAnchor(period, anchor, direction) {
	if (period === "day") return addDays(anchor, direction);
	if (period === "week") return addWeeks(anchor, direction);
	return addMonths(anchor, direction);
}
function inRange(at, start, end) {
	return at >= start.getTime() && at <= end.getTime();
}
function periodLabel(period, start, end, now = /* @__PURE__ */ new Date()) {
	if (period === "day") {
		if (startOfDay(now).getTime() === start.getTime()) return "Today";
		return format(start, "EEE d MMM");
	}
	if (period === "week") return `${format(start, "d MMM")} – ${format(end, "d MMM")}`;
	return format(start, "MMMM yyyy");
}
function inventoryRemaining(logs, purchases) {
	return purchases.reduce((sum, p) => sum + p.packs * p.cigsPerPack, 0) - logs.length;
}
function costPerCigarette(purchases, fallback) {
	const cigs = purchases.reduce((sum, p) => sum + p.packs * p.cigsPerPack, 0);
	const cost = purchases.reduce((sum, p) => sum + p.cost, 0);
	if (cigs <= 0) return fallback;
	return cost / cigs;
}
/** FIFO: assign each smoke the cost of the pack it came from. */
function assignSmokeCosts(logs, purchases, fallbackPerCig) {
	const map = /* @__PURE__ */ new Map();
	const lots = purchases.slice().sort((a, b) => a.at - b.at).map((p) => ({
		remaining: p.packs * p.cigsPerPack,
		per: p.packs * p.cigsPerPack > 0 ? p.cost / (p.packs * p.cigsPerPack) : fallbackPerCig
	}));
	const ordered = logs.slice().sort((a, b) => a.at - b.at);
	for (const log of ordered) {
		const lot = lots.find((l) => l.remaining > 0);
		if (lot) {
			lot.remaining -= 1;
			map.set(log.id, lot.per);
		} else map.set(log.id, fallbackPerCig);
	}
	return map;
}
function summarizeRange(logs, purchases, settings, start, end) {
	const fallback = settings.cigsPerPack > 0 ? settings.defaultPackCost / settings.cigsPerPack : 0;
	const costs = assignSmokeCosts(logs, purchases, fallback);
	const spanMs = end.getTime() - start.getTime();
	const prevWindow = {
		start: /* @__PURE__ */ new Date(start.getTime() - spanMs - 1),
		end: /* @__PURE__ */ new Date(start.getTime() - 1)
	};
	const inCurrent = logs.filter((l) => inRange(l.at, start, end));
	const inPrev = logs.filter((l) => inRange(l.at, prevWindow.start, prevWindow.end));
	const purchasesCurrent = purchases.filter((p) => inRange(p.at, start, end));
	const purchasesPrev = purchases.filter((p) => inRange(p.at, prevWindow.start, prevWindow.end));
	const burned = inCurrent.reduce((sum, l) => sum + (costs.get(l.id) ?? fallback), 0);
	const prevBurned = inPrev.reduce((sum, l) => sum + (costs.get(l.id) ?? fallback), 0);
	const contextCounts = /* @__PURE__ */ new Map();
	for (const log of inCurrent) contextCounts.set(log.context, (contextCounts.get(log.context) ?? 0) + 1);
	const byContext = [...contextCounts.entries()].map(([id, count]) => ({
		id,
		label: CONTEXT_BY_ID[id].short,
		group: CONTEXT_BY_ID[id].group,
		count
	})).sort((a, b) => b.count - a.count);
	const byGroup = GROUP_ORDER.map((group) => ({
		group,
		count: byContext.filter((c) => c.group === group).reduce((s, c) => s + c.count, 0)
	}));
	const days = eachDayOfInterval({
		start,
		end
	});
	const byDay = days.map((d) => {
		const ds = startOfDay(d);
		const de = endOfDay(d);
		const dayLogs = inCurrent.filter((l) => inRange(l.at, ds, de));
		return {
			key: format(d, "yyyy-MM-dd"),
			label: days.length > 10 ? format(d, "d") : format(d, "EEE"),
			count: dayLogs.length,
			burned: dayLogs.reduce((sum, l) => sum + (costs.get(l.id) ?? fallback), 0)
		};
	});
	const byHour = Array.from({ length: 24 }, (_, hour) => ({
		hour,
		count: inCurrent.filter((l) => new Date(l.at).getHours() === hour).length
	}));
	const weekdayNames = [
		"Sunday",
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday"
	];
	const byWeekday = [
		"Sun",
		"Mon",
		"Tue",
		"Wed",
		"Thu",
		"Fri",
		"Sat"
	].map((label, day) => ({
		day,
		label,
		count: inCurrent.filter((l) => new Date(l.at).getDay() === day).length
	}));
	const mondayFirst = [...byWeekday.slice(1), byWeekday[0]];
	const top = byContext[0];
	const topContext = top ? {
		id: top.id,
		label: CONTEXT_BY_ID[top.id].label,
		count: top.count,
		pct: inCurrent.length > 0 ? Math.round(top.count / inCurrent.length * 100) : 0
	} : null;
	const heaviest = mondayFirst.slice().sort((a, b) => b.count - a.count)[0];
	const heaviestWeekday = heaviest && heaviest.count > 0 ? {
		label: weekdayNames[heaviest.day] ?? heaviest.label,
		count: heaviest.count
	} : null;
	const ordered = inCurrent.slice().sort((a, b) => a.at - b.at);
	let avgGapMinutes = null;
	if (ordered.length >= 2) {
		let gapSum = 0;
		for (let i = 1; i < ordered.length; i += 1) gapSum += (ordered[i].at - ordered[i - 1].at) / 6e4;
		avgGapMinutes = gapSum / (ordered.length - 1);
	}
	return {
		count: inCurrent.length,
		minutes: inCurrent.length * settings.minutesPerCig,
		spent: purchasesCurrent.reduce((s, p) => s + p.cost, 0),
		burned,
		prevCount: inPrev.length,
		prevMinutes: inPrev.length * settings.minutesPerCig,
		prevSpent: purchasesPrev.reduce((s, p) => s + p.cost, 0),
		prevBurned,
		byContext,
		byGroup,
		byDay,
		byHour,
		byWeekday: mondayFirst,
		topContext,
		heaviestWeekday,
		avgGapMinutes
	};
}
function deltaPct(current, previous) {
	if (previous === 0) return current === 0 ? 0 : 100;
	return Math.round((current - previous) / previous * 100);
}
function mulberry32(seed) {
	let a = seed >>> 0;
	return () => {
		a += 1831565813;
		let t = a;
		t = Math.imul(t ^ t >>> 15, t | 1);
		t ^= t + Math.imul(t ^ t >>> 7, t | 61);
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	};
}
function stamp(day, hour, minute) {
	return setMinutes(setHours(day, hour), minute).getTime();
}
var SLOTS = [
	{
		hour: 7,
		minute: 35,
		context: "morning",
		weekday: true,
		chance: .92
	},
	{
		hour: 8,
		minute: 50,
		context: "commute",
		weekday: true,
		chance: .7
	},
	{
		hour: 9,
		minute: 20,
		context: "morning",
		weekend: true,
		chance: .8
	},
	{
		hour: 10,
		minute: 18,
		context: "coffee",
		chance: .78
	},
	{
		hour: 11,
		minute: 5,
		context: "before_meeting",
		weekday: true,
		chance: .35
	},
	{
		hour: 11,
		minute: 40,
		context: "before_meal",
		chance: .28
	},
	{
		hour: 12,
		minute: 42,
		context: "after_meal",
		chance: .9
	},
	{
		hour: 14,
		minute: 10,
		context: "after_meeting",
		weekday: true,
		chance: .4
	},
	{
		hour: 15,
		minute: 22,
		context: "work_break",
		weekday: true,
		chance: .72
	},
	{
		hour: 15,
		minute: 50,
		context: "boredom",
		weekend: true,
		chance: .45
	},
	{
		hour: 16,
		minute: 8,
		context: "stress",
		weekday: true,
		chance: .38
	},
	{
		hour: 17,
		minute: 45,
		context: "commute",
		weekday: true,
		chance: .55
	},
	{
		hour: 18,
		minute: 12,
		context: "social",
		weekend: true,
		chance: .7
	},
	{
		hour: 19,
		minute: 38,
		context: "after_meal",
		chance: .88
	},
	{
		hour: 21,
		minute: 15,
		context: "social",
		weekend: true,
		chance: .65
	},
	{
		hour: 21,
		minute: 48,
		context: "night",
		weekday: true,
		chance: .5
	},
	{
		hour: 22,
		minute: 20,
		context: "night",
		weekend: true,
		chance: .55
	},
	{
		hour: 22,
		minute: 55,
		context: "social",
		weekend: true,
		chance: .4
	}
];
var BRANDS = [
	"Marlboro Gold",
	"Camel Blue",
	"Lucky Strike",
	"Parliament"
];
function createSampleMonth(now = Date.now()) {
	const rand = mulberry32(20260904);
	const logs = [];
	for (let offset = 34; offset >= 0; offset -= 1) {
		const day = startOfDay(subDays(now, offset));
		const weekday = day.getDay();
		const isWeekend = weekday === 0 || weekday === 6;
		for (const slot of SLOTS) {
			if (slot.weekend && !isWeekend) continue;
			if (slot.weekday && isWeekend) continue;
			if (rand() > slot.chance) continue;
			const jitter = Math.floor(rand() * 18) - 8;
			const at = stamp(day, slot.hour, Math.max(0, Math.min(59, slot.minute + jitter)));
			if (at > now - 12e5) continue;
			logs.push({
				id: uid(),
				at,
				context: slot.context
			});
		}
	}
	logs.sort((a, b) => a.at - b.at);
	const cigsPerPack = 20;
	const packsNeeded = Math.ceil((logs.length + 11) / cigsPerPack);
	const span = 34;
	const purchases = [];
	for (let i = 0; i < packsNeeded; i += 1) {
		const dayOffset = Math.round(i / Math.max(packsNeeded - 1, 1) * 33);
		const at = stamp(startOfDay(subDays(now, span - dayOffset)), 9 + Math.floor(rand() * 8), Math.floor(rand() * 50));
		const cost = Math.round((11.4 + rand() * 3.2) * 100) / 100;
		purchases.push({
			id: uid(),
			at: Math.min(at, now - 6e4),
			brand: BRANDS[i % BRANDS.length] ?? "Cigarettes",
			packs: 1,
			cigsPerPack,
			cost
		});
	}
	purchases.sort((a, b) => a.at - b.at);
	return {
		logs,
		purchases
	};
}
var DEFAULT_SETTINGS = {
	currency: "USD",
	cigsPerPack: 20,
	defaultPackCost: 12.5,
	minutesPerCig: 6
};
var emptyStorage = {
	getItem: () => null,
	setItem: () => {},
	removeItem: () => {}
};
var useAshStore = create()(persist((set, get) => ({
	logs: [],
	purchases: [],
	settings: DEFAULT_SETTINGS,
	initialized: false,
	isSample: false,
	ensureSeeded: () => {
		if (get().initialized) return;
		const sample = createSampleMonth();
		set({
			logs: sample.logs,
			purchases: sample.purchases,
			initialized: true,
			isSample: true
		});
	},
	addSmoke: (context) => {
		const log = {
			id: uid(),
			at: Date.now(),
			context
		};
		set((s) => ({ logs: [...s.logs, log] }));
		return log;
	},
	undoSmoke: (id) => {
		set((s) => ({ logs: s.logs.filter((l) => l.id !== id) }));
	},
	deleteSmoke: (id) => {
		set((s) => ({ logs: s.logs.filter((l) => l.id !== id) }));
	},
	addPurchase: (input) => {
		const purchase = {
			id: uid(),
			...input
		};
		set((s) => ({ purchases: [...s.purchases, purchase] }));
		return purchase;
	},
	deletePurchase: (id) => {
		set((s) => ({ purchases: s.purchases.filter((p) => p.id !== id) }));
	},
	updateSettings: (patch) => {
		set((s) => ({ settings: {
			...s.settings,
			...patch
		} }));
	},
	dismissSample: () => set({ isSample: false }),
	startFresh: () => set({
		logs: [],
		purchases: [],
		initialized: true,
		isSample: false
	}),
	loadSample: () => {
		const sample = createSampleMonth();
		set({
			logs: sample.logs,
			purchases: sample.purchases,
			initialized: true,
			isSample: true
		});
	}
}), {
	name: "ash-ledger-v1",
	storage: createJSONStorage(() => typeof window === "undefined" ? emptyStorage : localStorage),
	skipHydration: true,
	partialize: (s) => ({
		logs: s.logs,
		purchases: s.purchases,
		settings: s.settings,
		initialized: s.initialized,
		isSample: s.isSample
	})
}));
function DashboardView() {
	const logs = useAshStore((s) => s.logs);
	const purchases = useAshStore((s) => s.purchases);
	const settings = useAshStore((s) => s.settings);
	const [period, setPeriod] = (0, import_react.useState)("week");
	const [anchor, setAnchor] = (0, import_react.useState)(() => /* @__PURE__ */ new Date());
	const { start, end } = (0, import_react.useMemo)(() => periodRange(period, anchor), [period, anchor]);
	const summary = (0, import_react.useMemo)(() => summarizeRange(logs, purchases, settings, start, end), [
		logs,
		purchases,
		settings,
		start,
		end
	]);
	const label = periodLabel(period, start, end);
	const chartData = period === "day" ? summary.byHour.filter((h) => h.hour >= 6 && h.hour <= 23).map((h) => ({
		label: `${String(h.hour).padStart(2, "0")}`,
		count: h.count
	})) : summary.byDay.map((d) => ({
		label: d.label,
		count: d.count
	}));
	const countDelta = deltaPct(summary.count, summary.prevCount);
	const costDelta = deltaPct(summary.burned, summary.prevBurned);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PeriodToggle, {
					value: period,
					onChange: setPeriod
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "flex size-11 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground",
							onClick: () => setAnchor((d) => shiftAnchor(period, d, -1)),
							"aria-label": "Previous period",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium",
							children: label
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "flex size-11 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground",
							onClick: () => setAnchor((d) => shiftAnchor(period, d, 1)),
							"aria-label": "Next period",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-5" })
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Cigarettes",
						value: String(summary.count),
						hint: `${countDelta >= 0 ? "+" : ""}${countDelta}% vs prior`,
						delta: countDelta
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Time",
						value: formatDuration(summary.minutes),
						hint: `${formatDuration(summary.prevMinutes)} prior`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Burned",
						value: formatMoney(summary.burned, settings.currency),
						hint: `${costDelta >= 0 ? "+" : ""}${costDelta}% vs prior`,
						delta: costDelta
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Spent",
						value: formatMoney(summary.spent, settings.currency),
						hint: "Packs bought in period"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-sm font-medium",
					children: period === "day" ? "By hour" : "By day"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Count of cigarettes logged"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-44",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
					width: "100%",
					height: "100%",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
						data: chartData,
						barCategoryGap: "18%",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
								dataKey: "label",
								tickLine: false,
								axisLine: false,
								interval: period === "month" ? 3 : 0,
								tick: {
									fill: "var(--color-muted-foreground)",
									fontSize: 11
								}
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
								cursor: { fill: "var(--color-secondary)" },
								content: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartTooltip, {})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
								dataKey: "count",
								radius: [
									4,
									4,
									0,
									0
								],
								fill: "var(--color-primary)"
							})
						]
					})
				})
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-sm font-medium",
					children: "Where it sits"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Before, after, and around the day"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-col gap-3",
				children: summary.byGroup.map((g) => {
					const max = Math.max(...summary.byGroup.map((x) => x.count), 1);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-1 flex items-baseline justify-between text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: {
							before: "Before",
							after: "After",
							around: "Around"
						}[g.group] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "tabular-nums text-muted-foreground",
							children: g.count
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-2 overflow-hidden rounded-full bg-secondary",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-full rounded-full bg-primary transition-[width] duration-200",
							style: { width: `${g.count / max * 100}%` }
						})
					})] }, g.group);
				})
			})] }),
			summary.topContext && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted-foreground",
				children: [
					summary.topContext.label,
					" accounts for ",
					summary.topContext.pct,
					"% of this ",
					period,
					".",
					summary.heaviestWeekday ? ` ${summary.heaviestWeekday.label}s are the heaviest.` : ""
				]
			})
		]
	});
}
function Stat({ label, value, hint, delta }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "gap-0",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium text-muted-foreground",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 font-display text-2xl leading-none tracking-tight tabular-nums sm:text-3xl",
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: cn("mt-2 text-xs", delta === void 0 ? "text-muted-foreground" : delta > 0 ? "text-warning" : delta < 0 ? "text-muted-foreground" : "text-muted-foreground"),
				children: hint
			})
		]
	});
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium outline-none transition-[background-color,color,box-shadow,opacity,scale] duration-150 ease-out press-scale focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground hover:bg-primary/90",
			secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
			outline: "bg-transparent shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)] hover:bg-accent",
			ghost: "bg-transparent hover:bg-accent",
			destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90"
		},
		size: {
			default: "h-11 rounded-lg px-4",
			sm: "h-9 rounded-md px-3 text-xs",
			lg: "h-12 rounded-xl px-5",
			icon: "size-11 rounded-lg",
			chip: "h-11 rounded-xl px-3"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
var Dialog = Dialog$1;
var DialogTrigger = DialogTrigger$1;
var DialogPortal = DialogPortal$1;
var DialogOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay$1, {
	ref,
	className: cn("fixed inset-0 z-50 bg-background/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props
}));
DialogOverlay.displayName = DialogOverlay$1.displayName;
var DialogContent = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
	ref,
	className: cn("fixed z-50 grid w-full gap-4 bg-card p-5 text-card-foreground shadow-[var(--shadow-border)] outline-none", "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", "max-sm:inset-x-0 max-sm:bottom-0 max-sm:rounded-t-3xl max-sm:data-[state=open]:slide-in-from-bottom-4 max-sm:data-[state=closed]:slide-out-to-bottom-4", "sm:top-1/2 sm:left-1/2 sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:p-6 sm:data-[state=open]:zoom-in-95 sm:data-[state=closed]:zoom-out-95", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
		className: "absolute top-4 right-4 rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Close"
		})]
	})]
})] }));
DialogContent.displayName = DialogContent$1.displayName;
function DialogHeader({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex flex-col gap-1.5 pr-8", className),
		...props
	});
}
function DialogFooter({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className),
		...props
	});
}
var DialogTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
	ref,
	className: cn("font-display text-xl font-medium tracking-tight", className),
	...props
}));
DialogTitle.displayName = DialogTitle$1.displayName;
var DialogDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
DialogDescription.displayName = DialogDescription$1.displayName;
var Input = import_react.forwardRef(({ className, type, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		type,
		className: cn("flex h-11 w-full rounded-lg bg-secondary px-3 text-sm text-foreground shadow-[var(--shadow-border)] outline-none transition-[box-shadow] duration-150 placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40", className),
		ref,
		...props
	});
});
Input.displayName = "Input";
var Label = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root, {
	ref,
	className: cn("text-xs font-medium text-muted-foreground", className),
	...props
}));
Label.displayName = Root.displayName;
function PacksView() {
	const purchases = useAshStore((s) => s.purchases);
	const logs = useAshStore((s) => s.logs);
	const settings = useAshStore((s) => s.settings);
	const deletePurchase = useAshStore((s) => s.deletePurchase);
	const ordered = (0, import_react.useMemo)(() => purchases.slice().sort((a, b) => b.at - a.at), [purchases]);
	const remaining = inventoryRemaining(logs, purchases);
	const perCig = costPerCigarette(purchases, settings.cigsPerPack > 0 ? settings.defaultPackCost / settings.cigsPerPack : 0);
	const totalSpent = purchases.reduce((s, p) => s + p.cost, 0);
	const totalCigs = purchases.reduce((s, p) => s + p.packs * p.cigsPerPack, 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl tracking-tight",
					children: "Purchases"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "What you bought, and what each stick costs."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddPurchaseDialog, {})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium text-muted-foreground",
							children: "On hand"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 font-display text-3xl leading-none tabular-nums",
							children: remaining
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs text-muted-foreground",
							children: plural(Math.abs(remaining), "cigarette")
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium text-muted-foreground",
							children: "Per cigarette"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 font-display text-3xl leading-none tabular-nums",
							children: formatMoney(perCig, settings.currency)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs text-muted-foreground",
							children: "Weighted across packs"
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium text-muted-foreground",
						children: "Logged spend"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 font-display text-2xl leading-none tabular-nums",
						children: formatMoney(totalSpent, settings.currency)
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium text-muted-foreground",
							children: "Bought"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 font-display text-2xl leading-none tabular-nums",
							children: totalCigs
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs text-muted-foreground",
							children: plural(totalCigs, "stick")
						})
					] })
				]
			}),
			ordered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "No purchases yet. Log a pack to start costing each cigarette."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-col gap-2",
				children: ordered.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "flex items-center gap-3 p-3 sm:p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-sm font-medium",
								children: p.brand || "Unlabeled pack"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted-foreground",
								children: [
									format(p.at, "d MMM yyyy"),
									" · ",
									p.packs,
									" ",
									plural(p.packs, "pack"),
									" ·",
									" ",
									p.packs * p.cigsPerPack,
									" sticks"
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm tabular-nums",
							children: formatMoney(p.cost, settings.currency)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "relative size-11 text-muted-foreground hover:text-foreground",
							onClick: () => {
								deletePurchase(p.id);
								toast("Purchase removed");
							},
							"aria-label": "Remove purchase",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "mx-auto size-4" })
						})
					]
				}) }, p.id))
			})
		]
	});
}
function AddPurchaseDialog() {
	const settings = useAshStore((s) => s.settings);
	const addPurchase = useAshStore((s) => s.addPurchase);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [brand, setBrand] = (0, import_react.useState)("");
	const [packs, setPacks] = (0, import_react.useState)("1");
	const [cigs, setCigs] = (0, import_react.useState)(String(settings.cigsPerPack));
	const [cost, setCost] = (0, import_react.useState)(String(settings.defaultPackCost));
	const [date, setDate] = (0, import_react.useState)(() => format(/* @__PURE__ */ new Date(), "yyyy-MM-dd"));
	function reset() {
		setBrand("");
		setPacks("1");
		setCigs(String(settings.cigsPerPack));
		setCost(String(settings.defaultPackCost));
		setDate(format(/* @__PURE__ */ new Date(), "yyyy-MM-dd"));
	}
	function submit(e) {
		e.preventDefault();
		const packCount = Math.max(1, Number(packs) || 1);
		const per = Math.max(1, Number(cigs) || settings.cigsPerPack);
		const total = Number(cost);
		if (!Number.isFinite(total) || total <= 0) {
			toast("Enter a cost greater than zero");
			return;
		}
		const at = (/* @__PURE__ */ new Date(`${date}T12:00:00`)).getTime();
		addPurchase({
			at: Number.isFinite(at) ? at : Date.now(),
			brand: brand.trim(),
			packs: packCount,
			cigsPerPack: per,
			cost: total
		});
		toast("Purchase logged");
		reset();
		setOpen(false);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
		open,
		onOpenChange: setOpen,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "Add"]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: submit,
			className: "grid gap-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Log a purchase" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "A pack, a carton, or a loose handful." })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Brand",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: brand,
								onChange: (e) => setBrand(e.target.value),
								placeholder: "Optional"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Packs",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "number",
									min: 1,
									inputMode: "numeric",
									value: packs,
									onChange: (e) => setPacks(e.target.value)
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Sticks per pack",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "number",
									min: 1,
									inputMode: "numeric",
									value: cigs,
									onChange: (e) => setCigs(e.target.value)
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: `Cost (${settings.currency})`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "number",
									min: 0,
									step: "0.01",
									inputMode: "decimal",
									value: cost,
									onChange: (e) => setCost(e.target.value)
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Date",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "date",
									value: date,
									onChange: (e) => setDate(e.target.value)
								})
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					children: "Save purchase"
				}) })
			]
		}) })]
	});
}
function Field({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: label }), children]
	});
}
function PatternsView() {
	const logs = useAshStore((s) => s.logs);
	const purchases = useAshStore((s) => s.purchases);
	const settings = useAshStore((s) => s.settings);
	const [period, setPeriod] = (0, import_react.useState)("month");
	const [anchor] = (0, import_react.useState)(() => /* @__PURE__ */ new Date());
	const { start, end } = (0, import_react.useMemo)(() => periodRange(period, anchor), [period, anchor]);
	const summary = (0, import_react.useMemo)(() => summarizeRange(logs, purchases, settings, start, end), [
		logs,
		purchases,
		settings,
		start,
		end
	]);
	const total = summary.count || 1;
	const hourData = summary.byHour.map((h) => ({
		label: String(h.hour).padStart(2, "0"),
		count: h.count
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl tracking-tight",
				children: "Patterns"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: [
					"Before, after, and around — ",
					periodLabel(period, start, end),
					"."
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PeriodToggle, {
				value: period,
				onChange: setPeriod
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-3 gap-2",
				children: summary.byGroup.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-3 sm:p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: GROUP_META[g.group].label
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 font-display text-2xl tabular-nums",
							children: g.count
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground tabular-nums",
							children: [Math.round(g.count / total * 100), "%"]
						})
					]
				}, g.group))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-sm font-medium",
					children: "Moments"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Ranked by how often they show up"
				})]
			}), summary.byContext.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "No logs in this stretch."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-col gap-3",
				children: summary.byContext.map((row) => {
					const max = summary.byContext[0]?.count ?? 1;
					const def = CONTEXT_BY_ID[row.id];
					const Icon = def.icon;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-1 flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
								className: "size-3.5 text-muted-foreground",
								strokeWidth: 1.75
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex-1 text-sm",
								children: def.label
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs tabular-nums text-muted-foreground",
								children: [
									row.count,
									" · ",
									Math.round(row.count / total * 100),
									"%"
								]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-1.5 overflow-hidden rounded-full bg-secondary",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-full rounded-full bg-primary",
							style: { width: `${row.count / max * 100}%` }
						})
					})] }, row.id);
				})
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-sm font-medium",
					children: "Hour of day"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "When the habit clusters"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-40",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
					width: "100%",
					height: "100%",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
						data: hourData,
						barCategoryGap: "12%",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
								dataKey: "label",
								tickLine: false,
								axisLine: false,
								interval: 3,
								tick: {
									fill: "var(--color-muted-foreground)",
									fontSize: 11
								}
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
								cursor: { fill: "var(--color-secondary)" },
								content: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartTooltip, {})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
								dataKey: "count",
								fill: "var(--color-chart-2)",
								radius: [
									3,
									3,
									0,
									0
								]
							})
						]
					})
				})
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-sm font-medium",
					children: "Day of week"
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "grid grid-cols-7 gap-1.5",
				children: summary.byWeekday.map((d) => {
					const max = Math.max(...summary.byWeekday.map((x) => x.count), 1);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex flex-col items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex h-24 w-full items-end rounded-lg bg-secondary px-1 py-1",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "w-full rounded-sm bg-primary",
									style: { height: `${Math.max(d.count / max * 100, d.count > 0 ? 8 : 0)}%` }
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted-foreground",
								children: d.label
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs tabular-nums",
								children: d.count
							})
						]
					}, d.day);
				})
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "flex flex-col gap-2 text-sm text-muted-foreground",
				children: [
					summary.topContext && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
						"Most often ",
						summary.topContext.label.toLowerCase(),
						" (",
						summary.topContext.pct,
						"%)."
					] }),
					summary.heaviestWeekday && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
						summary.heaviestWeekday.label,
						" carries the most, at ",
						summary.heaviestWeekday.count,
						" ",
						"cigarettes."
					] }),
					summary.avgGapMinutes !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
						"Average gap in this stretch is ",
						formatDuration(summary.avgGapMinutes),
						"."
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
						"Time in this stretch: ",
						formatDuration(summary.minutes),
						" smoking."
					] })
				]
			})
		]
	});
}
var Select = Select$1;
var SelectValue = SelectValue$1;
var SelectTrigger = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectTrigger$1, {
	ref,
	className: cn("flex h-11 w-full items-center justify-between gap-2 rounded-lg bg-secondary px-3 text-sm shadow-[var(--shadow-border)] outline-none transition-[box-shadow] duration-150 focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectIcon, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-4 text-muted-foreground" })
	})]
}));
SelectTrigger.displayName = SelectTrigger$1.displayName;
var SelectContent = import_react.forwardRef(({ className, children, position = "popper", ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectPortal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent$1, {
	ref,
	position,
	className: cn("relative z-50 min-w-32 overflow-hidden rounded-xl bg-popover text-popover-foreground shadow-[var(--shadow-border)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectViewport, {
		className: "p-1",
		children
	})
}) }));
SelectContent.displayName = SelectContent$1.displayName;
var SelectItem = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem$1, {
	ref,
	className: cn("relative flex w-full cursor-pointer items-center rounded-lg py-2.5 pr-8 pl-3 text-sm outline-none select-none focus:bg-accent data-disabled:pointer-events-none data-disabled:opacity-40", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItemText, { children }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItemIndicator, {
		className: "absolute right-2 flex size-4 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" })
	})]
}));
SelectItem.displayName = SelectItem$1.displayName;
function SettingsDialog() {
	const settings = useAshStore((s) => s.settings);
	const updateSettings = useAshStore((s) => s.updateSettings);
	const startFresh = useAshStore((s) => s.startFresh);
	const loadSample = useAshStore((s) => s.loadSample);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "ghost",
			size: "icon",
			"aria-label": "Settings",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, {
				className: "size-5",
				strokeWidth: 1.75
			})
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Settings" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Defaults for cost, time, and pack size." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Currency" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: settings.currency,
					onValueChange: (v) => updateSettings({ currency: v }),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "USD",
							children: "US dollar"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "EUR",
							children: "Euro"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "GBP",
							children: "Pound sterling"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "INR",
							children: "Indian rupee"
						})
					] })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Sticks per pack" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "number",
						min: 1,
						value: settings.cigsPerPack,
						onChange: (e) => updateSettings({ cigsPerPack: Math.max(1, Number(e.target.value) || 1) })
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Default pack cost" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "number",
						min: 0,
						step: "0.01",
						value: settings.defaultPackCost,
						onChange: (e) => updateSettings({ defaultPackCost: Math.max(0, Number(e.target.value) || 0) })
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-1.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Minutes per cigarette" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "number",
						min: 1,
						max: 30,
						value: settings.minutesPerCig,
						onChange: (e) => updateSettings({ minutesPerCig: Math.max(1, Number(e.target.value) || 6) })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "Used to estimate time spent. Six minutes is a typical stick."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2 pt-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "outline",
					onClick: () => loadSample(),
					children: "Load sample month"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "ghost",
					onClick: () => startFresh(),
					children: "Start with an empty ledger"
				})]
			})
		]
	})] })] });
}
function PackVisual({ remaining, perPack }) {
	const slots = Math.min(Math.max(perPack, 1), 25);
	const filled = remaining <= 0 ? 0 : Math.min(remaining, slots);
	const packs = Math.floor(Math.max(remaining, 0) / perPack);
	const loose = Math.max(remaining, 0) % perPack;
	let caption;
	if (remaining < 0) caption = `${Math.abs(remaining)} smoked past logged packs`;
	else if (remaining === 0) caption = "Pack empty — log a purchase";
	else if (remaining <= perPack) caption = `${remaining} left in this pack`;
	else if (loose === 0) caption = `${packs} full ${plural(packs, "pack")} on hand`;
	else caption = `${packs} ${plural(packs, "pack")} + ${loose} in the open one`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-1.5",
			style: { gridTemplateColumns: `repeat(${Math.min(slots, 10)}, minmax(0, 1fr))` },
			children: Array.from({ length: slots }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("h-3 rounded-sm transition-colors duration-200", i < filled ? "bg-primary" : "bg-secondary") }, i))
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-muted-foreground",
			children: caption
		})]
	});
}
function useNow(ms = 3e4) {
	const [now, setNow] = (0, import_react.useState)(() => Date.now());
	(0, import_react.useEffect)(() => {
		const id = setInterval(() => setNow(Date.now()), ms);
		return () => clearInterval(id);
	}, [ms]);
	return now;
}
function TodayView() {
	const now = useNow();
	const logs = useAshStore((s) => s.logs);
	const purchases = useAshStore((s) => s.purchases);
	const settings = useAshStore((s) => s.settings);
	const addSmoke = useAshStore((s) => s.addSmoke);
	const undoSmoke = useAshStore((s) => s.undoSmoke);
	const deleteSmoke = useAshStore((s) => s.deleteSmoke);
	const todayLogs = (0, import_react.useMemo)(() => {
		const start = startOfDay(now);
		const end = endOfDay(now);
		return logs.filter((l) => inRange(l.at, start, end)).slice().sort((a, b) => b.at - a.at);
	}, [logs, now]);
	const last = (0, import_react.useMemo)(() => logs.slice().sort((a, b) => b.at - a.at)[0], [logs]);
	const remaining = inventoryRemaining(logs, purchases);
	const minutesToday = todayLogs.length * settings.minutesPerCig;
	function log(context) {
		const entry = addSmoke(context);
		const def = CONTEXT_BY_ID[context];
		toast(`Logged ${def.label.toLowerCase()}`, { action: {
			label: "Undo",
			onClick: () => undoSmoke(entry.id)
		} });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "stagger-in grid grid-cols-2 gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "col-span-2 sm:col-span-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium text-muted-foreground",
							children: "Today"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 font-display text-5xl leading-none tracking-tight tabular-nums",
							children: todayLogs.length
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-sm text-muted-foreground",
							children: [
								plural(todayLogs.length, "cigarette"),
								" · ",
								minutesToday,
								"m"
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "col-span-2 sm:col-span-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium text-muted-foreground",
							children: "Since the last"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 font-display text-3xl leading-tight tracking-tight",
							children: last ? formatRelativeAgo(last.at, now) : "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted-foreground",
							children: last ? CONTEXT_BY_ID[last.context].label : "Nothing logged yet"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "stagger-in",
				style: { animationDelay: "80ms" },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-medium",
						children: "Log one"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "Tap the moment. You can undo."
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-col gap-4",
					children: GROUP_ORDER.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContextGroupBlock, {
						group,
						onLog: log
					}, group))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "stagger-in",
				style: { animationDelay: "120ms" },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4 flex items-baseline justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-medium",
						children: "Open pack"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs tabular-nums text-muted-foreground",
						children: [remaining, " remaining"]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PackVisual, {
					remaining,
					perPack: settings.cigsPerPack
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "stagger-in pb-4",
				style: { animationDelay: "160ms" },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-3 text-sm font-medium",
					children: "Today’s log"
				}), todayLogs.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Empty so far. The first tap starts the day."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "flex flex-col gap-1",
					children: todayLogs.map((logEntry) => {
						const def = CONTEXT_BY_ID[logEntry.context];
						const Icon = def.icon;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-secondary",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "flex size-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
										className: "size-4",
										strokeWidth: 1.75
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm",
										children: def.label
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground tabular-nums",
										children: isSameDay(logEntry.at, now) ? formatTime(logEntry.at) : formatRelativeAgo(logEntry.at, now)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "relative size-11 text-muted-foreground hover:text-foreground",
									onClick: () => deleteSmoke(logEntry.id),
									"aria-label": "Remove",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "mx-auto size-4" })
								})
							]
						}, logEntry.id);
					})
				})]
			})
		]
	});
}
function ContextGroupBlock({ group, onLog }) {
	const meta = GROUP_META[group];
	const items = CONTEXTS.filter((c) => c.group === group);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-2 flex items-baseline justify-between",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-medium tracking-wide text-muted-foreground uppercase",
			children: meta.label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-muted-foreground",
			children: meta.hint
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-2 gap-2",
		children: items.map((item) => {
			const Icon = item.icon;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => onLog(item.id),
				className: cn("press-scale flex min-h-11 items-center gap-2.5 rounded-xl bg-card px-3 py-2.5 text-left shadow-[var(--shadow-border)] transition-[box-shadow,background-color] duration-150", "hover:shadow-[var(--shadow-border-hover)] hover:bg-accent"),
				"aria-label": item.label,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
					className: "size-4 shrink-0 text-muted-foreground",
					strokeWidth: 1.75
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm leading-tight",
					children: item.short
				})]
			}, item.id);
		})
	})] });
}
var TABS = [
	{
		id: "today",
		label: "Today"
	},
	{
		id: "dashboard",
		label: "Dashboard"
	},
	{
		id: "packs",
		label: "Packs"
	},
	{
		id: "patterns",
		label: "Patterns"
	}
];
function AppShell() {
	const [hydrated, setHydrated] = (0, import_react.useState)(false);
	const [tab, setTab] = (0, import_react.useState)("today");
	(0, import_react.useLayoutEffect)(() => {
		useAshStore.persist.rehydrate();
		useAshStore.getState().ensureSeeded();
		setHydrated(true);
	}, []);
	if (!hydrated) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-background text-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
			className: "mx-auto w-full max-w-3xl px-5 py-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Loading the ledger…"
			})
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-background text-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto w-full max-w-3xl px-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SampleBanner, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						className: "sticky top-0 z-20 -mx-5 mb-6 bg-background/90 px-5 py-3 backdrop-blur-sm",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex gap-1 overflow-x-auto",
							children: TABS.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setTab(t.id),
								className: cn("h-11 shrink-0 rounded-full px-4 text-sm font-medium transition-[background-color,color] duration-150", tab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"),
								children: t.label
							}, t.id))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
						className: "pb-16",
						children: [
							tab === "today" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TodayView, {}),
							tab === "dashboard" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardView, {}),
							tab === "packs" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PacksView, {}),
							tab === "patterns" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PatternsView, {})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
				theme: "dark",
				position: "top-center",
				toastOptions: { className: "bg-popover text-popover-foreground shadow-[var(--shadow-border)] border-0" }
			})
		]
	});
}
function Header() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "mx-auto flex w-full max-w-3xl items-start justify-between gap-4 px-5 pt-8 pb-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-display text-4xl leading-none tracking-tight italic",
			children: "Ash"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-muted-foreground",
			children: "A private smoking ledger"
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsDialog, {})]
	});
}
function SampleBanner() {
	const isSample = useAshStore((s) => s.isSample);
	const dismissSample = useAshStore((s) => s.dismissSample);
	const startFresh = useAshStore((s) => s.startFresh);
	if (!isSample) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-2 rounded-2xl bg-secondary px-4 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm",
			children: "A sample month is loaded so the dashboard has shape."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-3 flex flex-wrap gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				variant: "outline",
				onClick: startFresh,
				children: "Start fresh"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				variant: "ghost",
				onClick: dismissSample,
				children: "Keep it"
			})]
		})]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {});
}
//#endregion
export { Home as component };
