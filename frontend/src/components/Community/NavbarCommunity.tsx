"use client";

import { Users, GraduationCap, Calendar, User, Trophy, Info } from "lucide-react";

import { NavBar } from "@/components/ui/Community/tubelight-navbar";

export function NavBarCommunity() {
  const navItems = [
    { name: "Comunidad", url: "/community", icon: Users, active: true },
    { name: "Classroom", url: "/classroom", icon: GraduationCap },
    { name: "Calendario", url: "/calendar", icon: Calendar },
    { name: "Miembros", url: "/members", icon: User },
    { name: "Ranking", url: "/leaderboards", icon: Trophy },
  ];

  return <NavBar items={navItems} />;
}