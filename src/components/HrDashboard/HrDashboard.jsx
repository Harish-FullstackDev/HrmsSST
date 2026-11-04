import DashboardToolbar from "./DashboardToolbar";
import MetricCards from "./MetricCards";
import QuickActions from "./QuickActions";
import RecentApplications from "./RecentApplications";
import UpcomingInterviews from "./UpcomingInterviews";

// Figma 1898:5288 (sidebar closed) / 1905:1303 (sidebar open): the HR
// dashboard. Sections are 32 apart inside 32 gutters; with the sidebar open
// the left gutter is 16, as in Figma. The applications table
// and the side cards (341 wide, 36 apart) sit side by side once the page area
// itself is 1100 wide, so the sidebar opening also stacks them when needed.
export default function HrDashboard() {
    return (
        <div className="@container flex flex-col gap-8 px-4 pt-8 pb-8 sm:px-8 lg:group-data-[sidebar=open]/hr:pl-4">
            <h1 className="sr-only">Dashboard</h1>
            <DashboardToolbar />
            <MetricCards />
            <div className="flex flex-col gap-8 @min-[1100px]:flex-row @min-[1100px]:gap-9">
                <RecentApplications />
                <div className="grid content-start items-start gap-3.5 @min-[700px]:grid-cols-2 @min-[1100px]:w-[341px] @min-[1100px]:shrink-0 @min-[1100px]:grid-cols-1">
                    <QuickActions />
                    <UpcomingInterviews />
                </div>
            </div>
        </div>
    );
}
