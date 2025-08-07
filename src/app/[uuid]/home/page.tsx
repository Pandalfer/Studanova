"use client";
import React from "react";

interface PageProps {
  params: Promise<{ uuid: string }>;
}

export default function LoggedInHome({ params }: PageProps) {
  const { uuid } = React.use(params);

  return <div className={"w-full h-full bg-red-400"}>{uuid}</div>;
}
