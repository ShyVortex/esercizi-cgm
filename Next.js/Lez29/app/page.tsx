import type React from "react";
import { redirect } from "next/navigation";

export default function Home(): React.ReactElement {
  redirect("/profile");
}
