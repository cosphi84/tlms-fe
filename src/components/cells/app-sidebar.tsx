"use client";

import * as React from "react";
import { Wrench } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/atoms/sidebar";
import Link from "next/link";
import { NavMain } from "@/components/cells/nav-main";
import { NavSecondary } from "@/components/cells/nav-secondary";
import { NavUser } from "@/components/cells/nav-user";
import { MenuData } from "@/configs/menu";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/">
                <Wrench className="size-5!" />
                <span className="text-base font-semibold">
                  Tools Management
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={MenuData.navMain} />
        <NavSecondary items={MenuData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
