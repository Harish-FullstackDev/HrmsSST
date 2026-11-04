import candidatesIcon from "@/assets/HrDashboard/icons/metric-candidates.svg";
import openingsIcon from "@/assets/HrDashboard/icons/metric-openings.svg";
import interviewsIcon from "@/assets/HrDashboard/icons/metric-interviews.svg";
import pendingIcon from "@/assets/HrDashboard/icons/metric-pending.svg";
import offersIcon from "@/assets/HrDashboard/icons/metric-offers.svg";
import elenaRostova from "@/assets/HrDashboard/avatars/elena-rostova.jpg";
import marcusChen from "@/assets/HrDashboard/avatars/marcus-chen.jpg";
import aminaDiallo from "@/assets/HrDashboard/avatars/amina-diallo.jpg";
import devonVance from "@/assets/HrDashboard/avatars/devon-vance.jpg";
import interviewElenaRostova from "@/assets/HrDashboard/avatars/interview-elena-rostova.jpg";

// Static content from Figma 1898:5288 until there's an HR backend.

export const metrics = [
    { label: "Total Candidates", value: "4,820", caption: "Last Month", badge: "+14.2%", trend: true, icon: candidatesIcon },
    { label: "Active Opening", value: "28", caption: "6 closing this week", badge: "4 Urgent", icon: openingsIcon },
    { label: "Interviews This Week", value: "42", caption: "Across 8 engineering teams", badge: "14 Today", icon: interviewsIcon },
    { label: "Pending Review", value: "20", caption: "Awaiting screening", badge: "6 Accepted", icon: pendingIcon },
    { label: "Offers Released", value: "09", caption: "3 pending decision", badge: "6 Accepted", icon: offersIcon },
];

// `stage` picks the pill colours in RecentApplications.
export const recentApplications = {
    total: 142,
    rows: [
        {
            name: "Elena Rostova",
            email: "elena.rostova@devmail.io",
            avatar: elenaRostova,
            role: "Senior Cloud Architect",
            department: "Infrastructure",
            match: 94,
            stageLabel: "Final Interview",
            stage: "success",
        },
        {
            name: "Marcus Chen",
            email: "m.chen.design@portfolio.net",
            avatar: marcusChen,
            role: "Lead Product Designer",
            department: "Design System",
            match: 75,
            stageLabel: "Technical Review",
            stage: "info",
        },
        {
            name: "Amina Diallo",
            email: "amina.diallo@alumni.tech",
            avatar: aminaDiallo,
            role: "Staff Backend Engineer",
            department: "Core Banking",
            match: 88,
            stageLabel: "Screening",
            stage: "neutral",
        },
        {
            name: "Devon Vance",
            email: "dvance@executivepipeline.com",
            avatar: devonVance,
            role: "Enterprise Account Exec",
            department: "Strategic Accounts",
            match: 74,
            stageLabel: "Offer Pending",
            stage: "warning",
        },
    ],
};

export const upcomingInterviews = [
    { id: 1, name: "Elena Rostova", topic: "System Design", time: "10:30 AM", meta: "Google Meet · 45m", avatar: interviewElenaRostova },
    { id: 2, name: "Elena Rostova", topic: "System Design", time: "10:30 AM", meta: "Google Meet · 45m", avatar: interviewElenaRostova },
];
