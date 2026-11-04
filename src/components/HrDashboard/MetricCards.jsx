import Image from "next/image";

import trendUpIcon from "@/assets/HrDashboard/icons/trend-up-10x6.svg";
import { metrics } from "./hrDashboardData";

// Figma 1898:5343: five key metric cards, 180 tall, 16 apart. They share the
// row equally and wrap onto more rows when a card would get narrower than 214
// (with the sidebar open the row is 1136 wide at 1440, still five across).
export default function MetricCards() {
    return (
        <ul className="grid grid-cols-[repeat(auto-fit,minmax(214px,1fr))] gap-4">
            {metrics.map(({ label, value, caption, badge, trend, icon }) => (
                <li
                    key={label}
                    className="flex h-[180px] flex-col justify-between rounded-xl bg-surface-brand-subtle px-4 pt-4 pb-6 drop-shadow-[3px_3px_5.4px_rgba(0,0,0,0.14)]"
                >
                    <div className="flex items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-100">
                            <Image src={icon} alt="" />
                        </span>
                        <h3 className="text-sm leading-[1.4] whitespace-nowrap text-ink-body">{label}</h3>
                    </div>
                    <div className="flex flex-col gap-4">
                        <p className="text-[32px] leading-[1.2] font-medium text-ink-heading">{value}</p>
                        <div className="flex items-end justify-between">
                            <p className="max-w-[105px] text-xs leading-[1.4] text-ink-caption">{caption}</p>
                            <span className="flex h-[18px] shrink-0 items-center gap-1 rounded-full bg-primary-100 px-[7px] text-xs leading-[1.4] text-action">
                                {trend && <Image src={trendUpIcon} alt="" className="h-1.5 w-2.5" />}
                                {badge}
                            </span>
                        </div>
                    </div>
                </li>
            ))}
        </ul>
    );
}
