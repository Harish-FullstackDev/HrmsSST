import dashboardIcon from "@/assets/HrShell/icons/nav-dashboard.svg";
import jobOpeningsIcon from "@/assets/HrShell/icons/nav-job-openings.svg";
import candidatesIcon from "@/assets/HrShell/icons/nav-candidates.svg";
import interviewScheduleIcon from "@/assets/HrShell/icons/nav-interview-schedule.svg";
import hiringPipelineIcon from "@/assets/HrShell/icons/nav-hiring-pipeline.svg";
import recruitmentReportsIcon from "@/assets/HrShell/icons/nav-recruitment-reports.svg";
import settingsIcon from "@/assets/HrShell/icons/nav-settings.svg";

// Figma 1983:7484: the HR sidebar. Only the dashboard exists so far; the
// other pages come next and take these routes.
export const HR_NAV_LINKS = [
    { label: "Dashboard", href: "/hr/dashboard", icon: dashboardIcon },
    { label: "Job Openings", href: "/hr/job-openings", icon: jobOpeningsIcon },
    { label: "Applicants", href: "/hr/candidates", icon: candidatesIcon },
    { label: "Interview Schedule", href: "/hr/interview-schedule", icon: interviewScheduleIcon },
    { label: "Hiring Pipeline", href: "/hr/hiring-pipeline", icon: hiringPipelineIcon },
    { label: "Recruitment Reports", href: "/hr/recruitment-reports", icon: recruitmentReportsIcon },
    { label: "Settings", href: "/hr/settings", icon: settingsIcon },
];
