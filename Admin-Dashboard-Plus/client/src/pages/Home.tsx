import { Redirect } from "wouter";

// Simple redirect for now - landing page isn't specified so we go to members
export default function Home() {
  return <Redirect href="/members" />;
}
