"use client";

import { ReactNode } from "react";
import { Providers } from "./providers";
import { SpeedInsights } from "@vercel/speed-insights/next"

export default function RootLayout({
	children,
}: Readonly<{
	children: ReactNode;
}>) {
	return (
		<html lang="en">
			<body>
				<Providers>{children}</Providers>
				<SpeedInsights/>
			</body>
		</html>
	);
}
