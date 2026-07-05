"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/atoms/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from "@/components/atoms/sidebar";
import { useRouter } from "next/navigation";
import { useGetAuth, useLogout } from "@/queries/auth-query";
import { Fragment, useState } from "react";
import { ConfirmationModal } from "@/components/cells/confirmation-modal";
import { GripVertical, LogOut } from "lucide-react";


export function NavUser() {
  const [openLogout, setOpenLogout] = useState<boolean>(false);

  const router = useRouter();

  const { data, isError, error } = useGetAuth({
    redirectToLogin: false, // disable redirect for debug
    //query: { source: "NavUser", time: new Date().getTime() }
  });
  console.log({ isError, error });

  const logout = useLogout();
  const { isMobile } = useSidebar();

  return (
    <Fragment>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{data?.name}</span>
                  <span className="text-muted-foreground truncate text-xs line-clamp-1">
                    {data?.email}
                  </span>
                </div>
                <GripVertical className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium line-clamp-1">
                      {data?.name}
                    </span>
                    <span className="text-muted-foreground truncate text-xs">
                      {data?.email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setOpenLogout(true)}>
                <LogOut />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <ConfirmationModal
        opened={openLogout}
        onOpenAction={setOpenLogout}
        action={() => {
          logout();
          router.push("/login");
        }}
        title="Logout from Tools Management System"
        message="Are you sure you want to logout?"
        labels={{ confirm: "Logout" }}
      />
    </Fragment>
  );
}
