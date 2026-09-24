"use client";

import dynamic from "next/dynamic";
import type { ProjectMapProps } from "./ProjectMap";

const ProjectMap = dynamic(() => import("./ProjectMap"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-olive-100" aria-hidden="true" />,
});

export function ProjectMapLoader(props: ProjectMapProps) {
  return <ProjectMap {...props} />;
}
