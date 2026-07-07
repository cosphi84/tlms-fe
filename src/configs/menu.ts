import {
  BugIcon,
  Clock3,
  Database,
  FileBarChart,
  FileType,
  LayoutDashboard,
  Search,
  Settings,
  Wrench
} from "lucide-react";

export const MenuData = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg"
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: LayoutDashboard
    },
    {
      title: "Tools",
      url: "/tools",
      icon: Wrench,
      items: [
        {
          title: "Master Tools",
          url: "/"
        },
        {
          title: "Stock Tools",
          url: "/stocks"
        }
      ]
    },
    {
      title: "Stok Take",
      url: "#",
      icon: Clock3
    },

    {
      title: "Data Master",
      url: "/masters",
      icon: Database,
      items: [
        { title: "Offices", url: "/offices" },
        { title: "Storage Loc", url: "/slocs" },
        { title: "Users", url: "/users" },
      ]
    }
  ],

  navSecondary: [
    {
      title: "Error Logs",
      url: "/error-logs",
      icon: BugIcon
    },
    {
      title: "Search",
      url: "#",
      icon: Search
    }
  ],
  documents: [
    {
      name: "Data Library",
      url: "#",
      icon: Database
    },
    {
      name: "Reports",
      url: "#",
      icon: FileBarChart
    },
    {
      name: "Word Assistant",
      url: "#",
      icon: FileType
    }
  ]
};
