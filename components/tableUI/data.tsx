import {DangerCircleSvg} from "./danger-circle";
import {DefaultCircleSvg} from "./default-circle";
import {SuccessCircleSvg} from "./success-circle";
import {WarningCircleSvg} from "./warning-circle";

export const statusOptions = [
  {name: "Active", uid: "active"},
  {name: "Inactive", uid: "inactive"},
  {name: "Paused", uid: "paused"},
  {name: "Vacation", uid: "vacation"},
] as const;

export type StatusOptions = (typeof statusOptions)[number]["name"];

export const statusColorMap: Record<StatusOptions, JSX.Element> = {
  Active: SuccessCircleSvg,
  Inactive: DefaultCircleSvg,
  Paused: DangerCircleSvg,
  Vacation: WarningCircleSvg,
};

type Teams =
  | "Design"
  | "Product"
  | "Marketing"
  | "Management"
  | "Engineering"
  | "Sales"
  | "Support"
  | "Other"
  | (string & {});

export type MemberInfo = {
  avatar: string;
  email: string;
  name: string;
};

export type Users = {
  id: number;
  workerID: number;
  externalWorkerID: string;
  memberInfo: MemberInfo;
  role: string;
  workerType: "Contractor" | "Employee";
  status: StatusOptions;
  startDate: Date;
  teams: Teams[];
};

export type ColumnsKey =
  | "workerID"
  | "externalWorkerID"
  | "memberInfo"
  | "role"
  | "workerType"
  | "status"
  | "startDate"
  | "teams"
  | "actions";

export const INITIAL_VISIBLE_COLUMNS: ColumnsKey[] = [
  "workerID",
  "externalWorkerID",
  "memberInfo",
  "role",
  "workerType",
  "status",
  "startDate",
  "teams",
  "actions",
];

export const columns = [
  {name: "Worker ID", uid: "workerID"},
  {name: "External Worker ID", uid: "externalWorkerID"},
  {name: "Member", uid: "memberInfo", sortDirection: "ascending"},
  {name: "Role", uid: "role"},
  {name: "Worker Type", uid: "workerType"},
  {name: "Status", uid: "status", info: "The user's current status"},
  {name: "Start Date", uid: "startDate", info: "The date the user started"},
  {name: "Teams", uid: "teams"},
  {name: "Actions", uid: "actions"},
];

const names = [
  "Alice Johnson",
  "Bob Smith",
  "Charlie Brown",
  "David Wilson",
  "Eve Martinez",
  "Frank Thompson",
  "Grace Garcia",
  "Hannah Lee",
  "Isaac Anderson",
  "Julia Roberts",
  "Liam Williams",
  "Mia White",
  "Noah Harris",
  "Olivia Martin",
  "Peyton Jones",
  "Quinn Taylor",
  "Ryan Moore",
  "Sophia Davis",
  "Marcus Lopez",
  "Uma Thomas",
  "Victoria Jackson",
  "William Green",
  "Xavier Hill",
  "Yara Scott",
  "Zoe Baker",
  "Aaron Carter",
  "Bella Brown",
  "Carter Black",
  "Daisy Clark",
  "Ethan Hunt",
  "Fiona Apple",
  "George King",
  "Harper Knight",
  "Ivy Lane",
  "Jack Frost",
  "Kylie Reed",
  "Lucas Grant",
  "Molly Shaw",
  "Nathan Ford",
  "Oliver Stone",
  "Penelope Cruz",
  "Quentin Cook",
  "Ruby Fox",
  "Sarah Miles",
  "Travis Shaw",
  "Ursula Major",
  "Vera Mindy",
  "Wesley Snipes",
  "Xena Warrior",
  "Yvette Fielding",
];

const roles = [
  "Software Engineer",
  "Marketing Specialist",
  "Human Resources Manager",
  "Data Analyst",
  "Project Manager",
  "Sales Executive",
  "Graphic Designer",
  "Operations Coordinator",
  "Product Manager",
  "Customer Service Representative",
  "Network Administrator",
  "Quality Assurance Tester",
  "Business Analyst",
  "Content Writer",
  "UX/UI Designer",
  "Accountant",
  "Supply Chain Analyst",
  "Clinical Research Coordinator",
  "Social Media Manager",
  "Web Developer",
  "SEO Specialist",
  "Event Planner",
  "Logistics Manager",
  "Technical Support Specialist",
  "Public Relations Officer",
  "Compliance Officer",
  "Financial Advisor",
  "Environmental Scientist",
  "Occupational Therapist",
  "Real Estate Agent",
];

const generateMockUserData = (count: number): Users[] => {
  const mockData: Users[] = [];

  for (let i = 0; i < count; i++) {
    const selectedName = names[Math.floor(Math.random() * names.length)];
    const selectedRole = roles[Math.floor(Math.random() * roles.length)];

    const user: Users = {
      id: i,
      workerID: Math.floor(Math.random() * 1000),
      externalWorkerID: `EXT-${Math.floor(Math.random() * 1000)}`,
      memberInfo: {
        avatar: `https://i.pravatar.cc/150?img=${i}`,
        email: `${selectedName.toLowerCase().replace(/\s+/g, ".")}@example.com`,
        name: selectedName,
      },
      role: selectedRole,
      workerType: Math.random() > 0.5 ? "Contractor" : "Employee",
      status:
        Math.random() > 0.5
          ? "Active"
          : Math.random() > 0.5
            ? "Paused"
            : Math.random() > 0.5
              ? "Vacation"
              : "Inactive",
      startDate: new Date(new Date().getTime() - Math.random() * (24 * 60 * 60 * 1000 * 40)),
      teams: [
        "Design",
        "Product",
        "Marketing",
        "Management",
        "Engineering",
        "Sales",
        "Support",
        "Other",
      ].filter(() => Math.random() > 0.5),
    };

    mockData.push(user);
  }

  return mockData;
};

export const users: Users[] = generateMockUserData(100);
