"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem
} from "@/components/atoms/sidebar";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/atoms/collapsible";
import { ChevronRight, LucideIcon } from "lucide-react";


type NavItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
  items?: {
    title: string;
    url: string;
  }[];
};

export function NavMain({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => {
            const isActive =
              item.url === "/"
                ? pathname === "/"
                : pathname === item.url || pathname.startsWith(item.url + "/");

            const mainActive = item?.items?.some(
              (a) =>
                pathname === item.url + a.url ||
                pathname.startsWith(item.url + a.url + "/")
            );

            if (!item?.items) {
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={isActive || !!mainActive}
                    asChild
                    className={
                      isActive ? "bg-slate-200!  dark:bg-slate-700!" : ""
                    }
                  >
                    <Link href={item.url}>
                      {item.icon && (
                        <item.icon
                          className={
                            isActive || !!mainActive ? "text-primary" : ""
                          }
                        />
                      )}
                      <span
                        className={
                          isActive || !!mainActive
                            ? "font-bold text-primary"
                            : ""
                        }
                      >
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            }
            return (
              <Collapsible
                key={`sidebar-menu-${item.title}`}
                asChild
                defaultOpen={isActive || !!mainActive}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={!!mainActive}
                    >
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem, index) => (
                        <SidebarMenuSubItem
                          key={`sub-${subItem.title}-${index}`}
                        >
                          <SidebarMenuSubButton
                            asChild
                            isActive={pathname === item.url + subItem.url}
                            className={
                              pathname === item.url + subItem.url ||
                              pathname.startsWith(item.url + subItem.url + "/")
                                ? "bg-slate-200! font-bold text-primary dark:bg-slate-700!"
                                : ""
                            }
                          >
                            <Link href={item.url + subItem.url}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
