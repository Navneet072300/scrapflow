"use client";

import { ParamProps } from "@/types/appNode";

const BrowserInstanceParams = ({ param }: ParamProps) => {
  return <p className="text-xs">{param.name}</p>;
};

export default BrowserInstanceParams;
