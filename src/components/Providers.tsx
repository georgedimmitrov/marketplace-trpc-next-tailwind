"use client";

import React, { useState } from "react";
import { QueryClient } from "@tanstack/react-query";

const Providers = () => {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() => trpc.createClient());

  return <div></div>;
};

export default Providers;
